const express = require('express');
const { MainToken, SideToken } = require('./utils/contracts');
const { handleMainChainEvents, handleSideChainEvents } = require('./utils/eventHandlers');

// App define
const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
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

const addEvent = (type, event) => {
  eventBuffer.push({ type, event });
};

const setupEventListener = async () => {
  const blockRange = { fromBlock: 0, toBlock: 'latest' };
  const mainTokenInstance = await MainToken.deployed();
  const sideTokenInstance = await SideToken.deployed();

  const mainEvents = mainTokenInstance.allEvents(blockRange);
  mainEvents.watch((err, event) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log(event);
    addEvent('main', event);
  });

  const sideEvents = sideTokenInstance.allEvents(blockRange);
  sideEvents.watch((err, event) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log(event);
    addEvent('side', event);
  });
}

setupEventListener();

