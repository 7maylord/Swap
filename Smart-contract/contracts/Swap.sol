// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract Swap {
    using SafeERC20 for IERC20;

    address public immutable tokenX;
    address public immutable tokenY;
    uint256 public reserveX;
    uint256 public reserveY;
    
    mapping(address => uint256) public liquidityProviders;
    uint256 public totalLiquidity;

    event Swapped(address indexed fromToken, address indexed toToken, uint256 amountIn, uint256 amountOut);
    event LiquidityAdded(address indexed provider, uint256 amountX, uint256 amountY);
    event LiquidityRemoved(address indexed provider, uint256 amountX, uint256 amountY);

    error InvalidAmount();
    error InsufficientBalance();
    error NoLiquidity();
    error InvalidSwap();
    error InvalidAddress();
    error SwapFailed();

    constructor(address _tokenX, address _tokenY) {
        if (_tokenX == address(0) || _tokenY == address(0) || _tokenX == _tokenY) revert InvalidAddress();
        tokenX = _tokenX;
        tokenY = _tokenY;
    }

    function addLiquidity(uint256 amountX, uint256 amountY) external {
        if (amountX == 0 || amountY == 0) revert InvalidAmount();

        IERC20(tokenX).safeTransferFrom(msg.sender, address(this), amountX);
        IERC20(tokenY).safeTransferFrom(msg.sender, address(this), amountY);

        uint256 liquidityMinted;
        if (totalLiquidity == 0 || (reserveX + reserveY) == 0) {
            liquidityMinted = amountX + amountY;
        } else {
            liquidityMinted = (amountX + amountY) * totalLiquidity / (reserveX + reserveY);
        }

        liquidityProviders[msg.sender] += liquidityMinted;
        totalLiquidity += liquidityMinted;

        reserveX = IERC20(tokenX).balanceOf(address(this));
        reserveY = IERC20(tokenY).balanceOf(address(this));

        emit LiquidityAdded(msg.sender, amountX, amountY);
    }

    function removeLiquidity(uint256 liquidityAmount) external {
        if (liquidityAmount == 0 || liquidityProviders[msg.sender] < liquidityAmount) revert InvalidAmount();

        uint256 amountX = (liquidityAmount * reserveX) / totalLiquidity;
        uint256 amountY = (liquidityAmount * reserveY) / totalLiquidity;

        liquidityProviders[msg.sender] -= liquidityAmount;        
        totalLiquidity -= liquidityAmount;
        reserveX -= amountX;
        reserveY -= amountY;
        

        IERC20(tokenX).safeTransfer(msg.sender, amountX);
        IERC20(tokenY).safeTransfer(msg.sender, amountY);

        emit LiquidityRemoved(msg.sender, amountX, amountY);
    }

    function swap(uint256 amountIn, bool isTokenX, address to) external {
        if (amountIn == 0) revert InvalidAmount();
        if (to == address(0)) revert InvalidAddress();

        address inputToken = isTokenX ? tokenX : tokenY;
        address outputToken = isTokenX ? tokenY : tokenX;

        uint256 reserveIn = isTokenX ? reserveX : reserveY;
        uint256 reserveOut = isTokenX ? reserveY : reserveX;

        if (IERC20(inputToken).balanceOf(msg.sender) < amountIn) revert InsufficientBalance();
        if (reserveIn == 0 || reserveOut == 0) revert NoLiquidity();

        // Transfer input tokens to the contract
        IERC20(inputToken).safeTransferFrom(msg.sender, address(this), amountIn);

        // Apply swap formula with 0.3% fee
        uint256 amountInWithFee = (amountIn * 997) / 1000;
        uint256 amountOut = (amountInWithFee * reserveOut) / (reserveIn + amountInWithFee);
        if (amountOut == 0 || amountOut >= reserveOut) revert SwapFailed();

        // Update reserves dynamically
        reserveIn += amountIn;
        reserveOut -= amountOut;

        // Transfer output tokens to the recipient
        IERC20(outputToken).safeTransfer(to, amountOut);

        _updateReserves();

        emit Swapped(inputToken, outputToken, amountIn, amountOut);
    }
    
    function _updateReserves() internal {
        reserveX = IERC20(tokenX).balanceOf(address(this));
        reserveY = IERC20(tokenY).balanceOf(address(this));
    }
}
