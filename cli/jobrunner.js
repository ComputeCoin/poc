const Web3 = require("web3");
const Web3Personal = require('web3-shh');
const async = require("async");
const WebsocketProvider = require("web3-providers-ws");
const identities = require("./identities.json");
const uuidv1 = require('uuid/v1');
const { exec } = require('child_process');


var log = console.log

var bid = null;

var walletManager = null;

function getBid() {
  return bid;
}


function updateBalance() {
 if(bid && bid.runningJob) {
   console.log('jobrunner: updateing balance')
   walletManager.addToBalance(.01);
 }
 else {
   console.log('jobrunner: not updating balance')
 }
 setTimeout(updateBalance,60000);
}

function initialize(logger, wmanager) {

  log = logger;

  walletManager = wmanager;

  updateBalance();


  var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

  var shh = new Web3Personal('ws://localhost:8546');

  bid = bidDescription =  {
    "type": "bid",
    "cpus":2,
    "bidid": uuidv1(),
    "memory":50, //mi
    "runningJob":null
  };

  /*
  docker-machine ssh myvm2 "docker swarm join \
  --token <token> \
  <ip>:2377"
   */

   //notify accountant
   payloadStr = JSON.stringify({
     "type": "nodeLaunchedMessage",
     "nodeType": "computenode",
     "nodeId": bid.bidid,
     "msg":"compute node " + bid.bidid + " launched"
   }, null, 2);

   var sent = shh.post({
        symKeyID: identities.symKeyID, // encrypts using the sym key ID
        sig: identities.signature, // signs the message using the keyPair ID
        ttl: 10,
        topic:  '0x12345678',
        payload:  web3.fromAscii(payloadStr),
        powTime: 1,
        powTarget: 0.2
    }, function(err, response){
     console.log(err, response);
    });
    //done notifying accountant


  //listen for launch message specific to my bid
   shh.subscribe("messages", {
     symKeyID: identities.symKeyID,
     topics: ['0x12345678'],
     ttl:10,
     minPow: 0
   }, function(err, message, subscription) {
     //console.log(err, message);
     if(message) {

       var jsonPayload = JSON.parse(web3.toAscii(message.payload));

       if(jsonPayload.type=="job" && jsonPayload.bidid == bidDescription.bidid) {

         log("job has been matched! ", jsonPayload);
         var token = jsonPayload.token;
         var ipport = jsonPayload.ipport;
         bid.runningJob = jsonPayload;
         log(token, ipport);

         //attach to the docker!!!
         var command = 'docker-machine ssh myvm2 "docker swarm join --token ' + token + ' ' + ipport + '"';
         exec(command, function(err, stdout, stderr){
           log(err, stdout, stderr);
         });
         // docker-machine ssh myvm2 "docker swarm join \
         // --token <token> \
         // <ip>:2377"
       }
     }

   });


  var sent = shh.post({
       symKeyID: identities.symKeyID, // encrypts using the sym key ID
       sig: identities.signature, // signs the message using the keyPair ID
       ttl: 10,
       topic:  '0x12345678',
       payload:  web3.fromAscii(JSON.stringify(bidDescription)),
       powTime: 1,
       powTarget: 0.2
   }, function(err, response){
     //console.log("post response", err, response);
   });

}

module.exports.initialize = initialize;
module.exports.getBid = getBid;
