# Swap Contract

## Overview
This Solidity smart contract implements a simple decentralized token swap mechanism between two ERC-20 tokens. It supports liquidity provision, withdrawal, and token swaps using an automated market maker (AMM) model with a 0.3% fee.

## Features
- **Liquidity Provision**: Users can add liquidity in the form of token pairs.
- **Liquidity Removal**: Users can withdraw their liquidity and receive proportional token amounts.
- **Token Swaps**: Users can swap between TokenX and TokenY with a 0.3% fee.
- **Event Emissions**: Logs key events for swaps, liquidity additions, and removals.
- **Safety Checks**: Implements error handling and input validation.


## Contract Address : Lisk Sepolia
   ```sh
   0xF5e87d74d0c89D2534508B8AE66a2dE011a549B2
   ```
   
## ERC20 TokenX Contract Address : Lisk Sepolia
   ```sh
   0x1E892ac089D41e5C28E2510E6884B266c47A090D
   ```

## ERC20 TokenY Contract Address : Lisk Sepolia
   ```sh
   0x146AF3b5FE774C4BfC9553Ec2bccC33769779012
   ```


## Deployment
### Prerequisites
- Node.js & npm
- Hardhat
- dotenv for environment variables


## Installation & Setup
1. Clone the repository:
   ```sh
   git clone https://github.com/7maylord/Swap.git
   cd Swap
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Configure the `.env` file with private keys and RPC URLs.

4. Compile the contract:
   ```sh
   npx hardhat compile
   ```

5. Deploy and verify using the Hardhat script:
   ```sh
   npx hardhat run scripts/deploy.ts --network lisk_sepolia
   ```

## Smart Contract Details

### State Variables
- `address public immutable tokenX;` - Address of the first ERC-20 token.
- `address public immutable tokenY;` - Address of the second ERC-20 token.
- `uint256 public reserveX;` - Reserve balance of tokenX in the contract.
- `uint256 public reserveY;` - Reserve balance of tokenY in the contract.
- `mapping(address => uint256) public liquidityProviders;` - Tracks user liquidity shares.
- `uint256 public totalLiquidity;` - Total liquidity in the pool.

### Events
- `Swapped(address indexed fromToken, address indexed toToken, uint256 amountIn, uint256 amountOut);`
- `LiquidityAdded(address indexed provider, uint256 amountX, uint256 amountY);`
- `LiquidityRemoved(address indexed provider, uint256 amountX, uint256 amountY);`

### Errors
- `InvalidAmount()` - Thrown when input amounts are zero.
- `InsufficientBalance()` - Thrown when the user has insufficient tokens.
- `NoLiquidity()` - Thrown when trying to swap with no reserves.
- `InvalidSwap()` - Thrown when a swap operation is invalid.
- `InvalidAddress()` - Thrown when an invalid address is provided.
- `SwapFailed()` - Thrown when a swap cannot be completed.

## Functions

### 1. `addLiquidity(uint256 amountX, uint256 amountY) external`
Allows users to provide liquidity by depositing equal-value amounts of `tokenX` and `tokenY`. The liquidity share is calculated based on existing reserves.

### 2. `removeLiquidity(uint256 liquidityAmount) external`
Allows users to withdraw liquidity in proportion to their contribution.

### 3. `swap(uint256 amountIn, bool isTokenX, address to) external`
Allows users to swap between `tokenX` and `tokenY` while applying a 0.3% fee.



## License
This contract is **UNLICENSED**, meaning it has no predefined license attached.

## Author
Developed by **[MayLord](https://github.com/7maylord)**. Feel free to contribute and improve the project!

---

Happy coding! 🚀

