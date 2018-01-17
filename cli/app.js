const Web3 = require("web3");
const TruffleContract = require("truffle-contract")
//const request = require("request");

if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  // set the provider you want from Web3.providers
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));
}

console.log(Web3);
const ComputeContractJSON = require('../build/contracts/Compute.json');
const JobContractJSON = require('../build/contracts/JobContract.json');

console.log("contract jsons loaded");
const computeContract = TruffleContract(ComputeContractJSON);

console.log("compute contract loaded");
// Set the provider for our contract
computeContract.setProvider(web3.currentProvider);

console.log("compute contract provider attached");

computeContract.deployed()
  .then(function(computeContractInstance) {
    console.log("compute contract deployed and instance created");
    computeContractInstance.totalJobs().then(function(response){
      console.log("totalJobs=", response);
    });
    computeContractInstance.createJob.call(2, "imageid1").then(function(response){
      console.log("job created", response);
    })
    .catch(function(err) {
      console.log(err);
    });
  })
  .catch(function(err) {
    console.log(err.message);
  });
