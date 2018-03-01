const Web3 = require("web3");
const Web3Personal = require('web3-shh');
const async = require("async");
const WebsocketProvider = require("web3-providers-ws");
const identities = require("./identities.json");
const fs = require("fs");
const jsyaml = require("js-yaml");
const writeYaml = require('write-yaml');
const { exec } = require('child_process');
const uuidv1 = require('uuid/v1');


var web3 = null;
var shh = null;
var _swarmCommandToken = {};

var log = console.log;
var jobs = [];
var walletManager = null;

function initialize(logger, wmanager) {
  log = logger;
  walletManager = wmanager;

  // set the provider you want from Web3.providers
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

  shh = new Web3Personal('ws://localhost:8546');

  //notify accountant
  setTimeout(function() {
    payloadStr = JSON.stringify({
      "type": "nodeLaunchedMessage",
      "nodeType": "jobsubmitter",
      "nodeId": uuidv1(),
      "msg": "jobsubmitter launched"
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
      console.log("JOB SUBMITTER ERROR", err, response);
     });
     //done notifying accountant
  },60000);


  shh.subscribe("messages", {
    symKeyID: identities.symKeyID,
    topics: ['0x12345678'],
    ttl:10,
    minPow: 0
  }, function(err, message, subscription) {

    if(message) {
      var jsonPayload = JSON.parse(web3.toAscii(message.payload));
      console.log(jsonPayload);
      if(jsonPayload.type=="job") {
        log("job has arrived");
        log(JSON.stringify(jsonPayload, null, 2));

        for(var i=0; i<jobs.length; i++) {
          var myJob = jobs[i];
          if(myJob.jobid==jsonPayload.jobid) {
            myJob.bidid = jsonPayload.bidid;
            myJob.status="running";
            myJob.startTime = new Date();
            break;
          }
        }

      }
    }

  });
}


function saveDockerImageLocally(imageName, callback) {

	// execute
	// docker save imageName -o cluster-img.tar
	//
	var filename = imageName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
	var tarfile = 'cpucoin.' + filename + '.tar';
	let command = 'docker save ' + imageName + ' -o ' + tarfile;
	log('Executing command, ', command);

	exec(command, function(err, stdout, stderr){
    log("docker image exported to tar file");
    callback(err, tarfile);
  });
}

function pushDockerImageToIPFS(localImageTarFile, callback) {
  command = "ipfs add ./" + localImageTarFile;
  exec(command, function(err, stdout, stderr){
    log("docker image posted to ipfs")
    //grab ipfs hash
    var hash = stdout.split(" ")[1]
    callback(err, hash);
  });
}

function getDockerIPFSHash(imageName, callback) {
  saveDockerImageLocally(imageName, function(err, localTar) {
    pushDockerImageToIPFS(localTar, callback);
  });
}

function getJobs() {
  return jobs;
}

function sendJob(name, dockerComposeFile, token, ipport, callback) {
  var contents = fs.readFileSync(dockerComposeFile, "utf-8");
  var doc = jsyaml.safeLoad(contents);
  var jobid = uuidv1()
  var payload = {
    "type":"job",
    "jobid": jobid,
    "token": token,
    "ipport": ipport,
    "name":name,
    "status": "pending",
    "started": new Date(),
    "msg": "job " + jobid + "submitted"
  }

  jobs.push(payload);
  callback(null, payload);

  //iterate over services, grab images, store them, add image hashes
  var services = Object.keys(doc.services);
  async.eachSeries(services, function(serviceKey, done){
      //console.log(serviceKey);

      var service = doc.services[serviceKey];

      getDockerIPFSHash(service.image, function(err, hash) {
        service.imageIPFS = hash;
        done();
      });
  },
  function(err) {
    var yaml = jsyaml.safeDump(doc);
    console.log(yaml);

    payload.compose = yaml;

    // var payload = {
    //   "type":"job",
    //   "jobid": uuidv1(),
    //   "compose": yaml,
    //   "token": token,
    //   "ipport": ipport
    // };

    console.log(payload);
    //jobs.push(payload);

    payloadStr = JSON.stringify(payload, null, 2);

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
      payload.sent = true;
      payload.schedulerResponse = response;
      payload.status="queued"
      walletManager.addToBalance(-3);
     });
  }
  );

}


module.exports.sendJob = sendJob;
module.exports.initialize = initialize;
module.exports.getJobs = getJobs;

//
// var composeFile = process.argv[2];
// var token = process.argv[3];
// var ipport = process.argv[4];
// sendJob(composeFile, token, ipport, function(err){
// });

// //sendJob("./docker-compose.yml");
// saveDockerImageLocally("hello-world", function(err, filename) {
//   console.log(err, filename);
//   pushDockerImageToIPFS(filename, function(err, hash) {
//     console.log(err, hash);
//     sendJob("./docker-compose.yml", hash, function(err){
//       console.log(err);
//     });
//   })
// });
