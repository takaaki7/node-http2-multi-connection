#!/bin/sh
tc qdisc add dev eth0 root netem delay 20ms
node $*