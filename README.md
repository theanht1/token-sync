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
  "mnemonic": "{MNEMONIC}"
} > secrets.json
```

* Edit token holder in `conf/config.json`

* Migration
```
truffle migrate --reset --compile-all --network ganache
```
