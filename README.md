# Token synchronize demo between two chains

### Installation
```
npm install -g truffle
npm install -g ganache
npm install
```

### Up and running

* Start ganache
```
ganache-cli -d
```

* Copy ganache account mnemonic to `secrets.json` file
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
truffle migrate --reset --compile-all --network ganache
```

* Start node server
```
npm run server
```
(Notice: if you want to reset/re-deploy contracts, you have to run `rm -rf db` to clear old events database)

* Start GUI
```
npm run dev
```
