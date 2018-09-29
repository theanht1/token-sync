const HDWalletProvider = require('truffle-hdwallet-provider-privkey');
const fs = require('fs');
const contract = require('truffle-contract');
const { signing } = require('eth-lightwallet');
const utils = require('ethereumjs-util');


const tokenArtifact = require('../../build/contracts/Token.json');
const { MAIN_CHAIN_URL, SIDE_CHAIN_URL } = require('../../config.json');

let secrets;
let privateKeys = [];

if (fs.existsSync('secrets.json')) {
  secrets = JSON.parse(fs.readFileSync('secrets.json', 'utf8'));
  ({ privateKeys } = secrets);
}

// Mainchain contract
const mainProvider =  new HDWalletProvider(privateKeys, MAIN_CHAIN_URL);
const MainToken = contract(tokenArtifact);
MainToken.setProvider(mainProvider);

// Sidechain contract
const sideProvider =  new HDWalletProvider(privateKeys, SIDE_CHAIN_URL);
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
  const signedMsg = utils.ecsign(utils.toBuffer(msg), Buffer.from(privateKeys[0], 'hex'));
  return signing.concatSig(signedMsg);
};

module.exports = {
  account,
  MainToken,
  SideToken,
  getInstances,
  sign,
};
