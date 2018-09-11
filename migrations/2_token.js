const Token = artifacts.require('./Token.sol');

const fs = require('fs');

module.exports = (deployer, network) => {
  const config = JSON.parse(fs.readFileSync('./conf/config.json'));

  async function giveTokensTo(tokenHolders) {
    if (tokenHolders.length === 0) { return; }
    const token = await Token.deployed();
    const tokenHolder = tokenHolders[0];

    const displayAmt = tokenHolder.amount.slice(
      0,
      tokenHolder.amount.length - parseInt(config.token.decimals, 10),
    );
    // eslint-disable-next-line
    console.log(`Allocating ${displayAmt} ${config.token.symbol} tokens to ` +
    `${tokenHolder.address}.`);

    await token.transfer(tokenHolder.address, tokenHolder.amount);

    await giveTokensTo(tokenHolders.slice(1));
  }

  if (config.token.deployToken) {
    deployer.deploy(
      Token, config.token.supply
    )
      .then(async () => giveTokensTo(config.token.tokenHolders));
  } else {
    // eslint-disable-next-line
    console.log('skipping optional token deploy and using the token at address ' +
      `${config.token.address} on network ${network}.`);
  }
};
