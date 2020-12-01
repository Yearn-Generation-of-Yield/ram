const UniRAMRouter = artifacts.require("RAMv1Router");
const UniV2Factory = artifacts.require("UniswapV2Factory");
const NFTFactory = artifacts.require("NFTFactory");
const NFT = artifacts.require("NFT");
const WETH = artifacts.require("WETH9");
const RAM = artifacts.require("RAM");
const RAMVAULT = artifacts.require("RAMVault");
const Token = artifacts.require("Token");
const UniV2Pair = artifacts.require("UniswapV2Pair");
const Governance = artifacts.require("Governance");
const FeeApprover = artifacts.require("FeeApprover");

const truffleAssert = require("truffle-assertions");
const assert = require("chai").assert;
const timeMachine = require("ganache-time-traveler");

contract("UniRAMRouter", (accounts) => {
  let testAccount = accounts[0];
  let setterAccount = accounts[1];
  let testAccount2 = accounts[2];
  let testAccount3 = accounts[3];
  let devAccount = accounts[4];

  let teamAddr = accounts[5];
  let rengeneratorAddr = accounts[6];

  beforeEach(async () => {
    // Take time snapshot
    let snapshot = await timeMachine.takeSnapshot();
    snapshotId = snapshot["result"];

    // Deploy a new Uniswap Factory and set 'setterAccount' which collects fees
    this.uniV2Factory = await UniV2Factory.new(setterAccount);

    // Deploy a new WETH wrapped Ethereum token [FOR TESTING]
    this.weth = await WETH.new();

    // Deposit Ethereum and get WETH tokens
    this.weth.deposit({ from: testAccount2, value: (5e18).toString() });
    this.weth.deposit({ from: setterAccount, value: (5e18).toString() });

    // Deploy the YGY token
    this.YGYToken = await Token.new("YGY", "YGY", (200 * 1e18).toString(), { from: setterAccount });

    // Deploy a new RAM token which manages Governance for the protocol
    this.RAMToken = await RAM.new(this.uniV2Factory.address, { from: setterAccount });

    // Deploy a new FeeApprover contract
    this.feeapprover = await FeeApprover.new({ from: setterAccount });

    // Create a YGY-WETH pair on uniswap [FOR TESTING, this would be created by RAM constructor in production]
    this.YGYWETHPair = await UniV2Pair.at(
      (await this.uniV2Factory.createPair(this.weth.address, this.YGYToken.address, { from: setterAccount })).receipt.logs[0].args.pair
    );
    // Create a YGY-RAM pair on uniswap [FOR TESTING, this would be created by RAM constructor in production]
    this.YGYRAMPair = await UniV2Pair.at(
      (await this.uniV2Factory.createPair(this.RAMToken.address, this.YGYToken.address, { from: setterAccount })).receipt.logs[0].args.pair
    );
    // Deploy RAMvault to manage yield farms
    this.RAMvault = await RAMVAULT.new({ from: setterAccount });
    // // Initialize RAMVault
    await this.RAMvault.initialize(this.RAMToken.address, this.YGYToken.address, devAccount, teamAddr, rengeneratorAddr, setterAccount, {
      from: setterAccount,
    });

    // Now we can initialize the FeeApprover contract
    await this.feeapprover.initialize(this.RAMToken.address, this.YGYToken.address, this.uniV2Factory.address, { from: setterAccount });

    await this.feeapprover.setPaused(false, { from: setterAccount });

    // Sets transferCheckerAddress() to setter account
    await this.RAMToken.setShouldTransferChecker(this.feeapprover.address, { from: setterAccount });
    await this.RAMToken.setFeeDistributor(this.RAMvault.address, { from: setterAccount });

    // The next 3 commands simulate a LGE where RAM/WETH is contributed and the contributor receives RAMPair tokens
    await this.YGYToken.transfer(this.YGYWETHPair.address, (4 * 1e18).toString(), { from: setterAccount });
    await this.weth.transfer(this.YGYWETHPair.address, (4 * 1e18).toString(), { from: setterAccount });
    await this.YGYWETHPair.mint(setterAccount);

    await this.YGYToken.transfer(this.YGYRAMPair.address, (5 * 1e18).toString(), { from: setterAccount });
    await this.RAMToken.transfer(this.YGYRAMPair.address, (5 * 1e18).toString(), { from: setterAccount });
    await this.YGYRAMPair.mint(setterAccount);

    // Deploy NFT Factory
    this.nftFactory = await NFTFactory.new({ from: setterAccount });
    // Simulate NFT deployment to get NFT expected contract address, then deploy the NFT
    const nftAddr1 = await this.nftFactory.deployNFT.call("RAM level 1", "RAMLEVEL1NFT", "ram.level1", { from: setterAccount });
    await this.nftFactory.deployNFT("RAM level 1", "RAMLEVEL1NFT", "ram.level1", { from: setterAccount });
    const nftAddr2 = await this.nftFactory.deployNFT.call("RAM level 2", "RAMLEVEL2NFT", "ram.level2", { from: setterAccount });
    await this.nftFactory.deployNFT("RAM level 2", "RAMLEVEL1NFT", "ram.level2", { from: setterAccount });
    const nftAddr3 = await this.nftFactory.deployNFT.call("RAM level 3", "RAMLEVEL3NFT", "ram.level3", { from: setterAccount });
    await this.nftFactory.deployNFT("RAM level 3", "RAMLEVEL1NFT", "ram.level3", { from: setterAccount });
    const nftAddr4 = await this.nftFactory.deployNFT.call("RAM level 4", "RAMLEVEL4NFT", "ram.level4", { from: setterAccount });
    await this.nftFactory.deployNFT("RAM level 4", "RAMLEVEL1NFT", "ram.level4", { from: setterAccount });
    const nftAddr5 = await this.nftFactory.deployNFT.call("RAM level 5", "RAMLEVEL5NFT", "ram.level5", { from: setterAccount });
    await this.nftFactory.deployNFT("RAM level 5", "RAMLEVEL1NFT", "ram.level5", { from: setterAccount });

    // Deploy a dummy dXIOT token to use as Robot NFT
    this.dXiotToken = await Token.new("dXIOT", "dXIOT", (90 * 1e18).toString(), { from: setterAccount });
    const robotNFT = await this.nftFactory.deployNFT.call("RAM Robot NFT", "RAMROBOTNFT", "ram.robot", { from: setterAccount });
    await this.nftFactory.deployNFT("RAM Robot NFT", "RAMROBOTNFT", "ram.robot", { from: setterAccount });

    // Deploy a dummy dXIOT token to use as Robot NFT
    const linkNFT = await this.nftFactory.deployNFT.call("RAM LINK NFT", "RAMLINKNFT", "ram.link", { from: setterAccount });
    await this.nftFactory.deployNFT("RAM LINK NFT", "RAMLINKNFT", "ram.link", { from: setterAccount });

    this.nftAddrs = [nftAddr1, nftAddr2, nftAddr3, nftAddr4, nftAddr5, robotNFT, linkNFT];

    // // Deploy RAMRouter contract
    this.RAMRouter = await UniRAMRouter.new(
      this.RAMToken.address,
      this.YGYToken.address,
      this.weth.address,
      this.uniV2Factory.address,
      this.YGYRAMPair.address,
      this.YGYWETHPair.address,
      this.feeapprover.address,
      this.RAMvault.address,
      this.nftFactory.address,
      this.nftAddrs,
      rengeneratorAddr,
      this.dXiotToken.address,
      { from: setterAccount }
    );

    // // Bond NFT factory and deploy NFTs using RAM router
    await this.nftFactory.bondContract(this.RAMRouter.address, { from: setterAccount });

    // // Deploy governance contract and set on router
    this.governance = await Governance.new(this.YGYToken.address, this.RAMRouter.address);
    this.RAMRouter.setGovernance(this.governance.address, { from: setterAccount });
  });

  it("should be able to add liquidity with only YGY", async () => {
    await this.YGYToken.transfer(testAccount, (2e18).toString(), { from: setterAccount });

    await this.YGYToken.approve(this.RAMRouter.address, (2e18).toString(), { from: testAccount });
    truffleAssert.passes(await this.RAMRouter.addLiquidityYGYOnly((1e18).toString(), false, { from: testAccount }));

    assert.isTrue((await this.YGYRAMPair.balanceOf(testAccount)).gt(0));
  });

  it("should be able to add liquidity with only eth", async () => {
    truffleAssert.passes(await this.RAMRouter.addLiquidityETHOnly(testAccount2, false, { from: testAccount2, value: (1e18).toString() }));

    assert.isTrue((await this.YGYRAMPair.balanceOf(testAccount2)).gt(0));
  });

  it("RAM vault: YGY->RAM pool deposit and withdraw", async () => {
    // Add a new pool
    truffleAssert.passes(await this.RAMvault.add(100, this.YGYRAMPair.address, true, true, { from: setterAccount }));

    truffleAssert.passes(await this.RAMRouter.addLiquidityETHOnly(testAccount2, false, { from: testAccount2, value: (2e18).toString() }));

    // Approve and deposit
    await this.YGYRAMPair.approve(this.RAMvault.address, (5 * 1e17).toString(), { from: testAccount2 });
    truffleAssert.passes(await this.RAMvault.deposit(0, (5 * 1e17).toString(), { from: testAccount2 }));

    truffleAssert.passes(await this.RAMvault.withdraw(0, (5 * 1e17).toString(), { from: testAccount2 }));
  });

  it("RAM vault: YGY->RAM pool purchase boosts", async () => {
    // Add a new pool
    truffleAssert.passes(await this.RAMvault.add(100, this.YGYRAMPair.address, true, true, { from: setterAccount }));

    truffleAssert.passes(await this.RAMRouter.addLiquidityETHOnly(testAccount2, false, { from: testAccount2, value: (2e18).toString() }));

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

  it("RAM vault: earn RAM rewards", async () => {
    // Add a new pool
    truffleAssert.passes(await this.RAMvault.add(100, this.YGYRAMPair.address, true, true, { from: setterAccount }));

    truffleAssert.passes(await this.RAMRouter.addLiquidityETHOnly(testAccount2, false, { from: testAccount2, value: (2e18).toString() }));

    // Approve and deposit
    await this.YGYRAMPair.approve(this.RAMvault.address, (5 * 1e17).toString(), { from: testAccount2 });
    truffleAssert.passes(await this.RAMvault.deposit(0, (5 * 1e17).toString(), { from: testAccount2 }));

    const beforeBalUser = Number(await this.RAMToken.balanceOf(testAccount2));
    const belowBalVault = Number(await this.RAMToken.balanceOf(this.RAMvault.address));
    console.log("User balance before:", beforeBalUser);
    console.log("Vault balance before:", belowBalVault);

    // Do some token transfers
    await this.RAMToken.transfer(testAccount, (5e18).toString(), { from: setterAccount });
    await this.RAMToken.transfer(setterAccount, (4.5e18).toString(), { from: testAccount });
    await this.RAMToken.transfer(testAccount, (3e18).toString(), { from: setterAccount });

    // Advance time forward a month
    const oneMonthInSeconds = 2419200;
    await timeMachine.advanceTimeAndBlock(oneMonthInSeconds);

    truffleAssert.passes(await this.RAMvault.withdraw(0, (4e17).toString(), { from: testAccount2 }));

    const afterBalUser = Number(await this.RAMToken.balanceOf(testAccount2));
    const afterBalVault = Number(await this.RAMToken.balanceOf(this.RAMvault.address));
    console.log("User balance after:", afterBalUser);
    console.log("Vault balance after:", afterBalVault);

    assert.isTrue(afterBalUser > beforeBalUser);
    assert.isTrue(afterBalVault < belowBalVault);
  });

  it.only("RAM vault: claims rewards, distributes ygy", async () => {
    // Add a new pool
    truffleAssert.passes(await this.RAMvault.add(100, this.YGYRAMPair.address, true, true, { from: setterAccount }));

    // Approve and deposit
    truffleAssert.passes(await this.RAMRouter.addLiquidityETHOnly(testAccount2, true, { from: testAccount2, value: (2e18).toString() }));
    truffleAssert.passes(await this.RAMRouter.addLiquidityETHOnly(testAccount3, true, { from: testAccount3, value: (2e18).toString() }));
    truffleAssert.passes(await this.RAMRouter.addLiquidityETHOnly(testAccount3, true, { from: testAccount3, value: (20e18).toString() }));
    truffleAssert.passes(await this.RAMRouter.addLiquidityETHOnly(testAccount2, true, { from: testAccount2, value: (2e18).toString() }));
    truffleAssert.passes(await this.RAMRouter.addLiquidityETHOnly(testAccount2, false, { from: testAccount2, value: (2e18).toString() }));
    truffleAssert.passes(await this.RAMRouter.addLiquidityETHOnly(testAccount2, false, { from: testAccount2, value: (2e18).toString() }));
    truffleAssert.passes(await this.RAMRouter.addLiquidityETHOnly(testAccount2, false, { from: testAccount2, value: (2e18).toString() }));

    // Approve and deposit user 2
    // await this.YGYRAMPair.approve(this.RAMvault313.address, (5 * 1e17).toString(), { from: testAccount2 });
    // await this.YGYRAMPair.approve(this.RAMvault.address, (5 * 1e16).toString(), { from: testAccount3 });
    // truffleAssert.passes(await this.RAMvault.deposit(0, (5 * 1e16).toString(), { from: testAccount2 }));
    // truffleAssert.passes(await this.RAMvault.deposit(0, (5 * 1e16).toString(), { from: testAccount3 }));

    // Do some token transfers
    await this.RAMToken.transfer(testAccount, (5e18).toString(), { from: setterAccount });
    await this.RAMToken.transfer(setterAccount, (4.5e18).toString(), { from: testAccount });
    await this.RAMToken.transfer(testAccount, (3e18).toString(), { from: setterAccount });

    const [beforeRamBalUser, beforeRamBalUser2, beforeBalYgyUser, beforeBalYgyUser2, beforeBalRamVault] = await Promise.all([
      Number(await this.RAMToken.balanceOf(testAccount2)),
      Number(await this.RAMToken.balanceOf(testAccount3)),
      Number(await this.YGYToken.balanceOf(testAccount2)),
      Number(await this.YGYToken.balanceOf(testAccount3)),
      Number(await this.RAMToken.balanceOf(this.RAMvault.address)),
    ]);
    console.table([
      ["User 1 ram balance before", beforeRamBalUser / 1e18],
      ["User 1 ygy balance before", beforeBalYgyUser / 1e18],
      ["User 2 ram balance before", beforeRamBalUser2 / 1e18],
      ["User 2 ygy balance before", beforeBalYgyUser2 / 1e18],
      ["Vault ram balance before", beforeBalRamVault / 1e18],
    ]);

    // Do some token transfers
    await this.RAMToken.transfer(testAccount, (5e18).toString(), { from: setterAccount });
    await this.RAMToken.transfer(setterAccount, (4.5e18).toString(), { from: testAccount });
    await this.RAMToken.transfer(testAccount, (3e18).toString(), { from: setterAccount });

    // Add ygy
    const YGYrewards = web3.utils.toWei("100");
    await this.YGYToken.approve(this.RAMvault.address, YGYrewards, { from: setterAccount });
    await this.RAMvault.addYGYRewardsOwner(YGYrewards, { from: setterAccount });

    // Advance time forward a half a month, then mass updaet
    const halfMonthInSeconds = 2419200 / 2;

    await this.RAMvault.massUpdatePools();
    const pendingRewardsHalfTime = await this.RAMvault.checkRewards(0, testAccount2);
    const pendingRewardsHalfTime2 = await this.RAMvault.checkRewards(0, testAccount3);
    await this.RAMvault.massUpdatePools();
    await timeMachine.advanceTimeAndBlock(45000);

    // Get pending rewards at this point
    const pendingRamHalfMonth = Number(pendingRewardsHalfTime.pendingRAM);
    // const pendingYgyHalfMonth = Number(pendingRewardsHalfTime.pendingYGY);
    const pendingRamHalfMonthUser2 = Number(pendingRewardsHalfTime2.pendingRAM);
    // const pendingYgyHalfMonthUser2 = Number(pendingRewardsHalfTime2.pendingYGY);

    // Has rewards available
    assert.isTrue(pendingRamHalfMonth > 0);
    assert.isTrue(pendingRamHalfMonthUser2 > 0);
    // assert.isTrue(pendingYgyHalfMonth > 0 && pendingYgyHalfMonth > pendingYgyHalfMonthUser2);
    await this.RAMToken.transfer(setterAccount, (3e18).toString(), { from: testAccount });
    await this.RAMToken.transfer(testAccount, (3e18).toString(), { from: setterAccount });
    // Advance
    await timeMachine.advanceTimeAndBlock(halfMonthInSeconds);
    await this.RAMvault.massUpdatePools();
    await timeMachine.advanceTimeAndBlock(45000);

    // Should have more?
    const pendingRewardsFullMonth = await this.RAMvault.checkRewards(0, testAccount2);
    const pendingRewardsFullMonthUser2 = await this.RAMvault.checkRewards(0, testAccount3);

    const pendingRamFullMonth = Number(pendingRewardsFullMonth.pendingRAM);
    const pendingRamFullMonthUser2 = Number(pendingRewardsFullMonthUser2.pendingRAM);
    // const pendingYgyFullMonth = Number(pendingRewardsFullMonth.pendingYGY);

    assert.isTrue(pendingRamFullMonth > pendingRamHalfMonth);
    assert.isTrue(pendingRamFullMonthUser2 > pendingRamHalfMonthUser2);
    // assert.isTrue(pendingYgyFullMonth > pendingYgyHalfMonth); // * NAH

    truffleAssert.passes(await this.RAMvault.claimRewards(0, { from: testAccount3 }));
    truffleAssert.passes(await this.RAMvault.claimRewards(0, { from: testAccount2 }));

    const [
      afterBalRamUser,
      afterBalRamUser2,
      afterBalRamYgyUser,
      afterBalRamYgyUser2,
      afterBalRamVault,
      afterBalYgyVault,
    ] = await Promise.all([
      Number(await this.RAMToken.balanceOf(testAccount2)),
      Number(await this.RAMToken.balanceOf(testAccount3)),
      Number(await this.YGYToken.balanceOf(testAccount2)),
      Number(await this.YGYToken.balanceOf(testAccount3)),
      Number(await this.RAMToken.balanceOf(this.RAMvault.address)),
      Number(await this.YGYToken.balanceOf(this.RAMvault.address)),
    ]);
    console.table([
      ["User 1 ram balance after:", afterBalRamUser / 1e18],
      ["User 1 ygy balance after:", afterBalRamYgyUser / 1e18],
      ["User 2 ram balance after:", afterBalRamUser2 / 1e18],
      ["User 2 ygy balance after:", afterBalRamYgyUser2 / 1e18],
      ["Vault ram balance after", afterBalRamVault / 1e18],
      ["Vault ygy balance after", afterBalYgyVault / 1e18],
    ]);
    assert.isTrue(afterBalRamUser > beforeRamBalUser);
    assert.isTrue(afterBalRamUser2 > beforeRamBalUser2);
    // assert.isTrue(afterBalRamYgyUser > beforeBalYgyUser);
    // assert.isTrue(afterBalYgyVault < beforeBalYgyVault);
    assert.isTrue(afterBalRamVault < beforeBalRamVault);
  });

  //  NOTE:
  //  To test the next two functions, modify the RAMv1Router contract by modifying function applyRandomNumberToLottery():
  //  1. Delete the 'random ready' require check
  //  2. Add `randomResult = 49` to the start of the function

  // With lottery ticket {levelOneChance: 100, levelTwoChance: 50, levelThreeChance: 0, levelFourChance: 0, levelFiveChance: 0 }
  //  and with a random result of 49, this test should return true
  //  it("should win NFTs based on the random number", async () => {
  //     await this.YGYToken.transfer(testAccount, 2e18.toString(), { from: setterAccount });

  //     await this.YGYToken.approve(this.RAMRouter.address, 2e18.toString(), { from: testAccount });
  //     truffleAssert.passes(
  //         await this.RAMRouter.addLiquidityYGYOnly(2e18.toString(), false, { from: testAccount })
  //     );

  //     const NFTOne = await NFT.at(this.nftAddrs[0]);
  //     const NFTTwo = await NFT.at(this.nftAddrs[1]);

  //     const levelOneNFTBalanceBefore = Number(await NFTOne.balanceOf.call(testAccount));
  //     const levelTwoNFTBalanceBefore = Number(await NFTTwo.balanceOf.call(testAccount));

  //     truffleAssert.passes(
  //         await this.RAMRouter.applyRandomNumberToLottery({ from: testAccount })
  //     );

  //     const levelOneNFTBalanceAfter = Number(await NFTOne.balanceOf.call(testAccount));
  //     const levelTwoNFTBalanceAfter = Number(await NFTTwo.balanceOf.call(testAccount));

  //     assert.isTrue(levelOneNFTBalanceAfter == (levelOneNFTBalanceBefore+1));
  //     assert.isTrue(levelTwoNFTBalanceAfter == (levelTwoNFTBalanceBefore));
  // });

  // it("should earn RobotNFTs for holding 20+ dXIOT at wrap time at 10 ETH intervals", async () => {
  //     await this.dXiotToken.transfer(testAccount3, 25e18.toString(), { from: setterAccount });

  //     // Load test account with 20+ dXIOT
  //     truffleAssert.passes(
  //         await this.RAMRouter.addLiquidityETHOnly(testAccount3, false, { from: testAccount3, value: (11e18).toString() })
  //     );

  //     truffleAssert.passes(
  //         await this.RAMRouter.applyRandomNumberToLottery({ from: testAccount3 })
  //     );

  //     const NFTOne = await NFT.at(this.nftAddrs[0]);
  //     const NFTTwo = await NFT.at(this.nftAddrs[1]);
  //     const NFTThree = await NFT.at(this.nftAddrs[2]);
  //     const NFTFour = await NFT.at(this.nftAddrs[3]);
  //     const balanceNFTOne = Number(await NFTOne.balanceOf.call(testAccount3));
  //     const balanceNFTTwo = Number(await NFTTwo.balanceOf.call(testAccount3));
  //     const balanceNFTThree = Number(await NFTThree.balanceOf.call(testAccount3));
  //     const balanceNFTFour = Number(await NFTFour.balanceOf.call(testAccount3));
  //     assert.isTrue(balanceNFTOne == 1);
  //     assert.isTrue(balanceNFTTwo == 1);
  //     assert.isTrue(balanceNFTThree == 1);
  //     assert.isTrue(balanceNFTFour == 0);

  //     const robotNFT = await NFT.at(this.nftAddrs[5]);
  //     assert.isTrue(await robotNFT.balanceOf.call(testAccount3) == 1);
  // });
});
