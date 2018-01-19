#!/bin/bash

geth --identity "ComputeCoinTestNetwork" --wsorigins "*" --rpc  --shh --rpcport "8545" --ws --wsport "8546" --rpccorsdomain "*" --datadir "./data" --port "30303" --nodiscover --rpcapi "db,eth,net,web3,shh,personal,admin" --networkid 1999 console
