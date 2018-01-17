const Web3 = require("web3");
const TruffleContract = require("truffle-contract")
//const request = require("request");

if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  // set the provider you want from Web3.providers
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}

console.log(Web3);
const ComputeContractJSON = require('../build/contracts/Compute.json');
const JobContractJSON = require('../build/contracts/JobContract.json');

console.log("contract jsons loaded");
const singletonAddress = "0x4400bd1df1c33743bc09cafaabd1af4b031c4465";
//ComputeContractJSON.address = singletonAddress;
const computeContract = TruffleContract(ComputeContractJSON);

console.log("compute contract loaded");
// Set the provider for our contract
computeContract.setProvider(web3.currentProvider);

console.log("compute contract provider attached");

computeContract.deployed()
  .then(function(computeContractInstance) {
    console.log("compute contract deployed and instance created", computeContractInstance);
    computeContractInstance.totalJobs().then(function(response){
      console.log("totalJobs=", response);
    });

    web3.eth.getAccounts(function(error, accounts) {
      console.log(error, accounts);
      if (error) {
        console.log(error);
      }

      var account = accounts[1];
      balance = web3.eth.getBalance(account);
      console.log("balance", balance);
      console.log("the currenct account is", account);
      computeContractInstance.createJob(2, "i", {from:account, gas:1000000}).then(function(response){
        console.log("job created", response);
      })
      .catch(function(err) {
        console.log("error creating job", err);
      });

    });

  })
  .catch(function(err) {
    console.log(err.message);
  });
