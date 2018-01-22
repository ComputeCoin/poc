const Web3 = require("web3");
const Web3Personal = require('web3-shh');
const async = require("async");
const WebsocketProvider = require("web3-providers-ws");
const identities = require("./identities.json");

const writeYaml = require('write-yaml');
const { exec } = require('child_process');

if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  // set the provider you want from Web3.providers
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}

var shh = new Web3Personal('ws://127.0.0.1:8546');

var _imagename = 'centos:7';
var _ninstances = '2';
var _ncpus = '0.1';
var _memory = '50M';
var _ports = '80:80';
var _swarmCommandToken = {};

var jobDescription = {
  "type":"job",
  "numInstances":2,
  "imageLocation":"ipfshash1",
  "dockerSwarmJoinCommand": _swarmCommandToken.cmd,
  "dockerSwarmToken": _swarmCommandToken.token
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

var isDependancyInstalled = () => {
	// execute shell script to check if docker and IPFS
	// is installed
};

// Write docker-compose.yml for launching docker swarm
//
function writeDockerCompose(imagename, ninstances, ncpus, mem, clusterports) {
		// write docker-compose.yml
		let imageStr = 'image: ' + imagename + '\n';
		let ninstanceStr = 'replicas: ' + ninstances + '\n';
		let ncpusStr = 'cpus: /"' + ncpus + '/" \n';
		let memoryStr = 'memory: ' + mem + '\n';
		let portStr = 'ports: /"' + clusterports + '/" \n';
		let composeData = {
			version:'/"3/"',
			services:[
					web:[
						image: imageStr,
						deploy:[
							replicas:ninstanceStr,
							resources:[
								limits:[
									cpus:ncpusStr,
									memory:memoryStr
								]
							],
							restart_policy:[
								condition:'on-failure'
							]
						],
						ports:[
							portStr
						],
						networks:[
							'webnet'
						]
					]
			],
			networks:[
				webent:''
			]
		};

		writeYaml.sync('./docker-compose.yml', composeData));
	}
}

// - Define the cluster or swarm with docker_config.yml
// - Docker Engine is used to launch a docker cluster or swarm
// by Job Submitter using docker-compose.yml
// - Store the command and token returned on launching docker
// cluster or swarm
//
function initializeSwarm() {
	writeDockerCompose(_imagename, _ninstances, _ncpus, _mem, _clusterports);

	let command = 'docker swarm init');
	exec(command, (err, stdout, stdin) {
		if (err) {
			console.log('An error occured executing ', command);
			console.log(err);
		}

		console.log('Swarm initialized');
		getSwarmCommandToken(stdout);
	});
}

function getSwarmCommandToken(data) {
	// Perform regex on swarm init stdout to get command and token
	let swarmJoinCmd = stdout.split("\n")[2];
	let swarmToken = swarmJoinCmd.split(" ")[4].trim();

	let cmdtoken = {cmd: swarmJoinCmd, token: swarmToken};

	return cmdtoken;
}

_swarmCommandToken = initializeSwarm();


function setSelfAsSwarmManager() {
	let command = 'docker swarm join-token manager');
	exec(command, (err, stdout, stdin) {
		if(err) {
			console.log('An error occured executing ', command);
			console.log(err);
		}

		console.log(stdout);
	});
}

send();
