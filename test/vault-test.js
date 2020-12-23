const { deployments, ethers, getUnnamedAccounts, getNamedAccounts } = require("hardhat");
const { time, expectRevert } = require("@openzeppelin/test-helpers");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();
const { setTestVars } = require("../scripts/setTestVars");
const MAX_INT = "11579208923731619542357098500868790785326998466564056403945758400791312963993";
const { parseEther, formatEther } = ethers.utils;

describe("Vault + Router", () => {
  beforeEach(async () => {
    this.formatResult = (amount) => Number(formatEther(amount));
    const { deployer, teamaddr, devaddr, regeneratoraddr } = await getNamedAccounts();
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
    this.team = teamaddr;
    this.dev = devaddr;
    this.regenerator = regeneratoraddr;
    this.user1 = this.users[4].address;
    this.user2 = this.users[5].address;
    this.user3 = this.users[6].address;
    this.user4 = this.users[7].address;

    this.boostLevels = [0, 0.05, 0.15, 0.3, 0.6];

    await deployments.fixture();
    await setTestVars(this, ethers, deployments);
    const endUsers = this.users.slice(4, this.users.length);
    // Transfer some tokens for users
    this.userBaseYGYBalance = parseEther("1000");
    this.userBaseRAMBalance = parseEther("1000");
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

  it("RAMRouter: Should be able to add liquidity with only YGY", async () => {
    const user = this.users[4];
    const DepositAmount = 100;
    await this.RAMRouter.connect(user.signer).addLiquidityYGYOnly(parseEther(DepositAmount.toString()), false).should.be.fulfilled;
    console.log(this.YGY.address, user.address);
    const balanceOfUser = await this.YGY.balanceOf(user.address);
    (balanceOfUser / 1e18).should.be.equal(parseFloat(formatEther(this.userBaseYGYBalance)) - DepositAmount);

    const YGYRAMBalanceOfUser = this.formatResult(await this.YGYRAMPair.balanceOf(user.address));
    console.log("YGYRAMBalance with 100 YGY deposit: ", YGYRAMBalanceOfUser);
    YGYRAMBalanceOfUser.should.be.greaterThan(0);
  });

  it("RAMRouter: Should be able to add liquidity with only eth", async () => {
    const user = this.users[4];

    await this.WETH.connect(user.signer).deposit({ value: parseEther("20") });
    await this.RAMRouter.connect(user.signer).addLiquidityETHOnly(user.address, false, { value: parseEther("25") });

    const YGYRAMBalanceOfUser = this.formatResult(await this.YGYRAMPair.balanceOf(user.address));
    YGYRAMBalanceOfUser.should.be.greaterThan(0);
  });

  it("RAMVault: YGY->RAM pool deposit and withdraw", async () => {
    const user = this.users[4];
    const user2 = this.users[5];

    // Add a new pool
    // await this.RAMVault.addPool(100, this.YGYRAMPair.address, true);

    // Add liquiditiess.
    await this.RAMRouter.connect(user2.signer).addLiquidityYGYOnly(parseEther("100"), false);
    await this.RAMRouter.connect(user.signer).addLiquidityETHOnly(user.address, false, { value: parseEther("12") });

    const user1LPBalance = await this.YGYRAMPair.balanceOf(user.address);
    const user2LPBalance = await this.YGYRAMPair.balanceOf(user2.address);
    (user1LPBalance / 1e18).should.be.greaterThan(0);
    (user2LPBalance / 1e18).should.be.greaterThan(0);

    // Deposit
    await this.RAMVault.connect(user.signer).deposit(0, user1LPBalance).should.be.fulfilled;
    await this.RAMVault.connect(user2.signer).deposit(0, user2LPBalance).should.be.fulfilled;
    // Withdraw
    await this.RAMVault.connect(user.signer).withdraw(0, user1LPBalance).should.be.fulfilled;
    await this.RAMVault.connect(user2.signer).withdraw(0, user2LPBalance).should.be.fulfilled;
  });

  it("RAMVault: YGY->RAM pool purchase boosts", async () => {
    const user = this.users[4];
    const user2 = this.users[5];

    // Add a new pool
    // await this.RAMVault.addPool(100, this.YGYRAMPair.address, true);

    // Auto-stake dude
    await this.RAMRouter.addLiquidityETHOnly(user.address, true, { value: parseEther("1") }).should.be.fulfilled;

    const userBefore = await this.Storage.userInfo(0, user.address);
    Number(userBefore.boostLevel).should.be.equal(0);
    (userBefore.amount / 1e18).should.be.greaterThan(0);
    console.log("User got", userBefore.amount / 1e18, "LP tokens with 1 ETH");
    Number(userBefore.boostAmount).should.be.equal(0);

    const poolBeforeFirstBost = await this.Storage.poolInfo(0);
    Number(poolBeforeFirstBost.effectiveAdditionalTokensFromBoosts).should.equal(0);

    await this.RAMVault.connect(user.signer).purchase(0, 2);

    const userAfter = await this.Storage.userInfo(0, user.address);
    Number(userAfter.boostLevel).should.be.equal(2);
    (userAfter.amount / 1e18).should.be.equal(userBefore.amount / 1e18);
    (userAfter.boostAmount / 1e18).should.be.equal((userAfter.amount / 1e18) * this.boostLevels[2]);

    const poolAfterFirstBoost = await this.Storage.poolInfo(0);
    Number(poolAfterFirstBoost.effectiveAdditionalTokensFromBoosts).should.be.equal(Number(userAfter.boostAmount));

    // Manual deposit for this guy
    await this.RAMRouter.addLiquidityETHOnly(user2.address, false, { value: parseEther("1") }).should.be.fulfilled;
    const User2LPBalance = await this.YGYRAMPair.balanceOf(user2.address);
    (User2LPBalance / 1e18).should.be.greaterThan(0);
    await this.RAMVault.connect(user2.signer).deposit(0, User2LPBalance);

    // Before boost stats
    const user2Before = await this.Storage.userInfo(0, user2.address);
    Number(user2Before.boostLevel).should.be.equal(0);
    (user2Before.amount / 1e18).should.be.equal(User2LPBalance / 1e18);
    Number(user2Before.boostAmount).should.be.equal(0);

    // For pool aswell
    const poolBeforeSecondBoost = await this.Storage.poolInfo(0);
    Number(poolBeforeSecondBoost.effectiveAdditionalTokensFromBoosts).should.equal(
      Number(poolAfterFirstBoost.effectiveAdditionalTokensFromBoosts)
    );

    // Get level 3 (30%)
    await this.RAMVault.connect(user2.signer).purchase(0, 3);

    // Stats after
    const user2After = await this.Storage.userInfo(0, user2.address);
    Number(user2After.boostLevel).should.be.equal(3);
    (user2After.amount / 1e18).should.be.equal(user2Before.amount / 1e18);
    (user2After.boostAmount / 1e18).should.be.equal((user2After.amount / 1e18) * this.boostLevels[3]);

    // Pool effective should equal sum of user1 and 2.
    const poolAfterSecondBoost = await this.Storage.poolInfo(0);
    (poolAfterSecondBoost.effectiveAdditionalTokensFromBoosts / 1e18).should.closeTo(
      user2After.boostAmount / 1e18 + userAfter.boostAmount / 1e18,
      0.01
    );

    // Withdraw half for user 2
    await this.RAMVault.connect(user2.signer).withdraw(0, parseEther((user2Before.amount / 1e18 / 2).toString()));
    const user2AfterWithdraw = await this.Storage.userInfo(0, user2.address);
    (user2AfterWithdraw.amount / 1e18).should.be.closeTo(user2After.amount / 1e18 / 2, 0.001);
    Number(user2AfterWithdraw.boostLevel).should.equal(3);
    (user2AfterWithdraw.boostAmount / 1e18).should.be.closeTo(user2After.boostAmount / 1e18 / 2, 0.001);

    // Withdraw all for user 1
    await this.RAMVault.connect(user.signer).withdraw(0, userBefore.amount);
    const userAfterWithdraw = await this.Storage.userInfo(0, user.address);
    Number(userAfterWithdraw.amount).should.equal(0);
    Number(userAfterWithdraw.boostLevel).should.equal(2);
    Number(userAfterWithdraw.boostAmount).should.equal(0);

    // Withdraw all for user 2
    await this.RAMVault.connect(user2.signer).withdraw(0, user2AfterWithdraw.amount);
    const user2AfteFullWithdraw = await this.Storage.userInfo(0, user2.address);
    Number(user2AfteFullWithdraw.amount).should.equal(0);
    Number(user2AfteFullWithdraw.boostLevel).should.equal(3);
    Number(user2AfteFullWithdraw.boostAmount).should.equal(0);

    const poolAfterWithdraws = await this.Storage.poolInfo(0);
    Number(poolAfterWithdraws.effectiveAdditionalTokensFromBoosts).should.equal(0);

    // Stake again, should be the same result as before
    await this.RAMVault.connect(user.signer).deposit(0, userBefore.amount);
    const userAfterSecondDeposit = await this.Storage.userInfo(0, user.address);
    userAfterSecondDeposit.amount.should.equal(userBefore.amount);
    Number(userAfterSecondDeposit.boostLevel).should.equal(2);
    (userAfterSecondDeposit.boostAmount / 1e18).should.equal(userAfter.boostAmount / 1e18);

    // Pool should be updated once again
    const poolAfterDeposit = await this.Storage.poolInfo(0);
    poolAfterDeposit.effectiveAdditionalTokensFromBoosts.should.equal(userAfterSecondDeposit.boostAmount);
  });

  it("RAMVault: earn RAM rewards", async () => {
    const user = this.users[4];
    const user2 = this.users[5];
    const user3 = this.users[6];

    // Add a new pool
    const belowBalVault = (await this.RAM.balanceOf(this.RAMVault.address)) / 1e18;
    // await this.RAMVault.addPool(100, this.YGYRAMPair.address, true);

    await this.RAMRouter.connect(user.signer).addLiquidityETHOnly(user.address, true, { value: parseEther("5") });

    await this.RAMVault.massUpdatePools();
    const beforeBalUser = (await this.RAM.balanceOf(user.address)) / 1e18;
    console.log("User balance before:", beforeBalUser);
    console.log("Vault balance before:", belowBalVault);

    // Do some token transfers
    await this.RAM.connect(user2.signer).transfer(this.deployer, parseEther("20"));
    await this.RAM.transfer(user2.address, parseEther("200"));
    await this.RAMVault.massUpdatePools();
    await this.RAM.connect(user3.signer).transfer(user3.address, parseEther("200"));
    await this.RAM.transfer(user3.address, parseEther("400"));
    await this.RAMVault.massUpdatePools();

    // Pool shares
    const poolInfo = await this.Storage.poolInfo(0);
    Number(poolInfo.accRAMPerShare).should.be.greaterThan(0);

    // Advance time forward a month
    await time.increase(time.duration.weeks(4));
    await this.RAMVault.connect(user.signer).withdraw(0, parseEther("1"));

    const afterBalUser = (await this.RAM.balanceOf(user.address)) / 1e18;
    const afterBalVault = (await this.RAM.balanceOf(this.RAMVault.address)) / 1e18;
    console.log("User balance after:", afterBalUser);
    console.log("Vault balance after:", afterBalVault);

    afterBalUser.should.be.greaterThan(beforeBalUser);
    afterBalVault.should.be.lessThan(belowBalVault);
  });

  it("RAMVault: claims rewards, distributes ygy, dev fund", async () => {
    const user = this.users[4];
    const user2 = this.users[5];
    const user3 = this.users[6];

    // Add a new pool
    console.log(this.RAMVault.address);
    // await this.RAMVault.addPool(100, this.YGYRAMPair.address, true);

    // Approve and deposit
    await this.RAMRouter.addLiquidityETHOnly(user2.address, true, { value: parseEther("2") });
    await this.RAMRouter.connect(user3.signer).addLiquidityYGYOnly(parseEther("40"), true);
    await this.RAMRouter.addLiquidityETHOnly(user3.address, true, { value: parseEther("3") });
    await this.RAMRouter.addLiquidityETHOnly(user2.address, true, { value: parseEther("10") });
    await this.RAMRouter.connect(user.signer).addLiquidityYGYOnly(parseEther("75"), true);
    await this.RAMRouter.connect(user3.signer).addLiquidityYGYOnly(parseEther("40"), true);
    await this.RAMRouter.addLiquidityETHOnly(user.address, false, { value: parseEther("2") });
    await this.RAMRouter.addLiquidityETHOnly(user3.address, false, { value: parseEther("2") });

    // Add ygy
    const YGYrewards = parseEther("10000");
    await this.YGY.approve(this.RAMVault.address, MAX_INT);
    await this.RAMVault.addYGYRewardsOwner(YGYrewards);

    // Do some token transfers
    await this.RAM.connect(user2.signer).transfer(this.deployer, parseEther("20"));
    await this.RAM.transfer(user2.address, parseEther("200"));
    await this.RAMVault.massUpdatePools();
    await this.RAM.connect(user3.signer).transfer(user3.address, parseEther("200"));
    await this.RAM.transfer(user3.address, parseEther("400"));
    await this.RAMVault.massUpdatePools();

    const [
      beforeRamBalUser,
      beforeRamBalUser2,
      beforeBalYgyUser,
      beforeBalYgyUser2,
      beforeBalRamVault,
      beforeBalYgyVault,
    ] = await Promise.all([
      Number(await this.RAM.balanceOf(user.address)),
      Number(await this.RAM.balanceOf(user2.address)),
      Number(await this.YGY.balanceOf(user.address)),
      Number(await this.YGY.balanceOf(user2.address)),
      Number(await this.RAM.balanceOf(this.RAMVault.address)),
      Number(await this.YGY.balanceOf(this.RAMVault.address)),
    ]);

    console.table([
      ["User 1 ram balance before", beforeRamBalUser / 1e18],
      ["User 1 ygy balance before", beforeBalYgyUser / 1e18],
      ["User 2 ram balance before", beforeRamBalUser2 / 1e18],
      ["User 2 ygy balance before", beforeBalYgyUser2 / 1e18],
      ["Vault ram balance before", beforeBalRamVault / 1e18],
      ["Vault ygy balance before", beforeBalYgyVault / 1e18],
    ]);

    // Do some token transfers
    await this.RAM.connect(user2.signer).transfer(this.deployer, parseEther("20"));
    await this.RAM.transfer(user2.address, parseEther("200"));
    await this.RAM.connect(user3.signer).transfer(user3.address, parseEther("200"));
    await this.RAM.transfer(user3.address, parseEther("400"));

    // Advance time forward a half a month, then mass update
    await time.increase(time.duration.weeks(2));
    await this.RAMVault.massUpdatePools();

    // Get pending rewards at this point
    const pendingRewardsTwoWeeks = await this.RAMVault.checkRewards(0, user.address);
    const pendingRewardsTwoWeeks2 = await this.RAMVault.checkRewards(0, user2.address);
    await this.RAMVault.massUpdatePools();

    const pendingRamHalfMonth = Number(pendingRewardsTwoWeeks.pendingRAM);
    const pendingYgyHalfMonth = Number(pendingRewardsTwoWeeks.pendingYGY);
    const pendingRamHalfMonth2 = Number(pendingRewardsTwoWeeks2.pendingRAM);
    const pendingYgyHalfMonth2 = Number(pendingRewardsTwoWeeks2.pendingYGY);
    // Advance time forward another two weeks

    // Has rewards available
    pendingRamHalfMonth.should.be.greaterThan(0);
    pendingYgyHalfMonth.should.be.greaterThan(0);
    pendingRamHalfMonth2.should.be.greaterThan(0);
    pendingYgyHalfMonth2.should.be.greaterThan(0);

    // Transfers
    await this.RAM.connect(user2.signer).transfer(this.deployer, parseEther("20"));
    await time.increase(time.duration.days(5));
    await this.RAM.transfer(user2.address, parseEther("2000"));
    await this.RAM.connect(user3.signer).transfer(user3.address, parseEther("20"));
    await time.increase(time.duration.days(5));
    await this.RAM.transfer(user3.address, parseEther("40"));

    // Advance
    await time.increase(time.duration.weeks(1));
    await this.RAMVault.massUpdatePools();

    // Should have more?
    const pendingRewardsFullMonth = await this.RAMVault.checkRewards(0, user.address);
    const pendingRewardsFullMonthUser2 = await this.RAMVault.checkRewards(0, user2.address);

    const pendingRamFullMonth = Number(pendingRewardsFullMonth.pendingRAM);
    const pendingRamFullMonthUser2 = Number(pendingRewardsFullMonthUser2.pendingRAM);
    const pendingYgyFullMonth = Number(pendingRewardsFullMonth.pendingYGY);

    // assert.isTrue(pendingRamFullMonth > pendingRamHalfMonth);
    // assert.isTrue(pendingRamFullMonthUser2 > pendingRamHalfMonthUser2);
    // assert.isTrue(pendingYgyFullMonth > pendingYgyHalfMonth); // * NAH

    await this.RAMVault.connect(user.signer).claimRewards(0);
    await this.RAMVault.connect(user2.signer).claimRewards(0);
    await this.RAMVault.connect(user3.signer).claimRewards(0);

    const [
      afterBalRamUser,
      afterBalRamUser2,
      afterBalRamYgyUser,
      afterBalRamYgyUser2,
      afterBalRamVault,
      afterBalYgyVault,
    ] = await Promise.all([
      Number(await this.RAM.balanceOf(user.address)),
      Number(await this.RAM.balanceOf(user2.address)),
      Number(await this.YGY.balanceOf(user.address)),
      Number(await this.YGY.balanceOf(user2.address)),
      Number(await this.RAM.balanceOf(this.RAMVault.address)),
      Number(await this.YGY.balanceOf(this.RAMVault.address)),
    ]);
    console.table([
      ["User 1 ram balance after:", afterBalRamUser / 1e18],
      ["User 1 ygy balance after:", afterBalRamYgyUser / 1e18],
      ["User 2 ram balance after:", afterBalRamUser2 / 1e18],
      ["User 2 ygy balance after:", afterBalRamYgyUser2 / 1e18],
      ["Vault ram balance after", afterBalRamVault / 1e18],
      ["Vault ygy balance after", afterBalYgyVault / 1e18],
    ]);
    afterBalRamUser.should.be.greaterThan(beforeRamBalUser);
    afterBalRamUser2.should.be.greaterThan(beforeRamBalUser2);
    afterBalRamYgyUser.should.be.greaterThan(beforeBalYgyUser);
    afterBalRamVault.should.be.lessThan(beforeBalRamVault);

    const [ygyTeamBalance, ygyDevBalance, ramTeamBalance, ramDevBalance] = await Promise.all([
      Number(await this.YGY.balanceOf(this.team)),
      Number(await this.YGY.balanceOf(this.dev)),
      Number(await this.RAM.balanceOf(this.team)),
      Number(await this.RAM.balanceOf(this.dev)),
    ]);

    ygyTeamBalance.should.be.greaterThan(0);
    ygyDevBalance.should.be.greaterThan(0);
    ramTeamBalance.should.be.greaterThan(0);
    ramDevBalance.should.be.greaterThan(0);
    console.table([
      ["Team YGY balance:", ygyTeamBalance],
      ["Team RAM balance", ramTeamBalance],
      ["Dev YGY balance:", ygyDevBalance],
      ["Dev RAM balance", ramDevBalance],
    ]);

    // const cost = await this.RAMVault.calculateCost(1);
    // console.log(cost);
  });
});
