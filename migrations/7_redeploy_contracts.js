var Compute = artifacts.require("Compute");
var JobContract = artifacts.require("JobContract");

module.exports = function(deployer) {
  deployer.deploy(Compute);
  deployer.deploy(JobContract);
};
