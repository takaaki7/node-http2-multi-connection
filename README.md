node-http2-multi-connection
==========================

This repository is just for experiment, not for production.

Overview
-----

HTTP/2 use single TCP connection, while HTTP/1 use multi(4~6) TCP connection when a browser request a web site resource from a server.

node-http2-multi-connection use multi connection for HTTP/2.

experiment/client.js measure the time of sending 100 image files to server.

Following command start server and client docker container, execute experiment/server.js  and experiment/client.js on each container, print result on console.
```
docker-compose up
```