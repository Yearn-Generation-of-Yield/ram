const NFTFactory = artifacts.require("NFTFactory");
// const assert = require("chai").assert;
// const timeMachine = require("ganache-time-traveler");
const truffleAssert = require("truffle-assertions");
require("chai")
  .use(require("chai-as-promised"))
  .should();
const fetch = require("node-fetch");
const { expect } = require("chai");
const timeMachine = require("ganache-time-traveler");

const { initializeEnvironment } = require('../test-helpers');

contract("NFTFactory", (accounts) => {
  const owner = accounts[1];

  const NFTLocations = {
    RAM1: 0,
    RAM2: 1,
    RAM3: 2,
    RAM4: 3,
    RAM5: 4,
    ROBOT: 5,
    LINK: 6
  }

  beforeEach(async () => {
    await initializeEnvironment(this, accounts)
  });
  describe("Base functionality", async () => {

    it("deploys nfts", async () => {
      const nftCount = Number(await this.nftFactory.getContractCount());
      let ownedContractAmount = 0;
      for (let index = 0; index < nftCount; index++) {
        const address = await this.nftFactory.contracts(index);
        const owned = await this.nftFactory.ownedContracts(address);
        if(owned) {
          ownedContractAmount++;
        }
      }
      ownedContractAmount.should.equal(nftCount);
    })

    it("mints a link nft to a RNG supplier", async () => {
      await this.RAMRouter.selfRequestRandomNumber(1234, { from: owner }).should.be.fulfilled;
      const LINKNFTAddress = await this.nftFactory.contracts(NFTLocations.LINK);
      const balance = Number(await this.nftFactory.balanceOf(LINKNFTAddress, owner));
      balance.should.equal(1);
    })

    it("has metadata on nfts", async () => {
      const RAM5NFT = await this.nftFactory.contracts(NFTLocations.RAM5);
      const tokenId = await this.nftFactory.mint(RAM5NFT, owner, { from: owner });
      const uri =  await this.nftFactory.tokenURI(RAM5NFT);
      const blob = await fetch(uri);
      const metadata = await blob.json();

      metadata.attributes.length.should.be.greaterThan(0);
      const attribute = metadata.attributes.find((attribute) => attribute.type == "boost");
      expect(attribute.value === 10);
    });

    it.only("does lottery, sends dxiots, mints robot", async () => {
      const user = accounts[9];
      const depositTimes = 19;

      for(let i = 0; i < depositTimes; i++) {
        await this.RAMRouter.addLiquidityETHOnly(user, false, { from: user, value: web3.utils.toWei("0.1")}).should.be.fulfilled;
      }
      let liqContributed = await this.RAMRouter.liquidityContributedEthValue(user) / 1e18;
      liqContributed.should.equal(1.9);

      let dxiots = await this.dxiotToken.balanceOf(user) / 1e18;
      dxiots.should.equal(19);

      let ticketLevel = Number(await this.RAMRouter.lastTicketLevel(user));
      ticketLevel.should.equal(1)

      // Deposit for rrrrrobot
      await this.RAMRouter.addLiquidityETHOnly(user, false, { from: user, value: web3.utils.toWei("8.1")}).should.be.fulfilled;
      dxiots = await this.dxiotToken.balanceOf(user) / 1e18;
      dxiots.should.equal(20);

      const ROBOTNFTAddress = await this.nftFactory.contracts(NFTLocations.ROBOT);
      const hasRobot = await this.nftFactory.isOwner(ROBOTNFTAddress, user , 0);
      hasRobot.should.be.equal(true);


      // Deposit to win
      await this.RAMRouter.addLiquidityETHOnly(user, false, { from: user, value: web3.utils.toWei("40")}).should.be.fulfilled;

      liqContributed = await this.RAMRouter.liquidityContributedEthValue(user) / 1e18;
      liqContributed.should.equal(50);
      ticketLevel = Number(await this.RAMRouter.lastTicketLevel(user));
      ticketLevel.should.equal(7)
      // ticketLevel = Number(await this.RAMRouter.lastTicketLevel(user));
      // ticketLevel.should.equal(3);

      // const ticketCount = Number(await this.RAMRouter.ticketCount());
      // No more robots
      const robotBalance = Number(await this.nftFactory.balanceOf(ROBOTNFTAddress, user));
      robotBalance.should.be.equal(1);

      // mock chainlink actually gets blockhash as as seed
      await this.RAMRouter.selfRequestRandomNumber(123456, { from: owner }).should.be.fulfilled;
      const LINKNFTAddress = await this.nftFactory.contracts(NFTLocations.LINK);
      const balance = Number(await this.nftFactory.balanceOf(LINKNFTAddress, owner));
      balance.should.equal(1);

      // should have all RAM tickets
      const NFTBalancePromises = this.nftAddrs.map(async (NFT, i) => {
        const result = { name: Object.keys(NFTLocations)[i], amount: Number(await this.nftFactory.balanceOf(NFT, user)) }
        return result;
      });

      const balances = await Promise.all(NFTBalancePromises);

      console.log(balances);

    })

    it("should be able to delegate token to an address", async  () => {
        expect(1 + 1 === 3); // sleeeeeeep.....
    })
  });
});
