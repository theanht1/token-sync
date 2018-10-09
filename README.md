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

### Server
There are two options to start server

1. Node server
```
npm run server
```

2. Python server
```
cd py_server
python3 -m venv venv

. venv/bin/activate
pip install 0r requirements.txt

# Start server
FLASK_APP=api/app.py FLASK_ENV=development python -m flask run -p 3000

# Start event listener in another terminal
python events_listener.py
