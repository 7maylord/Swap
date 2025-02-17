import { expect } from "chai";
import { ethers } from "hardhat";

describe("Swap Contract", function () {
    let swap: any;
    let tokenX: any;
    let tokenY: any;
    let owner: any;
    let user1: any;
    let user2: any;

    before(async function () {
        [owner, user1, user2] = await ethers.getSigners();

        const TokenX = await ethers.getContractFactory("TokenX");
        tokenX = await TokenX.deploy();
        await tokenX.waitForDeployment();

        const TokenY = await ethers.getContractFactory("TokenY");
        tokenY = await TokenY.deploy();
        await tokenY.waitForDeployment();

        const Swap = await ethers.getContractFactory("Swap");
        swap = await Swap.deploy(await tokenX.getAddress(), await tokenY.getAddress());
        await swap.waitForDeployment();

        console.log("TokenX Address:", await tokenX.getAddress());
        console.log("TokenY Address:", await tokenY.getAddress());
        console.log("Swap Address:", await swap.getAddress());

        const amount = ethers.parseUnits("1000", 18);
        await tokenX.transfer(user1.address, amount);
        await tokenY.transfer(user1.address, amount);
        await tokenX.transfer(user2.address, amount);
        await tokenY.transfer(user2.address, amount);
    });

    it("Should deploy successfully", async function () {
        expect(await tokenX.getAddress()).to.properAddress;
        expect(await tokenY.getAddress()).to.properAddress;
        expect(await swap.getAddress()).to.properAddress;
    });

    it("Should add liquidity successfully", async function () {
        const amountX = ethers.parseUnits("100", 18);
        const amountY = ethers.parseUnits("100", 18);

        await tokenX.connect(user1).approve(await swap.getAddress(), amountX);
        await tokenY.connect(user1).approve(await swap.getAddress(), amountY);

        await expect(swap.connect(user1).addLiquidity(amountX, amountY))
            .to.emit(swap, "LiquidityAdded")
            .withArgs(user1.address, amountX, amountY);

        expect(await swap.reserveX()).to.equal(amountX);
        expect(await swap.reserveY()).to.equal(amountY);
    });

    it("Should swap TokenX for TokenY successfully", async function () {
        const amountX = ethers.parseUnits("100", 18);
        const amountY = ethers.parseUnits("100", 18);

        await tokenX.connect(user1).approve(await swap.getAddress(), amountX);
        await tokenY.connect(user1).approve(await swap.getAddress(), amountY);
        await swap.connect(user1).addLiquidity(amountX, amountY);

        const swapAmount = ethers.parseUnits("10", 18);
        await tokenX.connect(user1).approve(await swap.getAddress(), swapAmount);

        await expect(swap.connect(user1).swap(swapAmount, true, user1.address))
            .to.emit(swap, "Swapped");

        expect(await swap.reserveX()).to.be.gte(amountX + swapAmount);
    });

    it("Should fail swapping when insufficient liquidity", async function () {
      // Freshly deploy contract to ensure zero liquidity
      const TokenX = await ethers.getContractFactory("TokenX");
      const tokenX = await TokenX.deploy();
      await tokenX.waitForDeployment();
  
      const TokenY = await ethers.getContractFactory("TokenY");
      const tokenY = await TokenY.deploy();
      await tokenY.waitForDeployment();
  
      const Swap = await ethers.getContractFactory("Swap");
      const swap = await Swap.deploy(await tokenX.getAddress(), await tokenY.getAddress());
      await swap.waitForDeployment();
  
      console.log("Swap Address:", await swap.getAddress());
  
      expect(await swap.reserveX()).to.equal(0);
      expect(await swap.reserveY()).to.equal(0);
  
      const swapAmount = ethers.parseUnits("10", 18);
      await tokenX.connect(user1).approve(await swap.getAddress(), swapAmount);
  
      await expect(swap.connect(user1).swap(swapAmount, true, user1.address))
          .to.be.reverted;
  });
  

    it("Should fail adding zero liquidity", async function () {
        await expect(swap.connect(user1).addLiquidity(0, 100))
            .to.be.reverted;
    });

    it("Should fail swapping with zero amount", async function () {
        await expect(swap.connect(user1).swap(0, true, user1.address))
            .to.be.reverted;
    });

    it("Should update reserves correctly after liquidity addition", async function () {

      [owner, user1, user2] = await ethers.getSigners();

      const TokenX = await ethers.getContractFactory("TokenX");
      const tokenX = await TokenX.deploy();
      await tokenX.waitForDeployment();
  
      const TokenY = await ethers.getContractFactory("TokenY");
      const tokenY = await TokenY.deploy();
      await tokenY.waitForDeployment();
  
      const Swap = await ethers.getContractFactory("Swap");
      const swap = await Swap.deploy(await tokenX.getAddress(), await tokenY.getAddress());
      await swap.waitForDeployment();
  
      console.log("Swap Address:", await swap.getAddress());

      const amount = ethers.parseUnits("1000", 18);
    await tokenX.connect(owner).transfer(user1.address, amount);
    await tokenY.connect(owner).transfer(user1.address, amount);
    await tokenX.connect(owner).transfer(user2.address, amount);
    await tokenY.connect(owner).transfer(user2.address, amount);
  
      expect(await swap.reserveX()).to.equal(0);
      expect(await swap.reserveY()).to.equal(0);
  
      // Add liquidity
      const initialX = ethers.parseUnits("100", 18);
      const initialY = ethers.parseUnits("100", 18);
  
      await tokenX.connect(user1).approve(await swap.getAddress(), initialX);
      await tokenY.connect(user1).approve(await swap.getAddress(), initialY);
      await swap.connect(user1).addLiquidity(initialX, initialY);
  
      const reserveX = await swap.reserveX();
      const reserveY = await swap.reserveY();
  
      console.log("🔹 Expected:", initialX.toString(), "Actual:", reserveX.toString());
  
      expect(reserveX).to.be.closeTo(initialX, ethers.parseUnits("1", 18));
      expect(reserveY).to.be.closeTo(initialY, ethers.parseUnits("1", 18));
  });
  
});
