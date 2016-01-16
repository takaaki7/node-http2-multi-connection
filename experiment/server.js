var fs = require('fs');
var path = require('path');
var http2 = require('..');
var ip = require('ip');
var util = require('util');
// We cache one file to be able to do simple performance tests without waiting for the disk
var cachedFile = fs.readFileSync(path.join(__dirname, './server.js'));
var cachedUrl = '/server.js';

// The callback to handle requests
var index = 0;
function onRequest(request, response) {

  if (request.url == "/init") {
    index = 0;
    rmRecursively(__dirname + '/receives');
    response.end('ok');
  } else {
    request.pipe(fs.createWriteStream(__dirname + '/receives/img' + (index++) + '.png'));

    request.on('end', function () {
      response.end('ok');
    });
  }
}

// Creating a bunyan logger (optional)
var log = require('../test/util').createLogger('server');

// Creating the server in plain or TLS mode (TLS mode is the default)
var server;
server = http2.raw.createServer({
  log: log
}, onRequest);

var myIp = ip.address();
var args = process.argv.slice(2);
if (args.length === 0) args = [myIp + ':' + 8080, myIp + ':' + 8081];

var hostsAndPorts = [];
for (var i = 0, len = args.length; i < len; i++) {
  var tmp = args[i].split(':');
  if (tmp.length === 1) {
    hostsAndPorts[i] = {host: myIp, port: tmp[0]};
  } else {
    hostsAndPorts[i] = {host: tmp[0], port: tmp[1]};
  }
}

server.listen(hostsAndPorts);

function rmRecursively(dir) {
  var list = fs.readdirSync(dir);
  for (var i = 0; i < list.length; i++) {
    var filename = path.join(dir, list[i]);
    var stat = fs.statSync(filename);

    if (filename == "." || filename == "..") {
      // pass these files
    } else if (stat.isDirectory()) {
      // rmdir recursively
      rmdir(filename);
    } else {
      // rm fiilename
      fs.unlinkSync(filename);
    }
  }
};
