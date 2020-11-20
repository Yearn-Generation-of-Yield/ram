const UniRAMRouter = artifacts.require("RAMv1Router");
const UniV2Factory = artifacts.require("UniswapV2Factory");
const WETH = artifacts.require("WETH9");
const RAM = artifacts.require("RAM");
const RAMVAULT = artifacts.require("RAMVault");
const Token = artifacts.require("Token");
const UniV2Pair = artifacts.require("UniswapV2Pair");
const FeeApprover = artifacts.require('FeeApprover');

const truffleAssert = require("truffle-assertions");
const assert = require("chai").assert;

contract("UniRAMRouter", accounts => {

    let testAccount = accounts[0];
    let setterAccount = accounts[1];
    let testAccount2 = accounts[2];
    let devAccount = accounts[3];

    let teamAddr = accounts[4];
    let rengeneratorAddr = accounts[5];

    beforeEach(async () => {
        // Deploy a new Uniswap Factory and set 'setterAccount' which collects fees
        this.uniV2Factory = await UniV2Factory.new(setterAccount);

        // Deploy a new WETH wrapped Ethereum token [FOR TESTING]
        this.weth = await WETH.new();

        // Deposit Ethereum and get WETH tokens
        this.weth.deposit({ from: testAccount2, value: (5e18).toString() });
        this.weth.deposit({ from: setterAccount, value: (5e18).toString() });

        // Deploy a new RAM token which manages Governance for the protocol
        this.YGYToken = await Token.new("YGY", "YGY", (20*1e18).toString(), { from: setterAccount });
        this.RAMToken = await RAM.new(this.uniV2Factory.address, this.uniV2Factory.address, this.YGYToken.address, { from: setterAccount });

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

        // Deploy RAMRouter contract
        this.RAMRouter = await UniRAMRouter.new(this.RAMToken.address, this.YGYToken.address, this.weth.address, this.uniV2Factory.address, this.YGYRAMPair.address, this.YGYWETHPair.address, this.feeapprover.address, this.RAMvault.address);

        // Initialize RAMVault
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

        // Load testAccount2
        await this.RAMToken.transfer(testAccount2, (5.8 * 1e18).toString(), { from: setterAccount });

        // Approve RAM tokens and purchase boost
        await this.RAMToken.approve(this.RAMvault.address, (5.4 * 1e18).toString(), { from: testAccount2 });
        truffleAssert.passes(
            await this.RAMvault.purchase(0, 1, { from: testAccount2 })
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
});
