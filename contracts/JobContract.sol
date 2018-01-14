pragma solidity ^0.4.17;

contract JobContract {

  uint index;
  uint numInstances;
  address requester;
  address supervisor;


  enum State { NotReady, Ready, Running, Completed }

  State state;

  event state;

  function JobContract(uint _index, address _requester, uint _numInstances) public {
    index = _index;
    requester = _requester;
    supervisor = msg.sender.address;
    numInstances = _numInstances;
  }

  struct Bid {
    address bidder; //instance that is bidding on job
    String ip;
    uint port;
    uint index;
  }

  Bid[] bids;

  function addBid(address bidder, String ip, uint port, uint index) public {
    Bid bid = new Bid();
    bid.bidder = bidder;
    bid.ip = ip;
    bid.port = port;
    bid.index = index;
    bids.push(bid);
  }


}
