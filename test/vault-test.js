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
  });

  it("should be able to add liquidity with only YGY", async () => {
    const user = this.users[4];
    const YGYAmount = 100;
    const DepositAmount = 10;
    await this.YGY.connect(this.deployerSigner).transfer(user.address, this.parseEther(YGYAmount.toString())).should.be.fulfilled;
    await this.YGY.connect(user.signer).approve(this.RAMRouter.address, MAX_INT).should.be.fulfilled;
    await this.RAMRouter.connect(user.signer).addLiquidityYGYOnly(this.parseEther(DepositAmount.toString()), false).should.be.fulfilled;
    const balanceOfUser = this.formatResult(await this.YGY.balanceOf(user.address));
    balanceOfUser.should.be.equal(YGYAmount - DepositAmount);

    const YGYRAMBalanceOfUser = this.formatResult(await this.YGYRAMPair.balanceOf(user.address));
    console.log("YGYRAMBalance with 10 YGY deposit: ", YGYRAMBalanceOfUser);
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
    const depositAmount = "5";

    const user = this.users[4];
    const user2 = this.users[5];

    await this.YGY.transfer(user2.address, parseEther("500"));

    // Add a new pool
    await this.RAMVault.addPool(100, this.YGYRAMPair.address, true);
    // Approve YGY for user2 to Router.
    await this.YGY.connect(user2.signer).approve(this.RAMRouter.address, MAX_INT);

    // Add liquiditiess.
    await this.RAMRouter.connect(user2.signer).addLiquidityYGYOnly(parseEther("100"), true);
    await this.RAMRouter.connect(user.signer).addLiquidityETHOnly(user.address, false, { value: parseEther("20") });

    // Approve RAM LP to Router
    await this.YGYRAMPair.connect(user.signer).approve(this.RAMVault.address, MAX_INT);
    await this.YGYRAMPair.connect(user2.signer).approve(this.RAMVault.address, MAX_INT);

    // Deposit
    await this.RAMVault.connect(user.signer).deposit(0, parseEther(depositAmount));
    await this.RAMVault.connect(user2.signer).deposit(0, parseEther(depositAmount));
    await this.RAMVault.connect(user.signer).withdraw(0, parseEther(depositAmount));
    await this.RAMVault.connect(user2.signer).withdraw(0, parseEther(depositAmount));
  });
});
