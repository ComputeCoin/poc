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

var shh = new Web3Personal('ws://127.0.0.1:8546');

var jobDescription = {
  "type":"job",
  "numInstances":2,
  "imageLocation":"ipfshash1"
}

function send() {
  var sent = shh.post({
       symKeyID: identities.symKeyID, // encrypts using the sym key ID
       sig: identities.signature, // signs the message using the keyPair ID
       ttl: 10,
       topic:  '0x12345678',
       payload:  web3.fromAscii(JSON.stringify(jobDescription)),
       powTime: 1,
       powTarget: 0.2
   }, function(err, response){
   });

   setTimeout(send, 10000);
}

send();
