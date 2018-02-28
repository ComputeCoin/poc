const Web3 = require("web3");
const Web3Personal = require('web3-shh');
const async = require("async");
const WebsocketProvider = require("web3-providers-ws");
const identities = require("./identities.json");
const jsyaml = require("js-yaml");

var log = console.log;

function initialize(logger) {

  log = logger;

  log("Listening for Jobs");
  log("Listening for Compute Nodes");

  var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

  var shh = new Web3Personal('ws://localhost:8546');

  var jobs = [];
  var bids = [];

  shh.subscribe("messages", {
    symKeyID: identities.symKeyID,
    topics: ['0x12345678'],
    ttl:10,
    minPow: 0
  }, function(err, message, subscription) {

    if(message) {
      var jsonPayload = JSON.parse(web3.toAscii(message.payload));

      if(jsonPayload.type=="job") {
        log("job has arrived");
        log(JSON.stringify(jsonPayload, null, 2));
        var compose = jsonPayload["compose"];
        composeYaml = jsyaml.safeLoad(compose);
        jsonPayload.composeYaml = composeYaml;
        jobs.push(jsonPayload);
      }
      else {
        log("compute node has arrived");
        log(JSON.stringify(jsonPayload, null, 2));
        bids.push(jsonPayload);
      }
    }

  });


  function matchJobsToBids() {

    if(bids.length > 0 && jobs.length > 0) {
      log("we have enough jobs and bids to match");
      var job = jobs.pop();
      var bid = bids.pop();
      job.bidid = bid.bidid;
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
