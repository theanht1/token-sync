const { Event } = require('../models');
const { account, getInstances } = require('./contracts');


// Buy tokens
const buy = async (chain, { id, to, value }) => {
  console.log(`Buy in ${chain}, id: ${id}, address: ${to}, amount: ${value}`);
}

// Confirm request to buy
const confirmBuy = async (chain, { id, to, value }) => {
  console.log(`Confirm buy in ${chain}, id: ${id}, address: ${to}, amount: ${value}`);
}

const handleMainChainEvents = (event) => {
  switch (event.event) {
    case 'Buy':
      return buy('MainChain', event.args);
    case 'ConfirmBuy':
      return confirmBuy('MainChain', event.args);
    default:
  }
};

const handleSideChainEvents = (event) => {
  switch (event.event) {
    case 'Buy':
      return buy('SideChain', event.args);
    case 'ConfirmBuy':
      return confirmBuy('SideChain', event.args);
    default:
  }
};

const getUnconfirmRequests = async (address, chain) => {
  const buyEvents = await Event.find({ chain, type: 'Buy' });
  const confirmEvents = await Event.find({
    chain: chain === 'main' ? 'side' : 'main',
    type: 'ConfirmBuy',
  });
  if (confirmEvents.length === 0) {
    return buyEvents;
  }

  return buyEvents.filter(buyEvent => {
    const buyContent = JSON.parse(buyEvent.content);
    return confirmEvents.every(confEvent => {
      const { args: { id } } = JSON.parse(confEvent.content);
      return buyContent.args.id !== id;
    });
  });
};

module.exports = {
  handleMainChainEvents,
  handleSideChainEvents,
  getUnconfirmRequests,
};
