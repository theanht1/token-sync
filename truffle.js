const HDWalletProvider = require('truffle-hdwallet-provider-privkey');
const fs = require('fs');
const config = require('./config.json');

let secrets;
let privateKeys = [];

if (fs.existsSync('secrets.json')) {
  secrets = JSON.parse(fs.readFileSync('secrets.json', 'utf8'));
  ({ privateKeys } = secrets);
}

module.exports = {
  networks: {
    mainnet: {
      provider: new HDWalletProvider(privateKeys, 'https://mainnet.infura.io'),
      network_id: '1',
      gas: 4500000,
      gasPrice: 10000000000,
    },
    rinkeby: {
      provider: new HDWalletProvider(privateKeys, 'https://rinkeby.infura.io'),
      network_id: '*',
      gas: 4500000,
      gasPrice: 25000000000,
    },
    ropsten: {
      provider: new HDWalletProvider(privateKeys, 'https://ropsten.infura.io'),
      network_id: '*',
      gas: 4500000,
      gasPrice: 25000000000,
    },
    mainchain: {
      provider: new HDWalletProvider(privateKeys, config.MAIN_CHAIN_ADDRESS),
      network_id: '*',
      gas: 4500000,
      gasPrice: 10000000000,
    },
    sidechain: {
      provider: new HDWalletProvider(privateKeys, config.SIDE_CHAIN_ADDRESS),
      network_id: '*',
      gas: 4500000,
      gasPrice: 10000000000,
    },
    ganache: {
      provider: new HDWalletProvider(privateKeys, 'http://localhost:8545'),
      network_id: '*',
      gas: 4500000,
      gasPrice: 25000000000,
    },
    private: {
      provider: new HDWalletProvider(privateKeys, 'http://localhost:8501'),
      network_id: '*',
      gas: 4500000,
      gasPrice: 25000000000,
    },
    // config for solidity-coverage
    coverage: {
      host: 'localhost',
      network_id: '*',
      port: 7545, // <-- If you change this, also set the port option in .solcover.js.
      gas: 0xfffffffffff, // <-- Use this high gas value
      gasPrice: 0x01, // <-- Use this low gas price
    },
  },
};

