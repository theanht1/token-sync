const { account, getInstances } = require('./contracts');


// Send token to sidechain
const depositToSideChain = async ({ host, to, value }) => {
  const { sideTokenInstance } = await getInstances();
  return sideTokenInstance.chainReceive(to, value, { from: account });
}

// Get token from sidechain
const withdrawToMainChain = async ({ host, to, value }) => {
  const { mainTokenInstance } = await getInstances();
  return mainTokenInstance.chainReceive(to, value, { from: account });
}

const handleMainChainEvents = (event) => {
  switch (event.event) {
    case 'ChainSend':
      return depositToSideChain(event.args);
    default:
      console.log(event);
  }
};

const handleSideChainEvents = (event) => {
  switch (event.event) {
    case 'ChainSend':
      return withdrawToMainChain(event.args);
    default:
      console.log(event);
  }
};

module.exports = {
  handleMainChainEvents,
  handleSideChainEvents,
};
