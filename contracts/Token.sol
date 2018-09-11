pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';

contract Token is ERC20 {

    constructor(uint _amount) public {
        _mint(msg.sender, _amount);
    }
}

