ARG BUILD_FROM=centos:7
FROM ${BUILD_FROM}

LABEL maintainer="Ilya Kutukov <post.ilya@gmail.com>"
LABEL from="https://github.com/CentOS/sig-cloud-instance-images/blob/docker/Dockerfile"

ENV container docker
ARG NODE_VERSION=10.15.1
ENV NODE_VERSION=${NODE_VERSION}

RUN groupadd -r node --gid=1000 && \
    useradd -r -g node --uid=1000 node

RUN rpm --import http://mirror.centos.org/centos/RPM-GPG-KEY-CentOS-5
RUN yum install -y git svn mercurial

COPY setup_node_10_x.sh ./setup_node_10_x.sh
RUN chmod +x ./setup_node_10_x.sh && \
    ./setup_node_10_x.sh && \
    rm -f ./setup_node_10_x.sh && \
    yum install -y nodejs

RUN npm install -g node-gyp yarn pegjs && yarn global add pegjs

RUN mkdir -p /home/node && \
    chown node:node /home/node && \
    mkdir -p /home/node/app && \
    cd /home/node/app

WORKDIR /home/node/app

COPY ./entrypoint.sh /home/node/entrypoint.sh
RUN chmod +x /home/node/entrypoint.sh
USER node

ENTRYPOINT ["/home/node/entrypoint.sh"]
