#!/bin/sh
sudo tc qdisc add dev eth0 root netem delay 20ms
iptables -A INPUT -m statistic --mode random --probability $1 -j DROP
shift
node $*
