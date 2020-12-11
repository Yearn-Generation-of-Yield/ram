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

describe("NFT", () => {
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
    await this.RAMRouter.selfRequestRandomNumber(123456).should.be.fulfilled;
    const LINKNFTAddress = await this.NFTFactory.contracts(this.NFTLocations.LINK);
    const balance = Number(await this.NFTFactory.balanceOf(LINKNFTAddress, this.deployer));
    balance.should.equal(1);
  });

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

  it.only("cant trade a link card", async () => {
    // Add a new pool
    await this.RAMVault.addPool(100, this.YGYRAMPair.address, true);

    await this.RAMRouter.selfRequestRandomNumber(123456).should.be.fulfilled;
    const LINKNFTAddress = await this.NFTFactory.contracts(this.NFTLocations.LINK);
    const balance = Number(await this.NFTFactory.balanceOf(LINKNFTAddress, this.deployer));
    balance.should.equal(1);
    const NFT = await deployments.getArtifact("NFT");
    const LINKNFTInstance = await ethers.getContractAt(NFT.abi, LINKNFTAddress, this.deployerSigner);
    console.log(LINKNFTInstance.functions);
    await LINKNFTInstance.transferFrom(this.deployer, this.user3, 0).should.not.be.fulfilled;
    await LINKNFTInstance.approve(this.NFTFactory.address, 0).should.be.fulfilled;
    await this.NFTFactory.connect(this.deployerSigner).useNFT(LINKNFTAddress, 0, 0).should.be.fulfilled;

    const supply = Number(await LINKNFTInstance.totalSupply());
    supply.should.equal(0);
  });
});
