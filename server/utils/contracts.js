const HDWalletProvider = require('truffle-hdwallet-provider-privkey');
const fs = require('fs');
const contract = require('truffle-contract');
const { signing } = require('eth-lightwallet');

const tokenArtifact = require('../../build/contracts/Token.json');
const { MAIN_CHAIN_URI, SIDE_CHAIN_URI } = require('../../config.json');

let secrets;
let privateKeys = [];

if (fs.existsSync('secrets.json')) {
  secrets = JSON.parse(fs.readFileSync('secrets.json', 'utf8'));
  ({ privateKeys } = secrets);
}

// Mainchain contract
const mainProvider =  new HDWalletProvider(privateKeys, MAIN_CHAIN_URI);
const MainToken = contract(tokenArtifact);
MainToken.setProvider(mainProvider);

// Sidechain contract
const sideProvider =  new HDWalletProvider(privateKeys, SIDE_CHAIN_URI);
const SideToken = contract(tokenArtifact);
SideToken.setProvider(sideProvider);

// Defailt account
const account = mainProvider.getAddress();

const getInstances = async () => {
  const mainTokenInstance = await MainToken.deployed();
  const sideTokenInstance = await SideToken.deployed();
  return {
    mainTokenInstance,
    sideTokenInstance,
  };
}

const sign = (msg) => {
  const signedMsg = signing.signMsgHash(msg, privateKeys[0]);
  return signing.concatSig(signedMsg);
};

module.exports = {
  account,
  MainToken,
  SideToken,
  getInstances,
  sign,
};
