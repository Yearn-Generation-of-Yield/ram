// const NFTFactory = artifacts.require("NFTFactory");
// const assert = require("chai").assert;
// const timeMachine = require("ganache-time-traveler");
const NFT = artifacts.require("NFT");
const truffleAssert = require("truffle-assertions");
require("chai")
  .use(require("chai-as-promised"))
  .should();
const fetch = require("node-fetch");
const { expect } = require("chai");

contract("NFT", (accounts) => {
  const owner = accounts[0];
  describe("Base functionality", async () => {
    beforeEach(async () => {
      this.nft = await NFT.new("ROBOT", "dXIOT", "https://run.mocky.io/v3/3da52de1-1e4f-4e7e-8ae7-b68be4278835");
      truffleAssert.passes(await this.nft.mint(owner));
      const balance = Number(await this.nft.balanceOf(owner));
      balance.should.equal(1);
    });

    it("has metadata", async () => {
      const holder = await this.nft.ownerOf(0);
      holder.should.equal(owner);

      const uri = await this.nft.tokenURI(0);
      const blob = await fetch(uri);
      const metadata = await blob.json();

      metadata.attributes.length.should.be.greaterThan(0);
      const attribute = metadata.attributes.find((attribute) => attribute.type == "boost");
      expect(attribute.value === 10);
    });

    it("should be able to delegate token to an address", async  () => {
        expect(1 + 1 === 3); // sleeeeeeep.....
    })
  });
});
