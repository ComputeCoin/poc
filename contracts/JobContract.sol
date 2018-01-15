pragma solidity ^0.4.17;

contract JobContract {

  uint index;
  uint numInstances;
  address requester;
  address supervisor;
  string manifestFile;


  enum State { Ready, Running, Completed }
  State state;

  function JobContract(uint _index, address _requester, uint _numInstances, string _manifestFile) public {
    index = _index;
    requester = _requester;
    supervisor = msg.sender;
    numInstances = _numInstances;
    manifestFile = _manifestFile;
  }

  struct JobBid {
    address bidder; //instance that is bidding on job
    string ip;
    uint port;
    uint index;
  }

  JobBid[] bids;

  function addBid(address _bidder, string _ip, uint _port, uint _index) public {
    JobBid memory bid;
    bid.bidder = _bidder;
    bid.ip = _ip;
    bid.port = _port;
    bid.index = _index;
    bids.push(bid);
  }

  // function retrieveManifestFile(string _manifestFile) return(string) {
  //   // Get the manifest file from IPFS
  // }

  // function parseManifestFile(string _manifestFile) {
  //   // Parse out resources
  // }

  // function runJob() public {
  //   retrieveManifestFile(manifestFile);
  //    parseManifestFile(manifestFile);
  // }
}
