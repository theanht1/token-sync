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
    case 'ConfigBuy':
      return confirmBuy('MainChain', event.args);
    default:
  }
};

const handleSideChainEvents = (event) => {
  switch (event.event) {
    case 'Buy':
      return buy('SideChain', event.args);
    case 'ConfigBuy':
      return confirmBuy('SideChain', event.args);
    default:
  }
};

module.exports = {
  handleMainChainEvents,
  handleSideChainEvents,
};
