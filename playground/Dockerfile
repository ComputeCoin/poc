FROM ubuntu:latest

EXPOSE 8545
EXPOSE 8546
EXPOSE 30303

# Replace shell with bash so we can source files
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

#update apt-get
RUN apt-get update

#install curl
RUN apt-get -qq -y install curl

#install wget
RUN apt-get install -y wget


#install nvm and node
ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION 8.9.4

RUN curl https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash \
    && source $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

#confirm install
RUN node -v
RUN npm -v

#install truffle
RUN npm install -g truffle

#install ipfs
RUN apt-get install golang-go -y
RUN wget https://dist.ipfs.io/go-ipfs/v0.4.10/go-ipfs_v0.4.10_linux-386.tar.gz
RUN tar xvfz go-ipfs_v0.4.10_linux-386.tar.gz
RUN mv go-ipfs/ipfs /usr/local/bin/ipfs

#geth
RUN apt-get -y install software-properties-common
RUN add-apt-repository -y ppa:ethereum/ethereum
RUN apt-get -y update
RUN apt-get -y install ethereum
