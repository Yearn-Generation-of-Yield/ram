const { deployments, ethers, getUnnamedAccounts, getNamedAccounts } = require("hardhat");
const { time, expectRevert } = require("@openzeppelin/test-helpers");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();
const { setTestVars } = require("../scripts/setTestVars");
const { parse } = require("path");
const MAX_INT = "11579208923731619542357098500868790785326998466564056403945758400791312963993";
const { parseEther, formatEther } = ethers.utils;

describe("Vault", () => {
  beforeEach(async () => {
    this.formatResult = (amount) => Number(formatEther(amount));
    const { deployer } = await getNamedAccounts();
    this.parseEther = parseEther;
    this.formatEther = formatEther;
    this.deployer = deployer;
    this.deployerSigner = await ethers.getSigner(deployer);

    this.users = [];
    const signers = await ethers.getSigners();
    for (const signer of signers) {
      const addr = await signer.getAddress();
      this.users.push({ address: addr, signer });
    }

    this.deployer = this.users[0].address;
    this.team = this.users[1].address;
    this.dev = this.users[2].address;
    this.regenerator = this.users[3].address;
    this.user1 = this.users[4].address;
    this.user2 = this.users[5].address;
    this.user3 = this.users[6].address;
    this.user4 = this.users[7].address;

    await deployments.fixture();
    await setTestVars(this, ethers, deployments);
    const endUsers = this.users.slice(4, this.users.length);
    // Transfer some tokens for users
    this.userBaseYGYBalance = parseEther("500");
    this.userBaseRAMBalance = parseEther("200");
    await Promise.all(
      endUsers.map(async ({ address }) => {
        await this.YGY.transfer(address, this.userBaseYGYBalance);
        await this.RAM.transfer(address, this.userBaseRAMBalance);
      })
    );

    // Just approve the vault and router here
    await Promise.all(
      endUsers.map(async ({ signer }) => {
        await this.YGY.connect(signer).approve(this.RAMRouter.address, MAX_INT);
        await this.YGYRAMPair.connect(signer).approve(this.RAMVault.address, MAX_INT);
        await this.RAM.connect(signer).approve(this.RAMVault.address, MAX_INT);
      })
    );
  });

  it("should be able to add liquidity with only YGY", async () => {
    const user = this.users[4];
    const DepositAmount = 100;
    await this.RAMRouter.connect(user.signer).addLiquidityYGYOnly(this.parseEther(DepositAmount.toString()), false).should.be.fulfilled;
    const balanceOfUser = this.formatResult(await this.YGY.balanceOf(user.address));
    balanceOfUser.should.be.equal(this.formatResult(this.userBaseYGYBalance) - DepositAmount);

    const YGYRAMBalanceOfUser = this.formatResult(await this.YGYRAMPair.balanceOf(user.address));
    console.log("YGYRAMBalance with 100 YGY deposit: ", YGYRAMBalanceOfUser);
    YGYRAMBalanceOfUser.should.be.greaterThan(0);
  });

  it("should be able to add liquidity with only eth", async () => {
    const user = this.users[4];

    await this.WETH.connect(user.signer).deposit({ value: parseEther("20") });
    await this.RAMRouter.connect(user.signer).addLiquidityETHOnly(user.address, false, { value: parseEther("25") });

    const YGYRAMBalanceOfUser = this.formatResult(await this.YGYRAMPair.balanceOf(user.address));
    YGYRAMBalanceOfUser.should.be.greaterThan(0);
  });

  it("RAM vault: YGY->RAM pool deposit and withdraw", async () => {
    const user = this.users[4];
    const user2 = this.users[5];

    // Add a new pool
    await this.RAMVault.addPool(100, this.YGYRAMPair.address, true);

    // Add liquiditiess.
    await this.RAMRouter.connect(user2.signer).addLiquidityYGYOnly(parseEther("100"), true);
    await this.RAMRouter.connect(user.signer).addLiquidityETHOnly(user.address, false, { value: parseEther("1") });

    const user1LPBalance = await this.YGYRAMPair.balanceOf(user.address);
    const user2LPBalance = await this.YGYRAMPair.balanceOf(user2.address);

    // Deposit
    await this.RAMVault.connect(user.signer).deposit(0, user1LPBalance);
    await this.RAMVault.connect(user.signer).withdraw(0, user1LPBalance);
    await this.RAMVault.connect(user2.signer).withdraw(0, user2LPBalance);
  });

  it("RAM vault: YGY->RAM pool purchase boosts", async () => {
    const user = this.users[4];
    const user2 = this.users[5];

    // Add a new pool
    await this.RAMvault.add(100, this.YGYRAMPair.address, true);

    await this.RAMRouter.addLiquidityETHOnly(user2.address, true, { value: parseEther("2") }).should.be.fulfilled;

    // Approve and deposit
    await this.YGYRAMPair.approve(this.RAMvault.address, (1 * 1e17).toString(), { from: testAccount2 });
    truffleAssert.passes(await this.RAMvault.deposit(0, (1 * 1e17).toString(), { from: testAccount2 }));

    const userBefore = await this.RAMvault.userInfo.call(0, testAccount2);
    assert.isTrue(userBefore.boostLevel == 0);
    assert.isTrue(userBefore.amount == 1e17);
    assert.isTrue(userBefore.boostAmount == 0);

    const poolBefore = await this.RAMvault.poolInfo.call(0);
    assert.isTrue(poolBefore.effectiveAdditionalTokensFromBoosts == 0);

    // Load testAccount2
    await this.RAMToken.transfer(testAccount2, (5.8 * 1e18).toString(), { from: setterAccount });

    // Approve RAM tokens and purchase boost
    await this.RAMToken.approve(this.RAMvault.address, (5.8 * 1e18).toString(), { from: testAccount2 });
    truffleAssert.passes(await this.RAMvault.purchase(0, 1, { from: testAccount2 }));

    const userAfter = await this.RAMvault.userInfo.call(0, testAccount2);
    assert.isTrue(userAfter.boostLevel == 1);
    assert.isTrue(userAfter.amount == 1e17);
    assert.isTrue(userAfter.boostAmount == 1e17 * 0.05);

    const poolAfter = await this.RAMvault.poolInfo.call(0);
    assert.isTrue(poolAfter.effectiveAdditionalTokensFromBoosts == 1e17 * 0.05);

    truffleAssert.passes(await this.RAMvault.withdraw(0, (1e17).toString(), { from: testAccount2 }));

    const userAfterWithdraw = await this.RAMvault.userInfo.call(0, testAccount2);
    assert.isTrue(userAfterWithdraw.boostLevel == 1);
    assert.isTrue(userAfterWithdraw.amount == 0);
    assert.isTrue(userAfterWithdraw.boostAmount == 0);

    const poolAfterWithdraw = await this.RAMvault.poolInfo.call(0);
    assert.isTrue(poolAfterWithdraw.effectiveAdditionalTokensFromBoosts == 0);
  });
});
