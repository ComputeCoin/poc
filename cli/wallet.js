const Web3 = require("web3");
const Web3Personal = require('web3-shh');
const async = require("async");
const WebsocketProvider = require("web3-providers-ws");
const identities = require("./identities.json");
const jsyaml = require("js-yaml");

var log = console.log;

var wallet = null;

function getWallet(){
  return wallet;
}

function addToBalance(amount) {
  wallet.balance = wallet.balance + amount;
}

function initialize(logger,address) {

  console.log("getting wallet for address", address)
  wallet = {
    "address": address,
    "balance": 1000
  }

}

module.exports.initialize = initialize;
module.exports.getWallet = getWallet;
module.exports.addToBalance = addToBalance;
