import { ethers } from "hardhat";
import dotenv from "dotenv";

dotenv.config();

async function main() {
    const [owner, user1, user2] = await ethers.getSigners();

    console.log("\nDeploying TokenX...");
    const TokenX = await ethers.getContractFactory("TokenX");
    const tokenX = await TokenX.deploy();
    await tokenX.waitForDeployment();

    console.log("Deploying TokenY...");
    const TokenY = await ethers.getContractFactory("TokenY");
    const tokenY = await TokenY.deploy();
    await tokenY.waitForDeployment();

    console.log("Deploying Swap Contract...");
    const Swap = await ethers.getContractFactory("Swap");
    const swap = await Swap.deploy(await tokenX.getAddress(), await tokenY.getAddress());
    await swap.waitForDeployment();

    console.log("\n Deployment Completed!");
    console.log(`TokenX Address: ${await tokenX.getAddress()}`);
    console.log(`TokenY Address: ${await tokenY.getAddress()}`);
    console.log(`Swap Address: ${await swap.getAddress()}`);

    // Give user1 some tokens
    const initialAmount = ethers.parseUnits("1000", 18);
    await tokenX.transfer(user1.address, initialAmount);
    await tokenY.transfer(user1.address, initialAmount);
    console.log(`Transferred ${initialAmount} TokenX & TokenY to user1`);

    // User1 approves Swap
    const liquidityAmount = ethers.parseUnits("100", 18);
    await tokenX.connect(user1).approve(await swap.getAddress(), liquidityAmount);
    await tokenY.connect(user1).approve(await swap.getAddress(), liquidityAmount);
    console.log(`User1 approved ${liquidityAmount} TokenX & TokenY for Swap contract`);

    // User1 adds liquidity
    await swap.connect(user1).addLiquidity(liquidityAmount, liquidityAmount);
    console.log(`User1 added ${liquidityAmount} liquidity`);

    // Check reserves
    let reserveX = await swap.reserveX();
    let reserveY = await swap.reserveY();
    console.log(`Reserves: TokenX: ${reserveX}, TokenY: ${reserveY}`);

    // User1 swaps TokenX for TokenY
    const swapAmountX = ethers.parseUnits("10", 18);
    await tokenX.connect(user1).approve(await swap.getAddress(), swapAmountX);
    await swap.connect(user1).swap(swapAmountX, true, user1.address);
    console.log(`User1 swapped ${swapAmountX} TokenX for TokenY`);

    // User1 swaps TokenY for TokenX
    const swapAmountY = ethers.parseUnits("5", 18);
    await tokenY.connect(user1).approve(await swap.getAddress(), swapAmountY);
    await swap.connect(user1).swap(swapAmountY, false, user1.address);
    console.log(`User1 swapped ${swapAmountY} TokenY for TokenX`);

    // Check updated reserves
    reserveX = await swap.reserveX();
    reserveY = await swap.reserveY();
    console.log(`Updated Reserves: TokenX: ${reserveX}, TokenY: ${reserveY}`);

    // Check User1's balance
    const user1TokenXBalance = await tokenX.balanceOf(user1.address);
    const user1TokenYBalance = await tokenY.balanceOf(user1.address);
    console.log(`User1 Balance: TokenX: ${user1TokenXBalance}, TokenY: ${user1TokenYBalance}`);
}

// Run the script
main().catch((error) => {
    console.error(error);
    process.exit(1);
});
