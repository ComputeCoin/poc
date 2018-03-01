const Web3 = require("web3");
const Web3Personal = require('web3-shh');
const async = require("async");
const WebsocketProvider = require("web3-providers-ws");
const identities = require("./identities.json");
const jsyaml = require("js-yaml");
const uuidv1 = require('uuid/v1');


var accountant = null;

function getAccountant() {
  return accountant;
}

function initialize(logger) {

  log = logger;

  var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

  var shh = new Web3Personal('ws://localhost:8546');

  accountant = {
    "id": uuidv1(),
    "messages":[],
    "nodesLaunched":[]
  };
  

  shh.subscribe("messages", {
    symKeyID: identities.symKeyID,
    topics: ['0x12345678'],
    ttl:10,
    minPow: 0
  }, function(err, message, subscription) {
    //console.log(err, message);
    if(message) {
      var jsonPayload = JSON.parse(web3.toAscii(message.payload));
      if(jsonPayload.type=="nodeLaunchedMessage") {
        accountant.nodesLaunched.push(jsonPayload);
      }
      if(jsonPayload.msg) {
        accountant.messages.push(jsonPayload);
      }
    }
    //console.log(err, message);

  });
}

  module.exports.initialize = initialize;
  module.exports.getAccountant = getAccountant;
