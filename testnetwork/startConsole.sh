#!/bin/bash

geth --identity "ComputeCoinTestNetwork" --wsorigins "*" --rpc  --shh --rpcport "8545" --rpcaddr "0.0.0.0" --ws --wsport "8546" --wsaddr "0.0.0.0" --rpccorsdomain "*" --datadir "./data" --port "30303" --nodiscover --rpcapi "db,eth,net,web3,shh,personal,admin" --networkid 1999 console
