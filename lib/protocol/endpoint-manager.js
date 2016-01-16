var assert = require('assert');
exports.EndpointManager = EndpointManager;

var ROUND_ROBIN = 'round_robin';
var MOST_VACANT = 'most_vacant';
var MOST_VACANT_LAZY = 'most_vacant_lazy';
exports.ROUND_ROBIN = ROUND_ROBIN;
exports.MOST_VACANT = MOST_VACANT;
exports.MOST_VACANT_LAZY = MOST_VACANT_LAZY;

function EndpointManager(log, strategy) {
  this._log = log.child({component: 'endpoint', e: this});

  this.endpoints = [];
  this._lastIndex = 0;
  this._strategy = strategy;
  this._log.info('strategy is ' + strategy);
}

EndpointManager.prototype.addEndpoint = function addEndpoint(endpoint) {
  this.endpoints.push(endpoint);
};

EndpointManager.prototype.createStream = function createStream() {
  assert(this.endpoints.length > 0);
  return new Promise((resolve, reject) => {
    switch (this._strategy) {
      case ROUND_ROBIN:
        resolve(this._createStreamRoundRobin());
        break;
      case MOST_VACANT:
        resolve(this._createStreamMostVacant());
        break;
      case MOST_VACANT_LAZY:
        resolve(this._createStreamMostVacantLazy());
        break;
      default:
        reject(new Error('strategy ' + this.strategy + ' is not supported.'))
    }
  })
};

EndpointManager.prototype._createStreamRoundRobin = function _createStreamRoundRobin() {
  if (this._lastIndex < this.endpoints.length - 1) {
    this._lastIndex++;
  } else {
    this._lastIndex = 0;
  }
  var ret = this.endpoints[this._lastIndex];
  this._log.info('select ' + this._lastIndex + ', window' + ret.connection._window);
  return Promise.resolve(this.endpoints[this._lastIndex].createStream());
};

EndpointManager.prototype._createStreamMostVacant = function _createStreamMostVacant() {
  var ret = this.endpoints.reduce((prev, current, i) => {
    var currentScore = scoreVacant(current.connection);
    return prev.score < currentScore ? prev : {score: currentScore, endpoint: current, i: i}
  }, {score: Infinity});
  this._log.info('select ' + ret.i + ', window' + ret.endpoint.connection._window);
  return Promise.resolve(ret.endpoint.createStream());
};

EndpointManager.prototype._createStreamMostVacantLazy = function _createStreamMostVacantLazy() {
  // implement great logic
  return Promise.resolve(endpoint[0].createStream());
};

function scoreVacant(connection) {
  return connection._streamIds.reduce(function (prev, current, i) {
    return i === 0 ? 0 : (prev + (isActiveState(current.state) ? 1 : 0));
  }, 0);
}

function isActiveState(state) {
  return ((state === 'HALF_CLOSED_LOCAL') || (state === 'HALF_CLOSED_REMOTE') || (state === 'OPEN'));
}