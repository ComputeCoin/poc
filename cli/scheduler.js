const Web3 = require("web3");
const Web3Personal = require('web3-shh');
const async = require("async");
const WebsocketProvider = require("web3-providers-ws");
const identities = require("./identities.json");
const jsyaml = require("js-yaml");
const uuidv1 = require('uuid/v1');

var log = console.log;

var scheduler = null;
var walletManager = null;

function getScheduler(){
  return scheduler;
}

function initialize(logger, wmanager) {

  walletManager = wmanager;

  log = logger;

  scheduler = {
    jobs:[],
    bids:[]
  };

  log("Listening for Jobs");
  log("Listening for Compute Nodes");

  var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

  var shh = new Web3Personal('ws://localhost:8546');

  //notify accountant
  payloadStr = JSON.stringify({
    "type": "nodeLaunchedMessage",
    "nodeType": "scheduler",
    "nodeId": uuidv1(),
    "msg": "scheduler launched"
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

  shh.subscribe("messages", {
    symKeyID: identities.symKeyID,
    topics: ['0x12345678'],
    ttl:10,
    minPow: 0
  }, function(err, message, subscription) {

    if(message) {
      var jsonPayload = JSON.parse(web3.toAscii(message.payload));
      console.log(jsonPayload);
      if(jsonPayload.type=="job" && !jsonPayload.bidid) {
        log("job has arrived");
        log(JSON.stringify(jsonPayload, null, 2));
        var compose = jsonPayload["compose"];
        composeYaml = jsyaml.safeLoad(compose);
        jsonPayload.composeYaml = composeYaml;
        scheduler.jobs.push(jsonPayload);
      }
      else if(jsonPayload.type=="bid"){
        log("compute node has arrived");
        log(JSON.stringify(jsonPayload, null, 2));
        scheduler.bids.push(jsonPayload);
      }
    }

  });


  function matchJobsToBids() {

    if(scheduler.bids.length > 0 && scheduler.jobs.length > 0) {
      log("we have enough jobs and bids to match");
      var job = scheduler.jobs.pop();
      job.msg = "job matched with compute node";
      var bid = scheduler.bids.pop();
      console.log("popping jobs and bids..");
      job.bidid = bid.bidid;
      walletManager.addToBalance(.01);
      shh.post({
           symKeyID: identities.symKeyID, // encrypts using the sym key ID
           sig: identities.signature, // signs the message using the keyPair ID
           ttl: 10,
           topic:  '0x12345678',
           payload:  web3.fromAscii(JSON.stringify(job)),
           powTime: 1,
           powTarget: 0.2
       }, function(err, response){
        log(err, response);
       });
    }
    setTimeout(matchJobsToBids, 3000);
  }

  matchJobsToBids();
}

module.exports.initialize = initialize;
module.exports.getScheduler = getScheduler;
