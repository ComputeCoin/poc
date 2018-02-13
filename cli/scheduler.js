const Web3 = require("web3");
const Web3Personal = require('web3-shh');
const async = require("async");
const WebsocketProvider = require("web3-providers-ws");
const identities = require("./identities.json");
const jsyaml = require("js-yaml");


function initialize() {

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
    //console.log(err, message);
    if(message) {
      var jsonPayload = JSON.parse(web3.toAscii(message.payload));
      console.log(jsonPayload);
      if(jsonPayload.type=="job") {
        var compose = jsonPayload["compose"];
        composeYaml = jsyaml.safeLoad(compose);
        jsonPayload.composeYaml = composeYaml;
        jobs.push(jsonPayload);
      }
      else {
        bids.push(jsonPayload);
      }
    }
    //console.log(err, message);

  });


  function matchJobsToBids() {
    if(bids.length > 0 && jobs.length > 0) {
      console.log("WE ARE ABLE TO MATCH!!!!!");
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
        console.log(err, response);
       });
    }
    setTimeout(matchJobsToBids, 1000);
  }


  matchJobsToBids();
}

module.exports.initialize = initialize;
