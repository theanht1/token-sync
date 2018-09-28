pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol';
import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import 'openzeppelin-solidity/contracts/cryptography/ECDSA.sol';

import './utils/ERC20.sol';

/// @title An ERC20 contract for KNOTs, allow transfer between chains
/// @author Walter
contract Token is ERC20, ERC20Detailed, Ownable {

    // EVENTS
    event Buy(uint id, address to, uint value);
    event ConfirmBuy(uint id, address to, uint value);

    uint nBuy;
    mapping (uint => bool) public isCompletedBuy;


    constructor(uint totalSupply, string name, string symbol, uint8 decimals)
        ERC20Detailed(name, symbol, decimals)
        Ownable()
        public
    {
        _mint(msg.sender, totalSupply);
    }

    /* Public functions */

    /// @author Walter
    /// @notice Allow user to buy token in other chain
    /// @dev Transfer token to this contract and initial an event for external Oracle
    /// @param _value Amount of token to buy in other chain
    function buy(uint _value) public {
        require(this.transfer(this, _value));
        nBuy = nBuy.add(1);
        emit Buy(nBuy, msg.sender, _value);
    }

    /// @author Walter
    /// @param _id Index of buy request
    /// @param _to Address of buyer
    /// @param _value Amount of token to buy
    function confirmBuy(uint _id, address _to, uint _value, bytes _sig) public {
        require(this.balanceOf(this) >= _value);
        require(!isCompletedBuy[_id]);

        bytes32 hash = keccak256(abi.encodePacked(_id, _to, _value));
        require(ECDSA.recover(hash, _sig) == owner());

        _balances[this] = _balances[this].sub(_value);
        _balances[_to] = _balances[_to].add(_value);
        isCompletedBuy[_id] = true;

        emit ConfirmBuy(_id, _to, _value);
    }

    /* Private functions */
}

