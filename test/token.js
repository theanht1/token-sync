const fs = require('fs');
const ethUtil = require('ethereumjs-util');
const { signing } = require('eth-lightwallet');
const BN = require('bignumber.js');
const web3 = new (require('web3'))();


const Token = artifacts.require('Token.sol');

const config = JSON.parse(fs.readFileSync('./conf/config.json'));
const tokenConfig = config.token;

const bigTen = number => new BN(number.toString(10), 10);

const sign = (msg, privateKey) => {
    const signedMsg = ethUtil.ecsign(ethUtil.toBuffer(msg), Buffer.from(privateKey, 'hex'))
    return signing.concatSig(signedMsg);
}

contract('Token', (accounts) => {
    describe('Function: Transfer token between chains', () => {
        it('Buy token', async () => {
            let acc = accounts[0];

            const value = 200;
            const totalSupply = bigTen(tokenConfig.supply);

            const token = await Token.deployed();

            const currentNonce = parseInt(await token.nBuy.call());

            await token.buy(value);

            assert.equal(
                (await token.balanceOf.call(acc)), totalSupply - value, "Token was transferred"
            )

            assert.equal(
                (await token.balanceOf.call(token.address)), value, "Token was transferred to contract"
            )

            assert.equal(
                (await token.nBuy.call()), currentNonce + 1, "Nonce was updated"
            )
        })

        it('Transaction confirmation', async () => {
            const ownerAccount = accounts[0];
            const buyerAccount = accounts[1];
            const contractAccount = Token.address;
            const contractToken = 10000;
            const value = 1000;

            const token = await Token.deployed();
            const nonce = 1;

            // Transfer token to contract
            await token.transfer(contractAccount, contractToken, { from: ownerAccount });
            const contractBalance = (await token.balanceOf.call(contractAccount)).toNumber();

            // Generate signature
            const privateKey = '6676233660e15f8b70b389c70c05fc5d11f3263806eebae4b4b33d0dc66858f1';

            // const msg = ethUtil.keccak256(nonce, buyerAccount, Number(value).toLocaleString('fullwide', { useGrouping: false }))
            const msg = web3.utils.soliditySha3(nonce, buyerAccount, Number(value).toLocaleString('fullwide', { useGrouping: false }));
            const signedMsg = sign(msg, privateKey);

            await token.confirmBuy(nonce, buyerAccount, value, signedMsg);

            // Assertion
            assert.equal(
                (await token.balanceOf.call(contractAccount)).toNumber(), contractBalance - value, "Contract transferred token"
            )

            assert.equal(
                (await token.balanceOf.call(buyerAccount)).toNumber(), value, "Token was transferred to buyer"
            )
        })

        it('Send double transaction', async () => {
            const ownerAccount = accounts[0];
            const buyerAccount = accounts[1];
            const contractAccount = Token.address;
            const contractToken = 10000;
            const value = 1000;

            const token = await Token.deployed();
            const nonce = 1;

            // Transfer token to contract
            await token.transfer(contractAccount, contractToken, { from: ownerAccount });
            const contractBalance = (await token.balanceOf.call(contractAccount)).toNumber();

            // Generate signature
            const privateKey = '6676233660e15f8b70b389c70c05fc5d11f3263806eebae4b4b33d0dc66858f1';

            // const msg = ethUtil.keccak256(nonce, buyerAccount, Number(value).toLocaleString('fullwide', { useGrouping: false }))
            const msg = web3.utils.soliditySha3(nonce, buyerAccount, Number(value).toLocaleString('fullwide', { useGrouping: false }));
            const signedMsg = sign(msg, privateKey);

            try {
                await token.confirmBuy(nonce, buyerAccount, value, signedMsg);
                await token.confirmBuy(nonce, buyerAccount, value, signedMsg);
            } catch (error) {
                assert(error.toString().includes('revert'), error.toString());
                return;
            }

            assert(false, "Invalid nonce");
        })

        it('Invalid value', async () => {
            const ownerAccount = accounts[0];
            const buyerAccount = accounts[1];
            const contractAccount = Token.address;
            const contractToken = 10000;
            const value = 1000;

            const token = await Token.deployed();
            const nonce = 1;

            // Transfer token to contract
            await token.transfer(contractAccount, contractToken, { from: ownerAccount });

            // Generate signature
            const privateKey = '6676233660e15f8b70b389c70c05fc5d11f3263806eebae4b4b33d0dc66858f1';

            // const msg = ethUtil.keccak256(nonce, buyerAccount, Number(value).toLocaleString('fullwide', { useGrouping: false }))
            const msg = web3.utils.soliditySha3(nonce, buyerAccount, Number(value).toLocaleString('fullwide', { useGrouping: false }));
            const signedMsg = sign(msg, privateKey);

            try {
                await token.confirmBuy(nonce, buyerAccount, value - 10, signedMsg);
            } catch (error) {
                assert(error.toString().includes('revert'), error.toString());
                return;
            }
            assert(false, "Hashed value is invalid");
        })

        it('Invalid signature', async () => {
            const ownerAccount = accounts[0];
            const buyerAccount = accounts[1];
            const contractAccount = Token.address;
            const contractToken = 10000;
            const value = 1000;

            const token = await Token.deployed();
            const nonce = 1;

            // Transfer token to contract
            await token.transfer(contractAccount, contractToken, { from: ownerAccount });

            // Generate signature
            const privateKey = 'bba565aa9b0362b58ca946992776d80bc146a5a8e57661872749fb10c1d5a64b';

            // const msg = ethUtil.keccak256(nonce, buyerAccount, Number(value).toLocaleString('fullwide', { useGrouping: false }))
            const msg = web3.utils.soliditySha3(nonce, buyerAccount, Number(value).toLocaleString('fullwide', { useGrouping: false }));
            const signedMsg = sign(msg, privateKey);

            try {
                await token.confirmBuy(nonce, buyerAccount, value, signedMsg);
            } catch (error) {
                assert(error.toString().includes('revert'), error.toString());
                return;
            }

            assert(false, "Must be the signature of the owner of the contract");
        })

    })
})
