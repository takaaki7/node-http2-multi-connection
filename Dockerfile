FROM ubuntu:14.04

ENV TZ=Asia/Tokyo
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
RUN apt-get update && apt-get install -y curl rsync openssh-server build-essential iptables
ENV PATH $PATH:/node-v4.2.1-linux-x64/bin
ENV HTTP2_LOG=info
ADD ./ sources
ADD ./addfiles/node-v4.2.1-linux-x64.tar.gz /
ADD ./addfiles/ /

#set label to find this container by "docker ps --filter"
EXPOSE 8080 8081
ENTRYPOINT ["bash"]
