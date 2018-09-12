import axios from 'axios';
import { default as Web3 } from 'web3';
import { default as contract } from 'truffle-contract';
import BigNumber from 'bignumber.js';

import tokenArtifact from '../../build/contracts/Token.json';
import '../stylesheets/app.css';

axios.defaults.baseURL = 'http://localhost:3000/api';

const TOKEN_CONFIG = {
  decimals: 18,
  symbol: 'COIN',
};

const Token = contract(tokenArtifact);

let accounts;
let account;


// Main app
window.App = {
  start: () => {
    // Bootstrap the Voting abstraction for Use.
    Token.setProvider(web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts((err, accs) => {
      if (err != null) {
        alert('There was an error fetching your accounts.');
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.")
        return;
      }

      accounts = accs;
      account = accounts[0];

      App.getBalance();

      // Reload when changing Metamask account or network
      web3.currentProvider.publicConfigStore.on('update', ({ selectedAddress }) => {
        if (selectedAddress != account) {
          account = selectedAddress;
          App.getBalance();
        }
      });
    })
  },

  getBalance: () => {
    return axios.get('/balance', { params: { account } })
      .then(({ data }) => {
        document.getElementById('main-chain-balance').textContent = balanceBeatify(data.mainBalance);
        document.getElementById('side-chain-balance').textContent = balanceBeatify(data.sideBalance);
      });
  },

  submit: async () => {
    const tokenInstance = await Token.deployed();
    const value = document.getElementById("token-input").value;
    return tokenInstance.chainSend('', account, value * (10 ** TOKEN_CONFIG.decimals),
      { from: account });
  },

  sendToken: async () => {
    const tokenInstance = await Token.deployed();
    const to = document.getElementById('send-address').value;
    const amount = document.getElementById('send-amount').value;
    return tokenInstance.transfer(to, amount * (10 ** TOKEN_CONFIG.decimals), { from: account })
      .then((res) => {
        alert('Transfer to token to server successfully. Please waiting for server transfer to other chain');
      })
      .catch((err) => {
        console.log(err);
      });
  },
};

const balanceBeatify = (balance) => {
  const readableBalance = Number(balance) / (10 ** TOKEN_CONFIG.decimals);
  return new BigNumber(readableBalance.toString()).toFormat(2) + ' ' + TOKEN_CONFIG.symbol;
};

window.addEventListener('load', function () {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));
  }

  App.start();
});
