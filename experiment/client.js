var fs = require('fs');
var path = require('path');
var http2 = require('..');
var urlParse = require('url').parse;
var ROUND_ROBIN = require('../lib/protocol/endpoint-manager').ROUND_ROBIN;
var MOST_VACANT = require('../lib/protocol/endpoint-manager').MOST_VACANT;
var util = require('util')
var options = {};
options.connections = [];

var urls;
options.log = require('../test/util').createLogger('client');
if ([ROUND_ROBIN, MOST_VACANT].indexOf(process.argv[2]) >= 0) {
  options.strategy = process.argv[2];
  urls = (process.argv[3] && process.argv.slice(3)) || ['http://localhost:8080', 'http://localhost:8081'];
} else {
  options.strategy = MOST_VACANT;
  urls = (process.argv[2] && process.argv.slice(2)) || ['http://localhost:8080', 'http://localhost:8081'];
}

urls.forEach(function (url) {
  options.connections.push(urlParse(url))
});

var agent = new http2.Agent(options);
var REQUEST_NUMBER = 100;
var resCount = 0;

agent.request({
  method: 'POST',
  protocol: 'http',
  connections: options.connections,
  path: '/init',
  plain: true,
  src: true,
}).then(function (request) {
  request.end('');
  request.on('response', function (res) {
    console.time('timer');
    doRequest(REQUEST_NUMBER);
  });
}).catch(function (err) {
  console.error(err);
  process.exit(1);
});

function doRequest(i) {
  setImmediate(function () {
    if (i == 0) return;
    agent.request({
      method: 'POST',
      protocol: 'http',
      'content-type': 'image/png',
      connections: options.connections,
      path: '/image',
      plain: true,
      src: true,
    }).then(function (request) {
      request.on('error', function (err) {
        console.error(err);
      });
      fs.createReadStream(__dirname + '/images/img0.png').pipe(request);
      request.on('response', function (res) {
        res.on('data', function (data) {
          if (++resCount == REQUEST_NUMBER) {
            console.timeEnd('timer');
            process.exit(0);
          }
        })
      });
    }).catch(function (err) {
      console.error(err);
      process.exit(1);
    });
    doRequest(i - 1);
  })
};
