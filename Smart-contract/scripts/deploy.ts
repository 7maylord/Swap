import { ethers, run, network } from "hardhat";
import dotenv from "dotenv";

dotenv.config();

async function verify(contractAddress: string, args: any[]) {
    console.log(`Verifying contract at ${contractAddress}...`);

    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        });
        console.log(` Verification successful: ${contractAddress}`);
    } catch (error: any) {
        console.error(` Verification failed: ${error.message}`);
    }
}

async function deploy() {
    const [owner] = await ethers.getSigners();

    console.log(`\n Deploying contracts using account: ${owner.address}`);
    console.log(`Network: ${network.name}`);

    console.log("\n Deploying TokenX...");
    const TokenX = await ethers.getContractFactory("TokenX");
    const tokenX = await TokenX.deploy();
    await tokenX.waitForDeployment();
    const tokenXAddress = await tokenX.getAddress();
    console.log(` TokenX deployed at: ${tokenXAddress}`);

    console.log("\n Deploying TokenY...");
    const TokenY = await ethers.getContractFactory("TokenY");
    const tokenY = await TokenY.deploy();
    await tokenY.waitForDeployment();
    const tokenYAddress = await tokenY.getAddress();
    console.log(` TokenY deployed at: ${tokenYAddress}`);

    console.log("\n Deploying Swap Contract...");
    const Swap = await ethers.getContractFactory("Swap");
    const swap = await Swap.deploy(tokenXAddress, tokenYAddress);
    await swap.waitForDeployment();
    const swapAddress = await swap.getAddress();
    console.log(` Swap Contract deployed at: ${swapAddress}`);

    console.log("\n Deployment Complete!");

    // **Verify Contracts**
    if (network.name !== "hardhat") {
        console.log("\n Verifying contracts ...");
        await verify(tokenXAddress, []);
        await verify(tokenYAddress, []);
        await verify(swapAddress, [tokenXAddress, tokenYAddress]);
    } else {
        console.log("\n Skipping verification (No API key or local network detected).");
    }
}

// Run the script
deploy().catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
});
