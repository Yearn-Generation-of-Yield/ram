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

const truffleAssert = require("truffle-assertions");
const assert = require("chai").assert;
const timeMachine = require('ganache-time-traveler');

contract("UniRAMRouter", accounts => {
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
        await this.RAMToken.setFeeDistributor(this.RAMvault.address, { from: setterAccount });

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

    it("should be able to add liquidity with only YGY", async () => {
        await this.YGYToken.transfer(testAccount, 2e18.toString(), { from: setterAccount });

        await this.YGYToken.approve(this.RAMRouter.address, 2e18.toString(), { from: testAccount });
        truffleAssert.passes(
            await this.RAMRouter.addLiquidityYGYOnly(1e18.toString(), false, { from: testAccount })
        );

        assert.isTrue((await this.YGYRAMPair.balanceOf(testAccount)).gt(0));
    });

    it("should be able to add liquidity with only eth", async () => {
        truffleAssert.passes(
            await this.RAMRouter.addLiquidityETHOnly(testAccount2, false, { from: testAccount2, value: (1e18).toString() })
        );

        assert.isTrue((await this.YGYRAMPair.balanceOf(testAccount2)).gt(0));
    });

    it("RAM vault: YGY->RAM pool deposit and withdraw", async () => {
        // Add a new pool
        truffleAssert.passes(
            await this.RAMvault.add(100, this.YGYRAMPair.address, true, true, { from: setterAccount })
        );

        truffleAssert.passes(
            await this.RAMRouter.addLiquidityETHOnly(testAccount2, false, { from: testAccount2, value: (2e18).toString() })
        );

        // Approve and deposit
        await this.YGYRAMPair.approve(this.RAMvault.address, (5*1e17).toString(), { from: testAccount2 });
        truffleAssert.passes(
            await this.RAMvault.deposit(0, (5*1e17).toString(), { from: testAccount2 })
        );

        truffleAssert.passes(
            await this.RAMvault.withdraw(0, (5*1e17).toString(), { from: testAccount2 })
        );
     });

     it("RAM vault: YGY->RAM pool purchase boosts", async () => {
        // Add a new pool
        truffleAssert.passes(
            await this.RAMvault.add(100, this.YGYRAMPair.address, true, true, { from: setterAccount })
        );

        truffleAssert.passes(
            await this.RAMRouter.addLiquidityETHOnly(testAccount2, false, { from: testAccount2, value: (2e18).toString() })
        );

        // Approve and deposit
        await this.YGYRAMPair.approve(this.RAMvault.address, (1*1e17).toString(), { from: testAccount2 });
        truffleAssert.passes(
            await this.RAMvault.deposit(0, (1*1e17).toString(), { from: testAccount2 })
        );

        const userBefore = await this.RAMvault.userInfo.call(0, testAccount2);
        assert.isTrue(userBefore.boostLevel == 0);
        assert.isTrue(userBefore.amount == (1e17));
        assert.isTrue(userBefore.boostAmount == 0);

        const poolBefore = await this.RAMvault.poolInfo.call(0);
        assert.isTrue(poolBefore.effectiveAdditionalTokensFromBoosts == 0);

        // Load testAccount2
        await this.RAMToken.transfer(testAccount2, (5.8 * 1e18).toString(), { from: setterAccount });

        // Approve RAM tokens and purchase boost
        await this.RAMToken.approve(this.RAMvault.address, (5.8 * 1e18).toString(), { from: testAccount2 });
        truffleAssert.passes(
            await this.RAMvault.purchase(0, 1, { from: testAccount2 })
        );

        const userAfter = await this.RAMvault.userInfo.call(0, testAccount2);
        assert.isTrue(userAfter.boostLevel == 1);
        assert.isTrue(userAfter.amount == (1e17));
        assert.isTrue(userAfter.boostAmount == (1e17*0.05));

        const poolAfter = await this.RAMvault.poolInfo.call(0);
        assert.isTrue(poolAfter.effectiveAdditionalTokensFromBoosts == (1e17*0.05));

        truffleAssert.passes(
            await this.RAMvault.withdraw(0, (1e17).toString(), { from: testAccount2 })
        );

        const userAfterWithdraw = await this.RAMvault.userInfo.call(0, testAccount2);
        assert.isTrue(userAfterWithdraw.boostLevel == 1);
        assert.isTrue(userAfterWithdraw.amount == 0);
        assert.isTrue(userAfterWithdraw.boostAmount == 0);

        const poolAfterWithdraw = await this.RAMvault.poolInfo.call(0);
        assert.isTrue(poolAfterWithdraw.effectiveAdditionalTokensFromBoosts == 0);
     });

     it("RAM vault: earn rewards", async () => {
        // Add a new pool
        truffleAssert.passes(
            await this.RAMvault.add(100, this.YGYRAMPair.address, true, true, { from: setterAccount })
        );

        truffleAssert.passes(
            await this.RAMRouter.addLiquidityETHOnly(testAccount2, false, { from: testAccount2, value: (2e18).toString() })
        );

        // Approve and deposit
        await this.YGYRAMPair.approve(this.RAMvault.address, (5*1e17).toString(), { from: testAccount2 });
        truffleAssert.passes(
            await this.RAMvault.deposit(0, (5*1e17).toString(), { from: testAccount2 })
        );

        const beforeBalUser = Number(await this.RAMToken.balanceOf(testAccount2));
        const belowBalVault = Number(await this.RAMToken.balanceOf(this.RAMvault.address));
        console.log("User balance before:", beforeBalUser);
        console.log("Vault balance before:", belowBalVault);

        // Do some token transfers
        await this.RAMToken.transfer(testAccount, 5e18.toString(), { from: setterAccount });
        await this.RAMToken.transfer(setterAccount, 4.5e18.toString(), { from: testAccount });
        await this.RAMToken.transfer(testAccount, 3e18.toString(), { from: setterAccount });

        // Advance time forward a month
        const oneMonthInSeconds = 2419200;
        await timeMachine.advanceTimeAndBlock(oneMonthInSeconds);

        truffleAssert.passes(
            await this.RAMvault.withdraw(0, (4e17).toString(), { from: testAccount2 })
        );

        const afterBalUser = Number(await this.RAMToken.balanceOf(testAccount2));
        const afterBalVault = Number(await this.RAMToken.balanceOf(this.RAMvault.address));
        console.log("User balance after:", afterBalUser);
        console.log("Vault balance after:", afterBalVault);

        assert.isTrue(afterBalUser > beforeBalUser);
        assert.isTrue(afterBalVault < belowBalVault);
     });

    // With lottery ticket {levelOneChance: 100, levelTwoChance: 50, levelThreeChance: 0, levelFourChance: 0, levelFiveChance: 0 }
    //  and with a random result of 51, this test should return true
    //  it("should win NFTs based on the random number", async () => {
    //     await this.YGYToken.transfer(testAccount, 2e18.toString(), { from: setterAccount });

    //     await this.YGYToken.approve(this.RAMRouter.address, 2e18.toString(), { from: testAccount });
    //     truffleAssert.passes(
    //         await this.RAMRouter.addLiquidityYGYOnly(2e18.toString(), false, { from: testAccount })
    //     );

    //     const ethValueOfContributions = Number(await this.RAMRouter.liquidityContributedEthValue.call(testAccount));
    //     console.log("ethValueOfContributions:", ethValueOfContributions);
    //     const userLotteryLevel = Number(await this.RAMRouter.getUserLotteryLevel.call(testAccount));
    //     console.log("userLotteryLevel:", userLotteryLevel);

    //     const NFTOne = await NFT.at(this.nftAddrs[0]);
    //     const NFTTwo = await NFT.at(this.nftAddrs[1]);

    //     const levelOneNFTBalanceBefore = Number(await NFTOne.balanceOf.call(testAccount));
    //     const levelTwoNFTBalanceBefore = Number(await NFTTwo.balanceOf.call(testAccount));

    //     console.log("levelOneNFTBalanceBefore:", levelOneNFTBalanceBefore)
    //     console.log("levelTwoNFTBalanceBefore:", levelTwoNFTBalanceBefore)

    //     truffleAssert.passes(
    //         await this.RAMRouter.applyRandomNumberToLottery({ from: testAccount })
    //     );

    //     const levelOneNFTBalanceAfter = Number(await NFTOne.balanceOf.call(testAccount));
    //     const levelTwoNFTBalanceAfter = Number(await NFTTwo.balanceOf.call(testAccount));

    //     console.log("levelOneNFTBalanceAfter:", levelOneNFTBalanceAfter)
    //     console.log("levelTwoNFTBalanceAfter:", levelTwoNFTBalanceAfter)

    //     assert.isTrue(levelOneNFTBalanceAfter == (levelOneNFTBalanceBefore+1));
    //     assert.isTrue(levelTwoNFTBalanceAfter == (levelTwoNFTBalanceBefore));
    // });
});
