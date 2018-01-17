pragma solidity ^0.4.17;

import "./JobContract.sol";

contract Compute {

  address public supervisor; // this is also the owner

  struct Bid {
    address bidder; //instance that is bidding on job
    string ip;
    uint port;
    uint index;
    //Resource recourse; //description of the resources available
  }

  struct Job {
    uint index;
    uint numInstances;
    string manifestFile;
    address requester; //who is asking for a job
    // Bid[] bids;
  }

  Job[] jobs;
  Job[] runningJobs;
  mapping (uint => Bid[]) globalBids;

  //i think this atomic
  function createJob(uint _numInstances, string _manifestFile) public returns (uint) {
    Job memory job = Job(jobs.length,  _numInstances, _manifestFile, msg.sender);
    jobs.push(job);
    return job.index;
  }

  function totalJobs() public view returns(uint jobsLength) {
    return jobs.length;
  }

  function totalJobs2() public view returns(uint jobsLength) {
    return jobs.length;
  }

  // function retrieveJob(uint _index) private returns(Job returnedJob) {
    // return jobs[_index];
  // }

  function createBid(string ip, uint port) public {
    // For some of the compiler warnings - https://github.com/ethereum/solidity/pull/3014
    Job memory first = jobs[0];
    Bid memory bid;
    bid.ip = ip;
    bid.port = port;
    bid.bidder = msg.sender;
    // bid.index = first.bids.length;
    // first.bids[bid.index] = bid;
    globalBids[first.index][bid.index] = bid;

    if(globalBids[first.index].length == first.numInstances) {
      delete jobs[0];
      runningJobs.push(first);
      JobContract jc = new JobContract(first.index, first.requester, first.numInstances, first.manifestFile);

      //does this work properly?
      for(uint i=0; i < globalBids[first.index].length; i++) {
        Bid memory b = globalBids[first.index][i];
        address _bidder = b.bidder;
        string memory _ip = b.ip;
        uint _port = b.port;
        uint _index = b.index;
        jc.addBid(_bidder, _ip, _port, _index);
      }
    }
  }

  function completeJob(uint index) private {
    delete runningJobs[index];
  }


}
