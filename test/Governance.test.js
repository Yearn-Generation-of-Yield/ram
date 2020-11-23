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
const FeeApprover = artifacts.require('FeeApprover');

const timeMachine = require('ganache-time-traveler');
const truffleAssert = require("truffle-assertions");
const assert = require("chai").assert;

contract("Governance", accounts => {

    let testAccount = accounts[0];
    let setterAccount = accounts[1];
    let testAccount2 = accounts[2];
    let devAccount = accounts[3];

    let teamAddr = accounts[4];
    let rengeneratorAddr = accounts[5];

    beforeEach(async () => {
        // Take time snapshot
        let snapshot = await timeMachine.takeSnapshot();
        snapshotId = snapshot['result'];

        // Deploy a new Uniswap Factory and set 'setterAccount' which collects fees
        this.uniV2Factory = await UniV2Factory.new(setterAccount);

        // Deploy a new WETH wrapped Ethereum token [FOR TESTING]
        this.weth = await WETH.new();

        // Deposit Ethereum and get WETH tokens
        this.weth.deposit({ from: testAccount2, value: (5e18).toString() });
        this.weth.deposit({ from: setterAccount, value: (5e18).toString() });

        // Deploy a new RAM token which manages Governance for the protocol
        this.YGYToken = await Token.new("YGY", "YGY", (20*1e18).toString(), { from: setterAccount });
        this.RAMToken = await RAM.new(this.uniV2Factory.address, { from: setterAccount });

        // Deploy a new FeeApprover contract
        this.feeapprover = await FeeApprover.new({ from: setterAccount }) ;

        // Create a YGY-WETH pair on uniswap [FOR TESTING, this would be created by RAM constructor in production]
        this.YGYWETHPair = await UniV2Pair.at((await this.uniV2Factory.createPair(this.weth.address, this.YGYToken.address, { from: setterAccount })).receipt.logs[0].args.pair);
        // Create a YGY-RAM pair on uniswap [FOR TESTING, this would be created by RAM constructor in production]
        this.YGYRAMPair = await UniV2Pair.at((await this.uniV2Factory.createPair(this.RAMToken.address, this.YGYToken.address, { from: setterAccount })).receipt.logs[0].args.pair);

        // Now we can initialize the FeeApprover contract
        await this.feeapprover.initialize(this.RAMToken.address, this.YGYToken.address, this.uniV2Factory.address, { from: setterAccount });

        // Deploy RAMvault to manage yield farms
        this.RAMvault = await RAMVAULT.new({ from: setterAccount });

        await this.feeapprover.setPaused(false, { from: setterAccount });

        // Sets transferCheckerAddress() to setter account
        await this.RAMToken.setShouldTransferChecker(this.feeapprover.address, { from: setterAccount });

        // The next 3 commands simulate a LGE where RAM/WETH is contributed and the contributor receives RAMPair tokens
        await this.YGYToken.transfer(this.YGYWETHPair.address, (4*1e18).toString(), { from: setterAccount });
        await this.weth.transfer(this.YGYWETHPair.address, (4*1e18).toString(), { from: setterAccount });
        await this.YGYWETHPair.mint(setterAccount);

        await this.YGYToken.transfer(this.YGYRAMPair.address, (5*1e18).toString(), { from: setterAccount });
        await this.RAMToken.transfer(this.YGYRAMPair.address, (5*1e18).toString(), { from: setterAccount });
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

        this.nftAddrs = [nftAddr1, nftAddr2, nftAddr3, nftAddr4, nftAddr5];

        // // Deploy RAMRouter contract
        this.RAMRouter = await UniRAMRouter.new(this.RAMToken.address, this.YGYToken.address, this.weth.address, this.uniV2Factory.address, this.YGYRAMPair.address, this.YGYWETHPair.address, this.feeapprover.address, this.RAMvault.address, this.nftFactory.address, this.nftAddrs, rengeneratorAddr, { from: setterAccount });

        // // Bond NFT factory and deploy NFTs using RAM router
        await this.nftFactory.bondContract(this.RAMRouter.address, { from: setterAccount });

        // // Deploy governance contract and set on router
        this.governance = await Governance.new(this.YGYToken.address, this.RAMRouter.address);
        this.RAMRouter.setGovernance(this.governance.address, { from: setterAccount });

        // // Initialize RAMVault
        await this.RAMvault.initialize(this.RAMToken.address, devAccount, teamAddr, rengeneratorAddr, setterAccount, { from: setterAccount });
    });

    it("should be able to set number selection", async () => {
        await this.governance.setUserNumber(2, { from: testAccount });

        const userAfter = await this.governance.users.call(testAccount);
        assert.isTrue(userAfter.number == 2);
    });

    it("should be able to deposit liquid YGY", async () => {
        await this.YGYToken.transfer(testAccount, 2e18.toString(), { from: setterAccount });

        await this.YGYToken.approve(this.governance.address, 2e18.toString(), { from: testAccount });
        truffleAssert.passes(
            await this.governance.depositLiquidYGYUpdateNumber(1e18.toString(), 2, { from: testAccount })
        );

        const userAfter = await this.governance.users.call(testAccount);
        assert.isTrue(userAfter.number == 2);
        assert.isTrue(userAfter.liquidYGY == 1e18);

        const totalYGY = await this.governance.totalYGY.call();
        assert.isTrue(totalYGY == 1e18);

        const weightedNumber = await this.governance.weightedNumber.call();
        assert.isTrue(weightedNumber == 2);
    });

    it("should be able to withdraw liquid YGY", async () => {
        await this.YGYToken.transfer(testAccount, 2e18.toString(), { from: setterAccount });

        await this.YGYToken.approve(this.governance.address, 2e18.toString(), { from: testAccount });
        truffleAssert.passes(
            await this.governance.depositLiquidYGYUpdateNumber(1e18.toString(), 2, { from: testAccount })
        );

        truffleAssert.passes(
            await this.governance.withdrawLiquidYGY(0.5e18.toString(), { from: testAccount })
        );

        const userAfter = await this.governance.users.call(testAccount);
        assert.isTrue(userAfter.number == 2);
        assert.isTrue(userAfter.liquidYGY == 0.5e18);

        const totalYGY = await this.governance.totalYGY.call();
        assert.isTrue(totalYGY == 0.5e18);

        truffleAssert.passes(
            await this.governance.withdrawLiquidYGY(0.5e18.toString(), { from: testAccount })
        );

        const userAfterTwo = await this.governance.users.call(testAccount);
        assert.isTrue(userAfterTwo.number == 2);
        assert.isTrue(userAfterTwo.liquidYGY == 0);

        const totalYGYTwo = await this.governance.totalYGY.call();
        assert.isTrue(totalYGYTwo == 0);
    });

    it("should weight votes amongst multiple users", async () => {
        await this.YGYToken.transfer(testAccount, 2e18.toString(), { from: setterAccount });
        await this.YGYToken.transfer(testAccount2, 2e18.toString(), { from: setterAccount });

        await this.YGYToken.approve(this.governance.address, 1e18.toString(), { from: testAccount });
        truffleAssert.passes(
            await this.governance.depositLiquidYGYUpdateNumber(1e18.toString(), 2, { from: testAccount })
        );

        const firstTotalYGY = await this.governance.totalYGY.call();
        assert.isTrue(firstTotalYGY == 1e18);
        const firstWeightedNumber = await this.governance.weightedNumber.call();
        assert.isTrue(firstWeightedNumber == 2);

        await this.YGYToken.approve(this.governance.address, 2e18.toString(), { from: testAccount2 });
        truffleAssert.passes(
            await this.governance.depositLiquidYGYUpdateNumber(2e18.toString(), 5, { from: testAccount2 })
        );

        const secondTotalYGY = await this.governance.totalYGY.call();
        assert.isTrue(secondTotalYGY == 3e18);
        // Weighted number should be 4
        const secondWeightedNumber = await this.governance.weightedNumber.call();
        assert.isTrue(secondWeightedNumber == 4);
    });

    it("should be able to timelock YGY tokens", async () => {
        await this.YGYToken.transfer(testAccount, 2e18.toString(), { from: setterAccount });

        await this.YGYToken.approve(this.governance.address, 2e18.toString(), { from: testAccount });
        truffleAssert.passes(
            await this.governance.depositLiquidYGYUpdateNumber(1e18.toString(), 2, { from: testAccount })
        );

        const userFirst = await this.governance.users.call(testAccount);
        assert.isTrue(userFirst.liquidYGY == 1e18);
        assert.isTrue(userFirst.timelockedYGY == 0);

        const totalYGYFirst = await this.governance.totalYGY.call();
        assert.isTrue(totalYGYFirst == 1e18);

        truffleAssert.passes(
            await this.governance.timelockYGY(1e18.toString(), 2, { from: testAccount })
        );

        // Level 2 applies a 3x multiplier for a lockup duration of one month
        const userSecond = await this.governance.users.call(testAccount);
        assert.isTrue(userSecond.liquidYGY == 0);
        assert.isTrue(userSecond.timelockedYGY == 3e18);

        const totalYGYSecond = await this.governance.totalYGY.call();
        assert.isTrue(totalYGYSecond == 3e18);
    });

    it("should weight timelocked votes correctly", async () => {
        await this.YGYToken.transfer(testAccount, 2e18.toString(), { from: setterAccount });
        await this.YGYToken.transfer(testAccount2, 2e18.toString(), { from: setterAccount });

        await this.YGYToken.approve(this.governance.address, 1e18.toString(), { from: testAccount });
        truffleAssert.passes(
            await this.governance.depositLiquidYGYUpdateNumber(1e18.toString(), 2, { from: testAccount })
        );

        await this.YGYToken.approve(this.governance.address, 1e18.toString(), { from: testAccount2 });
        truffleAssert.passes(
            await this.governance.depositLiquidYGYUpdateNumber(1e18.toString(), 8, { from: testAccount2 })
        );

        const firstTotalYGY = await this.governance.totalYGY.call();
        assert.isTrue(firstTotalYGY == 2e18);
        // Weighted number should be 5, as (2+8)/2 = 5
        const firstWeightedNumber = await this.governance.weightedNumber.call();
        assert.isTrue(firstWeightedNumber == 5);

        truffleAssert.passes(
            await this.governance.timelockYGY(1e18.toString(), 2, { from: testAccount2 })
        );

        // (1*3)+1 = 4
        const secondTotalYGY = await this.governance.totalYGY.call();
        assert.isTrue(secondTotalYGY == 4e18);

        // The 'real' value should be (2+(8*3))/4 = 26/4 = 6
        // But the contract instead uses the previous global weighted value for its calculations
        // 5+(8*3) = 29/4 = 7.25 = rounds to 7
        const secondWeightedNumber = await this.governance.weightedNumber.call();
        assert.isTrue(secondWeightedNumber == 7);
    });

    it("should be able to retrieve timelocked YGY tokens", async () => {
        await this.YGYToken.transfer(testAccount, 2e18.toString(), { from: setterAccount });

        await this.YGYToken.approve(this.governance.address, 2e18.toString(), { from: testAccount });
        truffleAssert.passes(
            await this.governance.depositLiquidYGYUpdateNumber(1e18.toString(), 2, { from: testAccount })
        );

        truffleAssert.passes(
            await this.governance.timelockYGY(1e18.toString(), 2, { from: testAccount })
        );

        // Level 2 applies a 3x multiplier for a lockup duration of one month
        const userFirst = await this.governance.users.call(testAccount);
        assert.isTrue(userFirst.liquidYGY == 0);
        assert.isTrue(userFirst.timelockedYGY == 3e18);

        const totalYGYFirst = await this.governance.totalYGY.call();
        assert.isTrue(totalYGYFirst == 3e18);

        // Advance time forward more than a month
        const oneMonthInSeconds = 2419200;
        const moreThanOneMonth = oneMonthInSeconds + 10000;
        await timeMachine.advanceTimeAndBlock(moreThanOneMonth);

        truffleAssert.passes(
            await this.governance.unlockOldestTimelock(2, { from: testAccount })
        );

        const userSecond = await this.governance.users.call(testAccount);
        assert.isTrue(userSecond.liquidYGY == 1e18);
        assert.isTrue(userSecond.timelockedYGY == 0e18);

        const totalYGYSecond = await this.governance.totalYGY.call();
        assert.isTrue(totalYGYSecond == 1e18);
    });

});