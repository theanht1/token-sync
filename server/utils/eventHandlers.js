const { account, SideToken, MainToken } = require('./contracts');


const depositToSideChain = ({ host, to, value }) => {
  return SideToken._mint(to, value, { from: account });
}

const withdrawToMainChain = ({ host, to, value }) => {
  return MainToken._mint(to, value, { from: account });
}

const handleMainChainEvents = (event) => {
  switch (event.type) {
    case 'ChainSend':
      return depositToSideChain(event.args);
    default:
      console.log(event);
  }
};

const handleSideChainEvents = (event) => {
  switch (event.type) {
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
