pragma solidity ^0.4.17;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Compute.sol";

contract TestCompute {
  Compute compute = Compute(DeployedAddresses.Compute());

  // Testing the createJob() function
  function testCreateJob2() public {

    uint totalJobs = compute.totalJobs()+1;
    uint returnedId = compute.createJob(1, "xxxx");

    //Assert.equal(totalJobs, returnedId, "job id dont match");
  }
}
