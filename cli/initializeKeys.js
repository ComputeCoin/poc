const Web3Personal = require('web3-shh');
const fs = require("fs");
var shh = new Web3Personal('ws://127.0.0.1:8546');
const WebsocketProvider = require("web3-providers-ws");
shh.setProvider(new WebsocketProvider('ws://127.0.0.1:8546'))

var identities = {};
//create new sym key
shh.newSymKey(function(err, response) {
  identities["symKeyID"]=response;

  shh.newKeyPair(function(err, response){
    identities["signature"] = response;
    fs.writeFileSync("./identities.json", JSON.stringify(identities,null,2));
    process.exit();
  });

});
