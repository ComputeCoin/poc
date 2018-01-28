//const util = require('util');
//const exec = util.promisify(require('child_process').exec);

const exec = require('child-process-promise').exec;

function saveDockerImageToIPFS(imageName) {

	// execute
	// docker save imageName -o cluster-img.tar
	let command = 'docker save ' + imageName + ' -o cluster-image.tar';
	console.log('Executing command, ', command);

	return exec(command);
}

function pushDockerImageToIPFS() {

	// execute
	// outString = ipfs add ./cluster-img.tar
	var command = 'ipfs add ./cluster-image.tar';
	var hash = ' ';
	console.log('PUSH docker cluster image to IPFS, ', command);
	return exec(command);
}

async function getDockerImageFromIPFS(hash) {
	// execute
	// outString = ipfs add ./cluster-img.tar
	let command = 'ipfs cat ' + hash + ' | tee docker-cluster-img.tar';

	console.log('Get docker cluster image from IPFS, ', command);
	exec(command)
		.then(function(data) {
			console.log('STDOUT');
		)
		.catch(function (err) {
			console.log(err);
		});
}

ipfsSave = saveDockerImageToIPFS('centos:7');
ipfsSave
	.then(function(data){
		dockerImage = pushDockerImageToIPFS();
		var imageHash = ' ';
		dockerImage
			.then(function (data) {
				let stdout = data.stdout;
				let ipfsOutString = stdout.split(" ");

				imageHash = ipfsOutString[1];

				console.log('IPFS Hash string for docker image => ', imageHash);
				getDockerImageFromIPFS(imageHash);
			});
		});
