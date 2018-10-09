const Token = artifacts.require('./Token.sol');

const fs = require('fs');

module.exports = (deployer, network, accounts) => {
  const acc = accounts[0];
  const config = JSON.parse(fs.readFileSync('./conf/config.json'));

  const sendToken = async (address, amount) => {
    const displayAmt = amount.slice(
      0,
      amount.length - parseInt(config.token.decimals, 10),
    );
    // eslint-disable-next-line
    console.log(`Allocating ${displayAmt} ${config.token.symbol} tokens to ` +
    `${address}.`);

    const token = await Token.deployed();
    return token.transfer(address, amount);
  };

  const giveTokensTo = async (tokenHolders) => {
    if (tokenHolders.length === 0) { return; }
    const tokenHolder = tokenHolders[0];
    await sendToken(tokenHolder.address, tokenHolder.amount);
    await giveTokensTo(tokenHolders.slice(1));
  };

  deployer.deploy(
    Token, config.token.supply, config.token.name,
    config.token.symbol, config.token.decimals, {from: acc}
  )
    .then(async (result) => {
      if (network === 'sidechain') {
        // Give all tokens to the token contract in side chain
        await sendToken(result.address, config.token.supply);
      } else {
        // Distribute tokens on main chain
        await giveTokensTo(config.token.tokenHolders);
      }
    });
};

