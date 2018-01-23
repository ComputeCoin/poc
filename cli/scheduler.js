const Web3 = require("web3");
const Web3Personal = require('web3-shh');
const async = require("async");
const WebsocketProvider = require("web3-providers-ws");
const identities = require("./identities.json");

if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  // set the provider you want from Web3.providers
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}

console.log(identities);

var shh = new Web3Personal('ws://127.0.0.1:8546');

shh.subscribe("messages", {
  symKeyID: identities.symKeyID,
  topics: ['0x12345678'],
  ttl:10,
  minPow: 0
}, function(err, message, subscription) {
  console.log(err, message);
  if(message) {
    console.log(web3.toAscii(message.payload));
  }
  //console.log(err, message);

});
