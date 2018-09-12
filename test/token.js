const fs = require('fs');
const BN = require('bignumber.js');

const Token = artifacts.require('Token.sol');

const config = JSON.parse(fs.readFileSync('./conf/config.json'));
const tokenConfig = config.token;

const bigTen = number => new BN(number.toString(10), 10);

contract('Token', (accounts) => {
    describe('Function: Transfer token between chains', () => {
        it('Send token', async () => {
            let acc = accounts[0];
            const token = await Token.deployed();

            const amount = 1000;
            const totalSupply = bigTen(tokenConfig.supply);

            await token.chainSend("server", acc, amount);

            assert.equal(
                (await token.totalSupply.call()), totalSupply - amount, 'Tokens were burned',
            )

            assert.equal(
                (await token.balanceOf.call(acc)), totalSupply - amount, 'Tokens were transferred',
            )

        })

        it('Receive token', async () => {
            let acc = accounts[0];
            const token = await Token.deployed();

            const amount = 1000;
            const totalSupply = bigTen(tokenConfig.supply);

            await token.chainReceive(acc, amount);

            assert.equal(
                (await token.totalSupply.call()).toNumber(), totalSupply, 'Tokens were mint'
            )

            assert.equal(
                (await token.balanceOf.call(acc)).toNumber(), totalSupply, 'Tokens were transferred'
            )
        })

        it('No permission to receive token', async () => {
            let acc = accounts[0];
            let testAcc = accounts[1];
            const token = await Token.deployed();

            try {
                await token.chainReceive(acc, 1000, {from: testAcc});
            } catch (error) {
                assert(error.toString().includes('revert'), error.toString());
                return;
            }

            assert(false, "Don't have permission to run this function");
        })
    })
})
