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

if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  // set the provider you want from Web3.providers
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}

var shh = new Web3Personal('ws://127.0.0.1:8546');

shh.net.getId(function(err, id){
  console.log("peerid", err, id);
});

var _swarmCommandToken = {};

function saveDockerImageLocally(imageName, callback) {

	// execute
	// docker save imageName -o cluster-img.tar
	var tarfile = 'cpucoin.' + imageName + '.tar';
	let command = 'docker save ' + imageName + ' -o ' + tarfile;
	console.log('Executing command, ', command);

	exec(command, function(err, stdout, stderr){
    console.log(err, stdout, stderr);
    callback(err, tarfile);
  });
}

function pushDockerImageToIPFS(localImageTarFile, callback) {
  command = "ipfs add ./" + localImageTarFile;
  exec(command, function(err, stdout, stderr){
    console.log(err, stdout, stderr);
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

function sendJob(dockerComposeFile, callback) {
  var contents = fs.readFileSync(dockerComposeFile, "utf-8");
  var doc = jsyaml.safeLoad(contents);
  var jobid = uuidv1();
  doc.cpucoin_jobid = jobid;
  //iterate over services, grab images, store them, add image hashes
  var services = Object.keys(doc.services);
  async.eachSeries(services, function(serviceKey, done){
      console.log(serviceKey);

      var service = doc.services[serviceKey];

      getDockerIPFSHash(service.image, function(err, hash) {
        service.imageIPFS = hash;
        done();
      });
  },
  function(err) {
    var yaml = jsyaml.safeDump(doc);
    console.log(yaml);

    var sent = shh.post({
         symKeyID: identities.symKeyID, // encrypts using the sym key ID
         sig: identities.signature, // signs the message using the keyPair ID
         ttl: 10,
         topic:  '0x12345678',
         payload:  yaml,
         powTime: 1,
         powTarget: 0.2
     }, function(err, response){
     });
  }
  );

   // // //start listening for results from scheduler
   // shh.subscribe("messages", {
   //   symKeyID: identities.symKeyID,
   //   topics: ['0x12345678'],
   //   ttl:10,
   //   minPow: 0
   // }, function(err, message, subscription) {
   //   if(message) {
   //     console.log(web3.toAscii(message.payload));
   //   }
   //
   // });

}

sendJob("./docker-compose.yml", function(err){

});

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
