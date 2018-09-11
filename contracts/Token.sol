pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';

contract Token is ERC20 {

    // EVENTS
    event ChainSend(
        bytes32 host,
        address indexed from,
        address indexed to,
        uint256 value
    );

    event ChainReceive(
        address indexed to,
        uint256 value
    );

    constructor(uint _amount) public {
        _mint(msg.sender, _amount);
    }

    function chainSend(bytes32 host, address to, uint256 value) public returns(bool) {
        _burn(msg.sender, value);

        emit ChainSend(host, msg.sender, to, value);

        return true;
    }

    function chainReceive(address to, uint256 value) public returns(bool) {
        // Mint more token
        _mint(to, value);

        emit ChainReceive(to, value);

        return true;
    }
}

