const { deployments, ethers, getUnnamedAccounts, getNamedAccounts } = require("hardhat");
const { time, expectRevert, expectEvent } = require("@openzeppelin/test-helpers");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();
const { setTestVars } = require("../scripts/setTestVars");
const MAX_INT = "11579208923731619542357098500868790785326998466564056403945758400791312963993";

const { parseEther, formatEther } = ethers.utils;
const fetch = require("node-fetch");

describe("NFT", function () {
  this.timeout(0);
  beforeEach(async () => {
    this.formatResult = (amount) => Number(formatEther(amount));
    const { deployer, teamaddr, devaddr, regeneratoraddr } = await getNamedAccounts();
    this.parseEther = parseEther;
    this.formatEther = formatEther;
    this.deployer = deployer;
    this.deployerSigner = await ethers.getSigner(deployer);

    this.NFTLocations = {
      RAM1: 0,
      RAM2: 1,
      RAM3: 2,
      RAM4: 3,
      RAM5: 4,
      ROBOT: 5,
      LINK: 6,
    };

    this.users = [];
    const signers = await ethers.getSigners();
    for (const signer of signers) {
      const addr = await signer.getAddress();
      this.users.push({ address: addr, signer });
    }

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
    this.userBaseRAMBalance = parseEther("500");
    this.userLINKBalance = parseEther("200");
    await Promise.all(
      endUsers.map(async ({ address }) => {
        await this.YGY.transfer(address, this.userBaseYGYBalance);
        await this.ChainLink.transfer(address, this.userLINKBalance);
        await this.RAM.transfer(address, this.userBaseRAMBalance);
      })
    );
    // Just approve the vault and router here
    await Promise.all(
      endUsers.map(async ({ signer }) => {
        await this.dXIOT.connect(signer).approve(this.RAMRouter.address, MAX_INT);
        await this.YGY.connect(signer).approve(this.RAMRouter.address, MAX_INT);
        await this.YGYRAMPair.connect(signer).approve(this.RAMVault.address, MAX_INT);
        await this.RAM.connect(signer).approve(this.RAMVault.address, MAX_INT);
        await this.ChainLink.connect(signer).approve(this.RAMVault.address, MAX_INT);
      })
    );
  });

  it("deploys nfts", async () => {
    const deployedNFTs = Number(await this.NFTFactory.getContractCount());
    deployedNFTs.should.equal(7);
  });

  it("mints a link nft to a RNG supplier", async () => {
    await this.ChainLink.connect(this.users[7].signer).approve(this.RAMRouter.address, MAX_INT);
    await this.RAMRouter.connect(this.users[7].signer).selfRequestRandomNumber(123456).should.be.fulfilled;
    const LINKNFTAddress = await this.NFTFactory.contracts(this.NFTLocations.LINK);
    const balance = Number(await this.NFTFactory.balanceOf(LINKNFTAddress, this.users[7].address));
    balance.should.equal(1);
  });

  it.only("mints a link nft to a RNG supplier, can use it and mints a new one", async () => {
    const NFT = await deployments.getArtifact("NFT");
    await this.ChainLink.connect(this.users[7].signer).approve(this.RAMRouter.address, MAX_INT);
    await this.RAMRouter.connect(this.users[7].signer).selfRequestRandomNumber(123456).should.be.fulfilled;
    const LINKNFTAddress = await this.NFTFactory.contracts(this.NFTLocations.LINK);
    const LINKNFTInstance = await ethers.getContractAt(NFT.abi, LINKNFTAddress, this.users[7].address);
    let balance = Number(await this.NFTFactory.balanceOf(LINKNFTAddress, this.users[7].address));
    balance.should.equal(1);
    await LINKNFTInstance.connect(this.users[7].signer).approve(this.NFTFactory.address, 0).should.be.fulfilled;
    await this.NFTFactory.connect(this.users[7].signer).useNFT(LINKNFTAddress, 0, 0).should.be.fulfilled;
    balance = Number(await this.NFTFactory.balanceOf(LINKNFTAddress, this.users[7].address));
    balance.should.equal(0);
    await this.RAMRouter.connect(this.users[7].signer).selfRequestRandomNumber(43343433).should.be.fulfilled;
    balance = Number(await this.NFTFactory.balanceOf(LINKNFTAddress, this.users[7].address));
    const supply = await LINKNFTInstance.totalSupply();
    console.log(Number(supply));
    balance.should.equal(1);
  });

  // TODO: time.advanceBlockTo(6000) takes too long in the test suite

  // it("gives a boost from link and robot NFT and reset on new epoch", async () => {
  //   const user1 = this.users[7];
  //   const user2 = this.users[6];

  //   // Add a new pool
  //   await this.RAMVault.addPool(100, this.YGYRAMPair.address, true);

  //   await this.YGY.connect(user1.signer).approve(this.RAMRouter.address, MAX_INT);
  //   // Auto-stake dude
  //   await this.RAMRouter.connect(user1.signer).addLiquidityYGYOnly(parseEther("100"), true).should.be.fulfilled;

  //   await this.ChainLink.connect(user1.signer).approve(this.RAMRouter.address, MAX_INT);
  //   await this.RAMRouter.connect(user1.signer).selfRequestRandomNumber(123456).should.be.fulfilled;
  //   const LINKNFTAddress = await this.NFTFactory.contracts(this.NFTLocations.LINK);
  //   const balance = Number(await this.NFTFactory.balanceOf(LINKNFTAddress, user1.address));

  //   balance.should.equal(1);

  //   await this.dXIOT.transfer(user2.address, parseEther("20"));
  //   for (let i = 0; i < 21; i++) {
  //     let tx = await this.RAMRouter.connect(user2.signer).addLiquidityETHOnly(user2.address, true, { value: web3.utils.toWei("2") });
  //     await tx.wait();
  //   }
  //   const ROBOTNFTAddress = await this.NFTFactory.contracts(this.NFTLocations.ROBOT);
  //   let hasRobot = await this.NFTFactory.isOwner(ROBOTNFTAddress, user2.address, 0).should.be.fulfilled;
  //   hasRobot.should.be.equal(true);

  //   const userBefore1 = await this.Storage.userInfo(0, user1.address);
  //   const userBefore2 = await this.Storage.userInfo(0, user2.address);

  //   (userBefore1.amount / 1e18).should.be.greaterThan(0);
  //   userBefore1.boostAmount.should.equal(0);
  //   (userBefore2.amount / 1e18).should.be.greaterThan(0);
  //   userBefore2.boostAmount.should.equal(0);

  //   const NFT = await deployments.getArtifact("NFT");
  //   const LINKNFTInstance = await ethers.getContractAt(NFT.abi, LINKNFTAddress, user1.signer);
  //   await LINKNFTInstance.transferFrom(user1.address, this.user3, 0).should.not.be.fulfilled;
  //   await LINKNFTInstance.connect(user1.signer).approve(this.NFTFactory.address, 0).should.be.fulfilled;
  //   await this.NFTFactory.connect(user1.signer).useNFT(LINKNFTAddress, 0, 0).should.be.fulfilled;

  //   const ROBOTNFTInstance = await ethers.getContractAt(NFT.abi, ROBOTNFTAddress, user2.signer);
  //   await ROBOTNFTInstance.connect(user2.signer).transferFrom(user2.address, this.user3, 0).should.not.be.fulfilled;
  //   await ROBOTNFTInstance.connect(user2.signer).approve(this.NFTFactory.address, 0).should.be.fulfilled;
  //   await this.NFTFactory.connect(user2.signer).useNFT(ROBOTNFTAddress, 0, 0).should.be.fulfilled;

  //   const userAfter1 = await this.Storage.userInfo(0, user1.address);
  //   const userAfter2 = await this.Storage.userInfo(0, user2.address);

  //   (userAfter1.boostAmount / 1e18).should.be.greaterThan(0);
  //   (userAfter2.boostAmount / 1e18).should.be.greaterThan(0);
  //   const NFTBoost = await this.Storage.getNFTBoost(user1.address);
  //   const NFTBoost2 = await this.Storage.getNFTBoost(user2.address);

  //   Number(NFTBoost).should.equal(10);
  //   Number(NFTBoost2).should.equal(10);

  //   const block = await time.latestBlock();
  //   await time.advanceBlockTo(block + 6000);
  //   await this.RAMVault.startNewEpoch();

  //   const NFTBoostAfter = await this.Storage.getNFTBoost(user1.address);
  //   const NFTBoostAfter2 = await this.Storage.getNFTBoost(user2.address);

  //   NFTBoostAfter.should.be.equal(0);
  //   NFTBoostAfter2.should.be.equal(0);

  //   await this.RAMRouter.connect(user1.signer).selfRequestRandomNumber(12443456).should.be.fulfilled;
  //   await LINKNFTInstance.connect(user1.signer).approve(this.NFTFactory.address, 1).should.be.fulfilled;
  //   await this.NFTFactory.connect(user1.signer).useNFT(LINKNFTAddress, 1, 0).should.be.fulfilled;

  //   const NFTBoostAfterSecond = await this.Storage.getNFTBoost(user1.address);
  //   Number(NFTBoostAfterSecond).should.equal(10);

  //   await this.dXIOT.transfer(user1.address, parseEther("20"));
  //   for (let i = 0; i < 21; i++) {
  //     let tx = await this.RAMRouter.connect(user1.signer).addLiquidityETHOnly(user1.address, true, { value: web3.utils.toWei("2") });
  //     await tx.wait();
  //   }
  //   await ROBOTNFTInstance.connect(user1.signer).transferFrom(user1.address, this.user3, 0).should.not.be.fulfilled;
  //   await ROBOTNFTInstance.connect(user1.signer).approve(this.NFTFactory.address, 1).should.be.fulfilled;
  //   await this.NFTFactory.connect(user1.signer).useNFT(ROBOTNFTAddress, 1, 0).should.be.fulfilled;
  //   const NFTBoostAfterThird = await this.Storage.getNFTBoost(user1.address);
  //   await this.RAMRouter.connect(user1.signer).addLiquidityETHOnly(user1.address, true, { value: web3.utils.toWei("2") });
  //   const userInfo = await this.Storage.userInfo(0, user1.address);
  //   Number(NFTBoostAfterThird).should.equal(20);
  //   console.log(Number(userInfo.boostAmount), Number(userInfo.amount));
  //   ((userInfo.amount / 1e18) * 0.2).should.be.closeTo(userInfo.boostAmount / 1e18, 0.01);
  // });

  it("has metadata and random properties on nfts", async () => {
    // Get artifacts
    const RAM5NFT = await this.NFTFactory.contracts(this.NFTLocations.RAM5);
    const NFT = await deployments.getArtifact("NFT");
    const RAM = await ethers.getContractAt(NFT.abi, RAM5NFT, this.deployerSigner);

    // Get tx
    const tx = await this.NFTFactory.mint(RAM5NFT, this.deployer, 40);
    const receipt = await tx.wait();

    // Tokenid is here
    const tokenId = receipt.events[1].args.tokenId;
    const uri = await RAM.tokenURI(tokenId);
    const blob = await fetch(uri);
    const metadata = await blob.json();
    // Has some metadata
    metadata.attributes.length.should.be.greaterThan(0);

    // And properties, pValue defaults to 0
    const properties = await RAM.properties(tokenId);
    Number(properties.pValue).should.be.greaterThan(0);

    // Second token has different properties
    const tx2 = await this.NFTFactory.mint(RAM5NFT, this.deployer, 93);
    const receipt2 = await tx2.wait();
    const tokenId2 = receipt2.events[1].args.tokenId;
    const properties2 = await RAM.properties(tokenId2);
    properties2.pValue.should.not.equal(properties.pValue);
  });

  it("cant trade a link card but can use it", async () => {
    await this.RAMRouter.selfRequestRandomNumber(123456).should.be.fulfilled;
    const LINKNFTAddress = await this.NFTFactory.contracts(this.NFTLocations.LINK);
    const balance = Number(await this.NFTFactory.balanceOf(LINKNFTAddress, this.deployer));
    balance.should.equal(1);
    const NFT = await deployments.getArtifact("NFT");
    const LINKNFTInstance = await ethers.getContractAt(NFT.abi, LINKNFTAddress, this.deployerSigner);
    await LINKNFTInstance.transferFrom(this.deployer, this.user3, 0).should.not.be.fulfilled;
    await LINKNFTInstance.approve(this.NFTFactory.address, 0).should.be.fulfilled;
    await this.NFTFactory.connect(this.deployerSigner).useNFT(LINKNFTAddress, 0, 0).should.be.fulfilled;

    const supply = Number(await LINKNFTInstance.totalSupply());
    supply.should.equal(0);
  });

  it("does lottery, sends dxiots, mints robot", async () => {
    const user = this.users[7];
    const depositTimes = 19;

    // Could use a loop
    let tx = await this.RAMRouter.connect(user.signer).addLiquidityETHOnly(user.address, false, { value: web3.utils.toWei("0.1") });
    await tx.wait();
    tx = await this.RAMRouter.connect(user.signer).addLiquidityETHOnly(user.address, false, { value: web3.utils.toWei("0.1") });
    await tx.wait();
    tx = await this.RAMRouter.connect(user.signer).addLiquidityETHOnly(user.address, false, { value: web3.utils.toWei("0.1") });
    await tx.wait();
    tx = await this.RAMRouter.connect(user.signer).addLiquidityETHOnly(user.address, false, { value: web3.utils.toWei("0.1") });
    await tx.wait();
    tx = await this.RAMRouter.connect(user.signer).addLiquidityETHOnly(user.address, false, { value: web3.utils.toWei("0.1") });
    await tx.wait();
    tx = await this.RAMRouter.connect(user.signer).addLiquidityETHOnly(user.address, false, { value: web3.utils.toWei("0.1") });
    await tx.wait();
    tx = await this.RAMRouter.connect(user.signer).addLiquidityETHOnly(user.address, false, { value: web3.utils.toWei("0.1") });
    await tx.wait();
    tx = await this.RAMRouter.connect(user.signer).addLiquidityETHOnly(user.address, false, { value: web3.utils.toWei("0.1") });
    await tx.wait();
    tx = await this.RAMRouter.connect(user.signer).addLiquidityETHOnly(user.address, false, { value: web3.utils.toWei("0.1") });
    await tx.wait();
    tx = await this.RAMRouter.connect(user.signer).addLiquidityETHOnly(user.address, false, { value: web3.utils.toWei("0.1") });
    await tx.wait();
    tx = await this.RAMRouter.connect(user.signer).addLiquidityETHOnly(user.address, false, { value: web3.utils.toWei("0.1") });
    await tx.wait();
    tx = await this.RAMRouter.connect(user.signer).addLiquidityETHOnly(user.address, false, { value: web3.utils.toWei("0.1") });
    await tx.wait();
    tx = await this.RAMRouter.connect(user.signer).addLiquidityETHOnly(user.address, false, { value: web3.utils.toWei("0.1") });
    await tx.wait();
    tx = await this.RAMRouter.connect(user.signer).addLiquidityETHOnly(user.address, false, { value: web3.utils.toWei("0.1") });
    await tx.wait();
    tx = await this.RAMRouter.connect(user.signer).addLiquidityETHOnly(user.address, false, { value: web3.utils.toWei("0.1") });
    await tx.wait();
    tx = await this.RAMRouter.connect(user.signer).addLiquidityETHOnly(user.address, false, { value: web3.utils.toWei("0.1") });
    await tx.wait();
    tx = await this.RAMRouter.connect(user.signer).addLiquidityETHOnly(user.address, false, { value: web3.utils.toWei("0.1") });
    await tx.wait();
    tx = await this.RAMRouter.connect(user.signer).addLiquidityETHOnly(user.address, false, { value: web3.utils.toWei("0.1") });
    await tx.wait();
    tx = await this.RAMRouter.connect(user.signer).addLiquidityETHOnly(user.address, false, { value: web3.utils.toWei("0.1") });
    await tx.wait();
    let liqContributed = (await this.Storage.liquidityContributedEthValue(user.address)) / 1e18;
    liqContributed.should.equal(1.9);

    let ticketLevel = Number(await this.Storage.lastTicketLevel(user.address));
    ticketLevel.should.equal(1);

    // Deposit for rrrrrobot
    await this.RAMRouter.connect(user.signer).addLiquidityETHOnly(user.address, false, { value: web3.utils.toWei("0.1") }).should.be
      .fulfilled;

    await this.dXIOT.transfer(user.address, parseEther("20"));

    const ROBOTNFTAddress = await this.NFTFactory.contracts(this.NFTLocations.ROBOT);
    let hasRobot = await this.NFTFactory.isOwner(ROBOTNFTAddress, user.address, 0).should.not.be.fulfilled;
    await this.RAMRouter.connect(user.signer).addLiquidityETHOnly(user.address, false, { value: web3.utils.toWei("8") }).should.be
      .fulfilled;
    hasRobot = await this.NFTFactory.isOwner(ROBOTNFTAddress, user.address, 0).should.be.fulfilled;
    hasRobot.should.be.equal(true);

    // Deposit to win
    await this.RAMRouter.connect(user.signer).addLiquidityETHOnly(user.address, false, { value: web3.utils.toWei("40") }).should.be
      .fulfilled;

    // liqContributed = (await this.Storage.liquidityContributedEthValue(user.address)) / 1e18;
    // liqContributed.should.equal(50);
    ticketLevel = Number(await this.Storage.lastTicketLevel(user.address));
    ticketLevel.should.equal(7);

    // Add some more tickets to increase ticket count...
    const userTwo = this.users[2];

    await this.RAMRouter.connect(userTwo.signer).addLiquidityETHOnly(userTwo.address, false, { value: web3.utils.toWei("10") }).should.be
      .fulfilled;
    let userTwoTicketCount = Number(await this.RAMRouter.userTicketCount(userTwo.address));
    userTwoTicketCount.should.equal(3);

    let userTicketCount = Number(await this.RAMRouter.userTicketCount(user.address));
    userTicketCount.should.equal(8);

    let lotteryRoundCounter = Number(await this.RAMRouter.lotteryRoundCounter());
    lotteryRoundCounter.should.equal(0);

    // No more robots
    const robotBalance = Number(await this.NFTFactory.balanceOf(ROBOTNFTAddress, user.address));
    robotBalance.should.be.equal(1);
    console.log("User address", user.address);
    // mock chainlink actually gets blockhash as as seed
    await this.ChainLink.connect(this.users[7].signer).approve(this.RAMRouter.address, MAX_INT);
    let linkTxs = await this.RAMRouter.connect(this.users[7].signer).selfRequestRandomNumber(123456).should.be.fulfilled;
    const receipt = await linkTxs.wait();
    console.log(receipt.events.map((event) => event));
    const LINKNFTAddress = await this.NFTFactory.contracts(this.NFTLocations.LINK);
    const balance = await this.NFTFactory.isOwner(LINKNFTAddress, this.users[7].address, 0);
    balance.should.equal(true);

    lotteryRoundCounter = Number(await this.RAMRouter.lotteryRoundCounter());
    lotteryRoundCounter.should.equal(1);

    // User one claims all tickets
    await this.RAMRouter.connect(user.signer).claimTickets();
    userTicketCount = Number(await this.RAMRouter.userTicketCount(user.address));
    userTicketCount.should.equal(0);

    // User one generates another random number, starting lottery round 2
    await this.RAMRouter.connect(this.users[7].signer).selfRequestRandomNumber(1234567).should.be.fulfilled;
    lotteryRoundCounter = Number(await this.RAMRouter.lotteryRoundCounter());
    lotteryRoundCounter.should.equal(2);

    // User two claims all tickets
    userTwoTicketCount = Number(await this.RAMRouter.userTicketCount(userTwo.address));
    userTwoTicketCount.should.equal(3);
    tx = await this.RAMRouter.connect(userTwo.signer).claimTickets();

    ticketLevel = Number(await this.Storage.lastTicketLevel(userTwo.address));
    ticketLevel.should.equal(3);

    // User two has no more tickets and cannot claim
    userTwoTicketCount = Number(await this.RAMRouter.userTicketCount(userTwo.address));
    userTwoTicketCount.should.equal(0);
    await expectRevert(this.RAMRouter.connect(userTwo.signer).claimTickets(), "No tickets to claim");

    lotteryRoundCounter = Number(await this.RAMRouter.lotteryRoundCounter());
    lotteryRoundCounter.should.equal(2);

    // User two adds another ticket (going from 10 -> 20 ETH)
    await this.RAMRouter.connect(userTwo.signer).addLiquidityETHOnly(userTwo.address, false, { value: web3.utils.toWei("10") }).should.be
      .fulfilled;
    userTwoTicketCount = Number(await this.RAMRouter.userTicketCount(userTwo.address));
    userTwoTicketCount.should.equal(1);

    // This is user two's 4th ticket [0, 1, 2, 3]
    let userTwoTopTicketStack = Number(await this.RAMRouter.userTopTicketStack(userTwo.address));
    userTwoTopTicketStack.should.equal(3);

    // User two attempts to claim before the round is over. Ticket isn't claimed.
    await this.RAMRouter.connect(userTwo.signer).claimTickets();
    userTwoTicketCount = Number(await this.RAMRouter.userTicketCount(userTwo.address));
    userTwoTicketCount.should.equal(1);

    // User one generates another random number, starting 3rd lottery round
    await this.ChainLink.connect(user.signer).approve(this.RAMRouter.address, MAX_INT);
    await this.RAMRouter.connect(user.signer).selfRequestRandomNumber(12345678).should.be.fulfilled;
    lotteryRoundCounter = Number(await this.RAMRouter.lotteryRoundCounter());
    lotteryRoundCounter.should.equal(3);

    // User two adds another ticket (going from 20 -> 30 ETH)
    await this.RAMRouter.connect(userTwo.signer).addLiquidityETHOnly(userTwo.address, false, { value: web3.utils.toWei("10") }).should.be
      .fulfilled;
    userTwoTicketCount = Number(await this.RAMRouter.userTicketCount(userTwo.address));
    userTwoTicketCount.should.equal(2);

    // User two claims tickets again, should successfully claim the ticket from last round, but not active round
    await this.RAMRouter.connect(userTwo.signer).claimTickets();
    userTwoTicketCount = Number(await this.RAMRouter.userTicketCount(userTwo.address));
    userTwoTicketCount.should.equal(1);

    // User one generates another random number, starting 4th lottery round
    await this.ChainLink.connect(user.signer).approve(this.RAMRouter.address, MAX_INT);
    await this.RAMRouter.connect(user.signer).selfRequestRandomNumber(123456789).should.be.fulfilled;
    lotteryRoundCounter = Number(await this.RAMRouter.lotteryRoundCounter());
    lotteryRoundCounter.should.equal(4);

    // User two claims tickets again, should successfully claim the last ticket
    await this.RAMRouter.connect(userTwo.signer).claimTickets();
    userTwoTicketCount = Number(await this.RAMRouter.userTicketCount(userTwo.address));
    userTwoTicketCount.should.equal(0);

    const nftAddrs = await Promise.all(Object.entries(this.NFTLocations).map(async ([, loc]) => await this.NFTFactory.contracts(loc)));

    // should have all RAM tickets
    const NFTBalancePromises = nftAddrs.map(async (NFT, i) => {
      const result = { name: Object.keys(this.NFTLocations)[i], amount: Number(await this.NFTFactory.balanceOf(NFT, user.address)) };
      return result;
    });

    const balances = await Promise.all(NFTBalancePromises);

    console.table(balances);
  });
});
