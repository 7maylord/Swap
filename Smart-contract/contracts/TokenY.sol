// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TokenY is ERC20 {
    constructor() ERC20("TokenY", "TKY") {
        _mint(msg.sender, 10000 * 10**decimals()); // 10,000 TX tokens
    }
}