pragma solidity ^0.4.17;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Compute.sol";

contract TestCompute {
  Compute compute = Compute(DeployedAddresses.Compute());

  // Testing the createJob() function
  function testCreateJob() public {
    uint returnedId = compute.createJob(0, "xxxx");

    uint expected = 1;

    Assert.equal(returnedId, expected, "job with id 1 should be recorded.");
  }
}
