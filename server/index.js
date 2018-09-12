const express = require('express');
const { hashObject } = require('./utils');
const { MainToken, SideToken, getInstances } = require('./utils/contracts');
const { handleMainChainEvents, handleSideChainEvents } = require('./utils/eventHandlers');
const { db } = require('./db');

// App define
const app = express();

// Middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// APIs
app.get('/api/balance', async ({
  query: { account },
}, res) => {
  const { mainTokenInstance, sideTokenInstance } = await getInstances();
  const mainBalance = await mainTokenInstance.balanceOf.call(account);
  const sideBalance = await sideTokenInstance.balanceOf.call(account);

  return res.status(200).json({ account, mainBalance, sideBalance });
});

app.listen(3000, () => {
  console.log('Server start at port 3000');
});

// Event listeners
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
  const keyHash = hashObject({
    blockHash: event.blockHash,
    transactionHash: event.transactionHash,
    logIndex: event.logIndex,
    event: event.event,
  });

  const existedEvent = await db.get(keyHash)
    .catch(() => {});

  if (!existedEvent) {
    await db.put(keyHash, JSON.stringify(event));
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

