# Token synchronize demo between two chains

### Installation
```
npm install -g truffle
npm install
```

### Up and running

* Change address of main-chain and side-chain node in `truffle.js`

* Configure `config.json`. E.g:
```
{
    "MAIN_CHAIN_URL": "http://localhost:8545",
    "MAIN_CHAIN_ID": 421,
    "SIDE_CHAIN_URL": "http://localhost:8546",
    "SIDE_CHAIN_ID": 422,
    "SERVER_ADDRESS": "http://localhost:3000"
}
```

* Copy private keys to `secrets.json` file
```
echo `{
  "privateKeys": [
    "{PRIVATE_KEY_1}"
  ]
} > secrets.json
```

* Edit token holder in `conf/config.json`

* Migration
```
truffle migrate --reset --compile-all --network mainchain && truffle migrate --reset --network sidechain
```

* Start node server
```
npm run server
```

* Start GUI
```
npm run dev
```

* Notice: if you want to reset/re-deploy contracts, you have to clear old events in mongodb:
```
mongo
use token
db.events.drop()
```
