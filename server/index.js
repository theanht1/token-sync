const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Web3 = require('web3');

const { Event } = require('./models');
const { hashObject, hashEvent } = require('./utils');
const { MainToken, SideToken, getInstances, sign } = require('./utils/contracts');
const {
  handleMainChainEvents,
  handleSideChainEvents,
  getUnconfirmRequests,
} = require('./utils/eventHandlers');

const web3 = new Web3();

// MongoDB configuration
mongoose.connect('mongodb://localhost:27017/token', {
  useNewUrlParser: true,
});

// App define
const app = express();

// Middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
app.use(bodyParser.json());

/* APIs */

// Get balances
app.get('/api/balance', async ({
  query: { account },
}, res) => {
  const { mainTokenInstance, sideTokenInstance } = await getInstances();
  const mainBalance = await mainTokenInstance.balanceOf.call(account);
  const sideBalance = await sideTokenInstance.balanceOf.call(account);

  return res.status(200).json({ account, mainBalance, sideBalance });
});

// Get unconfirmed buy token requests
app.get('/api/unconfirmed-requests', async ({
  query: { address },
}, res) => {
  const mainRequests = await getUnconfirmRequests(address, 'main');
  const sideRequests = await getUnconfirmRequests(address, 'side');

  res.status(200).json({
    mainRequests,
    sideRequests,
  });
});

app.post('/api/retrieve-msg', async ({
  body: { event },
}, res) => {
  const keyHash = hashEvent(event);
  const existedEvent = await Event.findOne({ key: keyHash })
    .catch(() => {});

  if (!existedEvent) {
    return res.status(404).json({ error: 'Event not found. Please try again later' });
  }

  const eventObj = JSON.parse(existedEvent.content);
  const { args: { id, to, value } } = eventObj;
  // TODO: Need to save value as plan string inorder to recover big number
  const msg = web3.utils.soliditySha3(id, to, Number(value).toLocaleString('fullwide', { useGrouping: false }));
  const signedMsg = sign(msg);
  res.status(200).json({ signedMsg });
});

app.listen(3000, () => {
  console.log('Server start at port 3000');
});


/* Event listeners */

const handleEvent = ({ type, event }) => {
  return type === 'main' ? handleMainChainEvents(event) : handleSideChainEvents(event);
}

const eventBuffer = [];
let timer = setTimeout(async function handle() {
  if (eventBuffer.length > 0) {
    await handleEvent(eventBuffer.splice(0, 1)[0]);
  }
  timer = setTimeout(handle, 200);
}, 200);

const addEvent = async (type, event) => {
  const keyHash = hashEvent(event);

  const existedEvent = await Event.findOne({ key: keyHash })
    .catch(() => {});

  if (!existedEvent) {
    await Event.create({
      key: keyHash,
      chain: type,
      type: event.event,
      content: JSON.stringify(event),
    });
    eventBuffer.push({ type, event });
  }
};

const setupEventListener = async () => {
  const blockRange = { fromBlock: 0, toBlock: 'latest' };
  const { mainTokenInstance, sideTokenInstance } = await getInstances();

  const mainEvents = mainTokenInstance.allEvents(blockRange);
  mainEvents.watch((err, event) => {
    if (err) {
      console.log(err);
      return;
    }
    addEvent('main', event);
  });

  const sideEvents = sideTokenInstance.allEvents(blockRange);
  sideEvents.watch((err, event) => {
    if (err) {
      console.log(err);
      return;
    }
    addEvent('side', event);
  });
}

setupEventListener();

