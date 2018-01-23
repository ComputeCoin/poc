const Web3 = require("web3");
const Web3Personal = require('web3-shh');
const async = require("async");
const WebsocketProvider = require("web3-providers-ws");
const identities = require("./identities.json");
const uuidv1 = require('uuid/v1');
const { exec } = require('child_process');

if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  // set the provider you want from Web3.providers
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}


var shh = new Web3Personal('ws://127.0.0.1:8546');

var bidDescription = {
  "type": "bid",
  "numCores":2,
  "bidid": uuidv1(),
  "memory":2 //gigabytes
};

/*
docker-machine ssh myvm2 "docker swarm join \
--token <token> \
<ip>:2377"
 */

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

       console.log("JOB ARRIVED, YAY!!!", jsonPayload);
       var token = jsonPayload.token;
       var ipport = jsonPayload.ipport;
       console.log(token, ipport);

       //attach to the docker!!!
       var command = 'docker-machine ssh myvm2 "docker swarm join --token ' + token + ' ' + ipport + '"';
       exec(command, function(err, stdout, stderr){
         console.log(err, stdout, stderr);
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
