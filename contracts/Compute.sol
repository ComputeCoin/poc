pragma solidity ^0.4.17;

contract Compute {

  address public supervisor; //this is also the owner

  struct Bid {
    address bidder; //instance that is bidding on job
    String ip;
    uint port;
    uint index;
    //Resource recourse; //description of the resources available
  }

  struct Job {
    //byte identifier;
    uint index;
    uint numInstances;
    address requester; //who is asking for a job
    Bid[] bids = new Bid[]();
  }

  Job[] jobs;
  Job[] runningJobs;


  //i think this atomic
  function createJob(uint numInstances) {
    Job job = new Job();
    job.index = jobs.push(job)-1;
    job.numInstances = numInstances;
    job.requester = msg.sender.address;
  }

  function public view totalJobs() {
    return jobIdentifiers.length;
  }

  function retrieveJob(uint identifier) {
    return jobIdentifiers[identifier];
  }

  function createBid(String ip, uint port) {
    Job first = jobs[0];

    Bid bid = new Bid();
    bid.ip = ip;
    bid.port = port;
    bid.address =  msg.sender.address;
    bid.index = first.bids.push(bid);

    if(first.bids.length == first.numInstances) {
      delete jobs[0];
      runningJobs.push(first);
      //uint _index, address _requester
      JobContract jc = new JobContract(first.index, first.requester, first.numInstances);

      //does this work properly?
      for(int i=0; i<job.bids.length; i++) {
        Bid b = job.bids[i];
        jc.addBid(b.bidder, b.ip, b.port, b.index);
      }

    }
  }

  function completeJob(uint index) {
    delete runningJobs[index];
  }


}
