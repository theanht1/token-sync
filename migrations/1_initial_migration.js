var Migrations = artifacts.require("./Migrations.sol");

module.exports = function(deployer, network, accounts) {
  const acc = accounts[1];
  deployer.deploy(Migrations, {from: acc});
};
