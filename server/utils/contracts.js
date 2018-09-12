const HDWalletProvider = require('truffle-hdwallet-provider');
const fs = require('fs');
const contract = require('truffle-contract');

const tokenArtifact = require('../../build/contracts/Token.json');
const { MAIN_CHAIN_URI, SIDE_CHAIN_URI } = require('../../config.json');

let secrets;
let mnemonic = '';

if (fs.existsSync('secrets.json')) {
  secrets = JSON.parse(fs.readFileSync('secrets.json', 'utf8'));
  ({ mnemonic } = secrets);
}

// Mainchain contract
const mainProvider =  new HDWalletProvider(mnemonic, MAIN_CHAIN_URI);
const MainToken = contract(tokenArtifact);
MainToken.setProvider(mainProvider);

// Sidechain contract
const sideProvider =  new HDWalletProvider(mnemonic, SIDE_CHAIN_URI);
const SideToken = contract(tokenArtifact);
SideToken.setProvider(sideProvider);

// Defailt account
const account = mainProvider.getAddress();

module.exports = {
  account,
  MainToken,
  SideToken,
};
