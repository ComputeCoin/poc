var isDependancyInstalled = () => {
	// execute shell script to check if docker and IPFS
	// is installed
};

// Write docker-compose.yml for launching docker swarm
//
function writeDockerCompose(imagename, ninstances, ncpus, mem, clusterports) {
		// write docker-compose.yml
		let ncpusStr = '/"' + ncpus + '/" \n';
		let portStr = '/"' + clusterports + '/" \n';
		let composeData = {
			version:'3',
			services:{
        web:{
          image: imagename,
          deploy:{
            replicas:ninstances,
            resources:{
              limits:{
                cpus:ncpusStr,
                memory:mem
              }
            },
            restart_policy:{
              condition:'on-failure'
            }
          },
          ports:portStr,
          networks:'webnet'
        }
      },
			networks: {
				webent:' '
			}
		};

		writeYaml.sync('./docker-compose.yml', composeData);
}

// - Define the cluster or swarm with docker_config.yml
// - Docker Engine is used to launch a docker cluster or swarm
// by Job Submitter using docker-compose.yml
// - Store the command and token returned on launching docker
// cluster or swarm
//
function initializeSwarm() {
	writeDockerCompose(_imagename, _ninstances, _ncpus, _memory, _ports);

	let command = 'docker swarm init';
	// exec(command, err, stdout, stdin) {
	// 	if (err) {
	// 		console.log('An error occured executing ', command);
	// 		console.log(err);
	// 	}
  //
	// 	console.log('Swarm initialized');
	// 	getSwarmCommandToken(stdout);
	// });
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
	// let command = 'docker swarm join-token manager');
	// exec(command, (err, stdout, stdin) {
	// 	if(err) {
	// 		console.log('An error occured executing ', command);
	// 		console.log(err);
	// 	}
  //
	// 	console.log(stdout);
	// });
}
