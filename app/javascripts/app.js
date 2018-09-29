import axios from 'axios';
import { default as Web3 } from 'web3';
import { default as contract } from 'truffle-contract';
import BigNumber from 'bignumber.js';

import tokenArtifact from '../../build/contracts/Token.json';
import '../stylesheets/app.css';
const { SERVER_ADDRESS, MAIN_CHAIN_ID, SIDE_CHAIN_ID } = require('../../config.json');
const CONFIG = require('../../conf/config.json');

const TOKEN_CONFIG = CONFIG.token;
axios.defaults.baseURL = SERVER_ADDRESS + '/api';

const Token = contract(tokenArtifact);

let accounts;
let account;
let boughtEvents;

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
      App.setSendChainTokenLabel();
      App.getBuyEvents();

      // Reload when changing Metamask account or network
      web3.currentProvider.publicConfigStore.on('update', ({ selectedAddress }) => {
        if (selectedAddress != account) {
          account = selectedAddress;
          App.getBalance();
        }
      });
    })
  },

  setSendChainTokenLabel: async () => {
    const netId = await web3.eth.net.getId();

    document.getElementById('chain-name').textContent = netId === MAIN_CHAIN_ID ? 'main' : 'side';

    const mainChainEl = document.getElementById('main-chain');
    const sideChainEl = document.getElementById('side-chain');
    if (netId === MAIN_CHAIN_ID) {
      mainChainEl.style.fontWeight = 600;
      sideChainEl.style.fontWeight = 100;
    } else if (netId === SIDE_CHAIN_ID) {
      mainChainEl.style.fontWeight = 100;
      sideChainEl.style.fontWeight = 600;
    }
  },

  getBalance: () => {
    return axios.get('/balance', { params: { account } })
      .then(({ data }) => {
        document.getElementById('main-chain-balance').textContent = balanceBeatify(data.mainBalance);
        document.getElementById('side-chain-balance').textContent = balanceBeatify(data.sideBalance);
      });
  },

  buy: async () => {
    const tokenInstance = await Token.deployed();
    const value = document.getElementById("token-input").value;
    return tokenInstance.buy(value * (10 ** TOKEN_CONFIG.decimals), { from: account });
  },

  confirm: async (index) => {
    const event = JSON.parse(boughtEvents[index].content);
    return axios.post('/retrieve-msg', { event })
      .then(async ({ data: { signedMsg } }) => {
        console.log(signedMsg);
        const tokenInstance = await Token.deployed();
        const { args: { id, to, value } } = event;
        await tokenInstance.confirmBuy(id, to, value, signedMsg, { from: account });
      })
  },

  sendToken: async () => {
    const tokenInstance = await Token.deployed();
    const to = document.getElementById('send-address').value;
    const amount = document.getElementById('send-amount').value;
    return tokenInstance.transfer(to, amount * (10 ** TOKEN_CONFIG.decimals), { from: account });
  },

  getBuyEvents: async () => {
    const netId = await web3.eth.net.getId();
    return axios.get('/unconfirmed-requests', {
      query: { address: account },
    })
      .then(({ data }) => {
        boughtEvents = netId == MAIN_CHAIN_ID ? data.sideRequests : data.mainRequests;
        $('#bought-list').empty();
        boughtEvents.forEach((event, index) => {
          const buyEvent = JSON.parse(event.content);
          $('#bought-list').append(
            `<li>
              Buy ${balanceBeatify(buyEvent.args.value)}
              <a class="btn btn-secondary" href="#" onClick="App.confirm(${index})">Confirm</a>
            </li>`
          )
        });
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
