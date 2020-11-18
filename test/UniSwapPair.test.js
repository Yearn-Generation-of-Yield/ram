// const { bigNumberify, defaultAbiCoder, BigNumber } = require('ethers/utils')
const RamToken = artifacts.require('RAM');
const { expectRevert, time } = require('@openzeppelin/test-helpers');
const RamVault = artifacts.require('RamVault');

const WETH9 = artifacts.require('WETH9');
const UniswapV2Pair = artifacts.require('UniswapV2Pair');
const UniswapV2Factory = artifacts.require('UniswapV2Factory');
const FeeApprover = artifacts.require('FeeApprover');
const UniswapV2Router02 = artifacts.require('UniswapV2Router02');

contract('RamToken', ([alice, john, minter, dev, burner, clean, clean2, clean3, clean4, clean5]) => {
    before(async () => {

        this.factory = await UniswapV2Factory.new(alice, { from: alice });
        this.weth = await WETH9.new({ from: john });
        await this.weth.deposit({ from: alice, value: '100000000000000000' })
        this.router = await UniswapV2Router02.new(this.factory.address, this.weth.address, { from: alice });
        this.ram = await RamToken.new(this.router.address, this.factory.address, { from: alice });
        this.ramWETHPair = await UniswapV2Pair.at(await this.factory.getPair(this.weth.address, this.ram.address));

        await this.ram.addLiquidity(true, { from: minter, value: '100000000000000' });
        await time.increase(60 * 60 * 24 * 7 + 1);
        await this.ram.addLiquidityToUniswapRAMxWETHPair();
        await this.ram.claimLPTokens({ from: minter });

        assert.equal((await this.weth.balanceOf(this.ramWETHPair.address)).valueOf().toString(), '100000000000000');
        assert.equal((await this.ram.balanceOf(this.ramWETHPair.address)).valueOf().toString(), 10000e18);

        await this.ramWETHPair.sync()

        console.log(this.ram.address);
        this.feeapprover = await FeeApprover.new({ from: alice });
        await this.feeapprover.initialize(this.ram.address, this.weth.address, this.factory.address);

        await this.feeapprover.setPaused(false, { from: alice });
        await this.ram.setShouldTransferChecker(this.feeapprover.address, { from: alice });

        await this.router.swapExactETHForTokensSupportingFeeOnTransferTokens('1', [await this.router.WETH(), this.ram.address], minter, 15999743005, { from: minter, value: '5000000000000000000' });


        console.log("Balance of minter is ", (await this.ram.balanceOf(minter)).valueOf().toString());
        assert.equal(await this.factory.getPair(this.ram.address, this.weth.address), this.ramWETHPair.address);
        // await this.factory.createPair(this.weth.address, this.ram.address);

    })
    beforeEach(async () => {
        this.ramvault = await RamVault.new({ from: alice });
        await this.ramvault.initialize(this.ram.address, dev, clean, clean3, clean);

        await this.weth.transfer(minter, '1000000000000000', { from: alice });

        await this.feeapprover.setRamVaultAddress(this.ramvault.address, { from: alice });
        // Set pair in the uni reert contract


    });

    // TODO: fix
    // it('Token 0 has to be weth', async () => {
    //     assert.equal(await this.ramWETHPair.token0(), this.weth.address);
    // });

    it('Constructs fee multiplier correctly', async () => {
        assert.equal(await this.feeapprover.feePercentX100(), '10');
    });


    it('RamVault should have pending fees set correctly and correct balance', async () => {
        await this.ram.setFeeDistributor(this.ramvault.address, { from: alice });
        await this.ram.transfer(john, '1000', { from: minter });
        assert.equal((await this.ramvault.pendingRewards()), '10');
        assert.equal((await this.ram.balanceOf(this.ramvault.address)), '10');
    });



    it('Allows you to get fee multiplier and doesn`t allow non owner to call', async () => {
        assert.equal(await this.feeapprover.feePercentX100(), '10',);
        await expectRevert(this.feeapprover.setFeeMultiplier('20', { from: john }), 'Ownable: caller is not the owner');
        await this.feeapprover.setFeeMultiplier('20', { from: alice });
        assert.equal(await this.feeapprover.feePercentX100(), '20');
    });

    it('allows to transfer to contracts and people', async () => {
        await this.ram.transfer(this.ramWETHPair.address, '100000000', { from: minter }); //contract
        await this.ram.transfer(john, '100000000', { from: minter }); //person
    });

    it('sets fee bearer correctly ', async () => {
        await expectRevert(this.ram.setFeeDistributor(this.ramvault.address, { from: minter }), 'Ownable: caller is not the owner');
        await this.ram.setFeeDistributor(this.ramvault.address, { from: alice });
        assert.equal(await this.ram.feeDistributor(), this.ramvault.address);
    });


    it('calculates fees correctly', async () => {
        await this.ram.transfer(burner, (await this.ram.balanceOf(john)).valueOf().toString(), { from: john });
        await this.feeapprover.setFeeMultiplier(10, { from: alice })

        await this.ram.setFeeDistributor(this.ramvault.address, { from: alice });
        const balanceOfMinter = (await this.ram.balanceOf(minter)).valueOf();
        await this.ram.transfer(john, '1000', { from: minter });

        assert.equal((await this.ram.balanceOf(this.ramvault.address)).valueOf().toString(), "10");
        assert.equal((await this.ram.balanceOf(john)).valueOf().toString(), "990");
        assert.equal((await this.ram.balanceOf(minter)).valueOf().toString(), balanceOfMinter - 1000);

        await this.feeapprover.setFeeMultiplier('20', { from: alice });
        assert.equal(await this.feeapprover.feePercentX100(), '20');
        await this.ram.transfer(john, '1000', { from: minter });

        assert.equal((await this.ram.balanceOf(this.ramvault.address)).valueOf().toString(), "30");
        assert.equal((await this.ram.balanceOf(john)).valueOf().toString(), 990 + 980);
        assert.equal((await this.ram.balanceOf(minter)).valueOf().toString(), balanceOfMinter - 2000);

        await this.ram.transfer(john, '1', { from: minter });
        await this.ram.transfer(john, '2', { from: minter });
        assert.equal((await this.ram.balanceOf(john)).valueOf().toString(), 990 + 980 + 3);
        assert.equal((await this.ram.balanceOf(this.ramvault.address)).valueOf().toString(), "30");
        assert.equal((await this.ram.balanceOf(minter)).valueOf().toString(), balanceOfMinter - 2003);

        await this.ram.transfer(minter, '1000', { from: john });

        assert.equal((await this.ram.balanceOf(this.ramvault.address)).valueOf().toString(), "50");
    });


    it('should be able to deposit in ramvault (includes depositing 0)', async () => {
        await this.weth.transfer(this.ramWETHPair.address, '100000000', { from: minter });
        await this.ram.transfer(this.ramWETHPair.address, '100000000', { from: minter });
        await this.ramWETHPair.mint(minter);
        await this.ramWETHPair.transfer(this.ramWETHPair.address, "2000000", { from: minter });

        // aprove spend of everything
        await this.ramWETHPair.approve(this.ramvault.address, '10000000000000', { from: minter });

        // make pair
        await this.ramvault.add('100', this.ramWETHPair.address, true, true, { from: alice });


        const LPTokenBalanceOfMinter = await this.ramWETHPair.balanceOf(minter)
        assert.notEqual(LPTokenBalanceOfMinter, "0");

        await this.ramvault.deposit(0, "100", { from: minter });
        assert.equal((await this.ramWETHPair.balanceOf(this.ramvault.address)).valueOf().toString(), "100");
        await this.ramvault.deposit(0, "0", { from: minter });
        assert.equal((await this.ramWETHPair.balanceOf(this.ramvault.address)).valueOf().toString(), "100");
    });

    it("Sanity check for fees amount", async () => {
        await this.ram.setFeeDistributor(this.ramvault.address, { from: alice });
        await this.feeapprover.setFeeMultiplier(10, { from: alice })

        await this.ramvault.add('100', this.ramWETHPair.address, true, true, { from: alice });
        await this.ramWETHPair.transfer(clean3, '100', { from: minter });
        await this.ramWETHPair.approve(this.ramvault.address, '100', { from: clean3 });
        await this.ramvault.setDevFee('1000', { from: alice }); //10%
        await this.ramvault.deposit(0, "100", { from: clean3 });
        await this.ram.transfer(burner, '100000', { from: minter });

        assert.equal((await this.ramvault.pendingRewards()).valueOf().toString(), "1000")
        await this.ramvault.deposit(0, "0", { from: clean3 });

        assert.equal((await this.ram.balanceOf(clean3)).valueOf().toString(), "900");
        assert.equal((await this.ram.balanceOf(this.ramvault.address)).valueOf().toString(), '0');
        await this.ram.transfer(burner, '100000', { from: minter });

        await this.ram.transfer(burner, '100000', { from: minter });
        await this.ram.transfer(burner, '100000', { from: minter });
        await this.ram.transfer(burner, '100000', { from: minter });
        await this.ramvault.deposit(0, "0", { from: clean3 });
        await this.ramvault.deposit(0, "0", { from: clean3 });
        await this.ramvault.deposit(0, "0", { from: clean3 });
        await this.ramvault.deposit(0, "0", { from: clean3 });
        await this.ramvault.deposit(0, "0", { from: clean3 });

        assert.equal((await this.ram.balanceOf(this.ramvault.address)).valueOf().toString(), '0');
        assert.equal((await this.ram.balanceOf(clean3)).valueOf().toString(), "4500");
    });



    it("Multiple pools work", async () => {
        await this.ram.setFeeDistributor(this.ramvault.address, { from: alice });
        await this.feeapprover.setFeeMultiplier(10, { from: alice })

        await this.ramvault.add('1', this.ramWETHPair.address, true, true, { from: alice });
        await this.ramvault.add('1', this.weth.address, true, true, { from: alice });

        await this.ramWETHPair.transfer(clean4, '100', { from: minter });
        await this.weth.transfer(clean4, '100', { from: minter });

        await this.ramWETHPair.approve(this.ramvault.address, '50', { from: clean4 });
        await this.weth.approve(this.ramvault.address, '50', { from: clean4 });

        await this.ramvault.deposit(0, "1", { from: clean4 });
        await this.ramvault.deposit(1, "1", { from: clean4 });

        await this.ramvault.setDevFee('1000', { from: alice }); //10%
        await this.ram.transfer(burner, '1000000', { from: minter });

        assert.equal((await this.ramvault.pendingRewards()).valueOf().toString(), "10000")
        await this.ramvault.deposit(0, "0", { from: clean4 });
        await this.ramvault.deposit(1, "0", { from: clean4 });
        assert.equal((await this.ramvault.pendingRewards()).valueOf().toString(), "0")

        await this.ramvault.deposit(0, "0", { from: clean4 });
        await this.ramvault.deposit(1, "0", { from: clean4 });
        assert.equal((await this.ram.balanceOf(clean4)).valueOf().toString(), "9000");

        assert.equal((await this.ram.balanceOf(this.ramvault.address)).valueOf().toString(), '0');

        await this.ram.transfer(burner, '1000000', { from: minter });
        await this.ramvault.deposit(0, "0", { from: clean4 });
        await this.ramvault.deposit(1, "0", { from: clean4 });
        assert.equal((await this.ram.balanceOf(clean4)).valueOf().toString(), "18000");


        await this.ram.transfer(burner, '1000000', { from: minter });
        await this.ramvault.deposit(0, "0", { from: clean4 });
        await this.ramvault.deposit(1, "0", { from: clean4 });
        assert.equal((await this.ram.balanceOf(clean4)).valueOf().toString(), "27000");
        await this.ram.transfer(burner, '1000000', { from: minter });
        await this.ram.transfer(burner, '1000000', { from: minter });
        await this.ramvault.deposit(0, "0", { from: clean4 });
        await this.ramvault.deposit(0, "0", { from: clean4 });
        assert.equal((await this.ram.balanceOf(clean4)).valueOf().toString(), "36000");
        await this.ramvault.deposit(1, "0", { from: clean4 });


        assert.equal((await this.ram.balanceOf(this.ramvault.address)).valueOf().toString(), '0');

        assert.equal((await this.ram.balanceOf(clean4)).valueOf().toString(), "45000");

    });

    it("RamVault should give rewards to LP stakers proportionally", async () => {
        await this.ram.setFeeDistributor(this.ramvault.address, { from: alice });

        await this.ramvault.add('100', this.ramWETHPair.address, true, true, { from: alice });
        // await this.ramWETHPair.mint(minter);
        await this.ramWETHPair.transfer(clean2, '100', { from: minter });
        await this.ramWETHPair.approve(this.ramvault.address, '10000000000000', { from: clean2 });
        await this.ramvault.deposit(0, "100", { from: clean2 });
        await this.ram.transfer(burner, '1000', { from: minter })
        assert.equal((await this.ramvault.pendingRewards()).valueOf().toString(), "10")
        assert.equal((await this.ram.balanceOf(this.ramvault.address)).valueOf().toString(), "10")

        await time.advanceBlock();
        await this.ramvault.massUpdatePools();

        await time.advanceBlock();
        await time.advanceBlock();
        await time.advanceBlock();
        await this.ramvault.deposit(0, '0', { from: clean2 });
        assert.equal((await this.ram.balanceOf(clean2)).valueOf().toString(), "10");
        await this.ramvault.deposit(0, '0', { from: clean2 });

        await this.ramvault.deposit(0, '0', { from: clean });

        await this.ramWETHPair.approve(this.ramvault.address, '10000000000000', { from: clean });
        await this.ramWETHPair.transfer(clean, '1000', { from: minter });
        assert.equal((await this.ramWETHPair.balanceOf(clean)).valueOf().toString(), '1000');

        await this.ramvault.deposit(0, '1000', { from: clean });
        assert.equal((await this.ramvault.pendingRewards()).valueOf().toString(), "0")
        assert.equal((await this.ram.balanceOf(clean)).valueOf().toString(), "0");
        await this.ramvault.deposit(0, '0', { from: clean });
        await this.ramvault.deposit(0, '0', { from: clean2 });
        assert.equal((await this.ram.balanceOf(this.ramvault.address)).valueOf().toString(), '0');


        assert.equal((await this.ram.balanceOf(clean)).valueOf().toString(), '0');
        assert.equal((await this.ram.balanceOf(clean2)).valueOf().toString(), "10");

        await time.advanceBlock();

        await time.advanceBlock();

        await time.advanceBlock();
        await this.ramvault.deposit(0, '0', { from: clean });
        assert.equal((await this.ram.balanceOf(clean)).valueOf().toString(), '0');
        assert.equal((await this.ram.balanceOf(clean2)).valueOf().toString(), "10");
        await this.ram.transfer(burner, '1000', { from: minter })
        assert.equal((await this.ramvault.pendingRewards()).valueOf().toString(), "10")
        await time.advanceBlock();

        await this.ramvault.deposit(0, '0', { from: clean });
        await this.ramvault.deposit(0, '0', { from: clean2 });


        assert.equal((await this.ram.balanceOf(clean2)).valueOf().toString(), "10");
        assert.equal((await this.ram.balanceOf(clean)).valueOf().toString(), '9');

        await this.ram.transfer(burner, '100000', { from: minter })
        await this.ramvault.deposit(0, '0', { from: clean });
        await this.ramvault.deposit(0, '0', { from: clean2 });

        assert.equal((await this.ram.balanceOf(clean2)).valueOf().toString(), "95");
        assert.equal((await this.ram.balanceOf(clean)).valueOf().toString(), '852');

        await this.ram.transfer(burner, '1000000', { from: minter })
        assert.equal((await this.ramvault.pendingRewards()).valueOf().toString(), "10000")

        await this.ramvault.deposit(0, '0', { from: clean });
        await this.ramvault.deposit(0, '0', { from: clean2 });
        assert.equal((await this.ram.balanceOf(clean2)).valueOf().toString(), "938");
        assert.equal((await this.ram.balanceOf(clean)).valueOf().toString(), '9285');

        // Checking if clean has balances even tho clean2 claimed twice
        assert.equal((await this.ramvault.pendingRewards()).valueOf().toString(), "0")

        await this.ram.transfer(burner, '1000000', { from: minter })
        assert.equal((await this.ramvault.pendingRewards()).valueOf().toString(), "10000")

        await this.ramvault.deposit(0, '0', { from: clean2 });
        assert.equal((await this.ramvault.pendingRewards()).valueOf().toString(), "0")

        assert.equal((await this.ram.balanceOf(clean2)).valueOf().toString(), "1781");
        assert.equal((await this.ram.balanceOf(clean)).valueOf().toString(), '9285');

        await this.ram.transfer(burner, '1000000', { from: minter })
        assert.equal((await this.ramvault.pendingRewards()).valueOf().toString(), "10000")

        await this.ramvault.deposit(0, '0', { from: clean2 });
        await this.ramvault.deposit(0, '0', { from: clean2 });

        await this.ramvault.deposit(0, '0', { from: clean2 });

        assert.equal((await this.ram.balanceOf(clean2)).valueOf().toString(), "2625");
        assert.equal((await this.ram.balanceOf(clean)).valueOf().toString(), '9285');
        await time.advanceBlock();
        assert.equal((await this.ramvault.pendingRewards()).valueOf().toString(), "0")

        await time.advanceBlock();
        await time.advanceBlock();
        assert.equal((await this.ramvault.pendingRewards()).valueOf().toString(), "0")

        await time.advanceBlock();
        await time.advanceBlock();
        assert.equal((await this.ramvault.pendingRewards()).valueOf().toString(), "0")
        await this.ramvault.deposit(0, '0', { from: clean2 });
        await this.ramvault.deposit(0, '0', { from: clean2 });
        assert.equal((await this.ramvault.pendingRewards()).valueOf().toString(), "0")
        assert.equal((await this.ram.balanceOf(clean2)).valueOf().toString(), "2625");
        assert.equal((await this.ram.balanceOf(clean)).valueOf().toString(), '9285');
        await this.ramvault.deposit(0, '0', { from: clean });
        await this.ramvault.deposit(0, '0', { from: clean2 });
        assert.equal((await this.ram.balanceOf(clean2)).valueOf().toString(), "2625");
        assert.equal((await this.ram.balanceOf(clean)).valueOf().toString(), '26150');
        await this.ramvault.withdraw(0, '1000', { from: clean })
        assert.equal((await this.ramvault.pendingRewards()).valueOf().toString(), "0")
        await this.ram.transfer(burner, '1000000', { from: minter })
        assert.equal((await this.ramvault.pendingRewards()).valueOf().toString(), "10000")
        await expectRevert(this.ramvault.withdraw(0, '1000', { from: clean }), 'withdraw: not good');
        await this.ramvault.deposit(0, '0', { from: clean2 });
        await this.ramvault.deposit(0, '0', { from: clean });
        assert.equal((await this.ram.balanceOf(clean2)).valueOf().toString(), "11901");
        assert.equal((await this.ram.balanceOf(clean)).valueOf().toString(), '26150');

        await this.ram.transfer(burner, '1000000', { from: minter })
        await this.ramvault.deposit(0, '1000', { from: clean })
        await this.ramvault.emergencyWithdraw(0, { from: clean })
        await this.ramvault.deposit(0, '0', { from: clean2 });
        await this.ramvault.deposit(0, '0', { from: clean });
        assert.equal((await this.ram.balanceOf(clean2)).valueOf().toString(), "21177");
        assert.equal((await this.ram.balanceOf(clean)).valueOf().toString(), '26150');

        await this.ramvault.deposit(0, '0', { from: clean });
        await this.ramvault.deposit(0, '0', { from: clean2 });
        await this.ramvault.deposit(0, '0', { from: clean });
        await this.ramvault.deposit(0, '0', { from: clean2 });

        // This is expected to rouding error
        assert.equal((await this.ram.balanceOf(this.ramvault.address)).valueOf().toString(), '1');
        await this.ram.transfer(burner, '1000000', { from: minter })
        await this.ram.transfer(burner, '1000000', { from: minter })
        await this.ram.transfer(burner, '1000000', { from: minter })
        await this.ramvault.deposit(0, '0', { from: clean });
        await this.ramvault.deposit(0, '0', { from: clean2 });
        await this.ramvault.deposit(0, '0', { from: clean });
        await this.ramvault.deposit(0, '0', { from: clean2 });
        assert.equal((await this.ram.balanceOf(this.ramvault.address)).valueOf().toString(), '1');

        await this.feeapprover.setFeeMultiplier('20', { from: alice });
        await this.ram.transfer(burner, '1000000', { from: minter })
        await this.ramvault.deposit(0, '0', { from: clean });
        await this.ramvault.deposit(0, '0', { from: clean2 });


        assert.equal((await this.ram.balanceOf(this.ramvault.address)).valueOf().toString(), '1');

    })
    it('Pools can be disabled withdrawals', async () => {
        await this.ramvault.add('100', this.ramWETHPair.address, true, false, { from: alice });
        await this.ramWETHPair.approve(this.ramvault.address, '100', { from: minter });

        await this.ramvault.deposit(0, '100', { from: minter });
        await expectRevert(this.ramvault.withdraw(0, '100', { from: minter }), 'Withdrawing from this pool is disabled');
        await expectRevert(this.ramvault.emergencyWithdraw(0, { from: minter }), 'Withdrawing from this pool is disabled');
    });

    it('Pools can be disabled and then enabled withdrawals', async () => {
        await this.ramvault.add('100', this.ramWETHPair.address, true, false, { from: alice });
        await this.ramWETHPair.approve(this.ramvault.address, '100', { from: minter });

        await this.ramvault.deposit(0, '100', { from: minter });
        await expectRevert(this.ramvault.withdraw(0, '100', { from: minter }), 'Withdrawing from this pool is disabled');
        await expectRevert(this.ramvault.emergencyWithdraw(0, { from: minter }), 'Withdrawing from this pool is disabled');
        await this.ramvault.setPoolWithdrawable(0, true, { from: alice });
        this.ramvault.withdraw(0, '10', { from: minter });
        await this.ramvault.setPoolWithdrawable(0, false, { from: alice });
        await expectRevert(this.ramvault.emergencyWithdraw(0, { from: minter }), 'Withdrawing from this pool is disabled');
        await this.ramvault.setPoolWithdrawable(0, true, { from: alice });
        await this.ramvault.emergencyWithdraw(0, { from: minter });
    });

    it('Doesnt let other people than owner set withdrawable of pool', async () => {
        await this.ramvault.add('100', this.ramWETHPair.address, true, false, { from: alice });
        await this.ramvault.setPoolWithdrawable(0, false, { from: alice });
        await expectRevert(this.ramvault.setPoolWithdrawable(0, false, { from: minter }), "Ownable: caller is not the owner");
        await expectRevert(this.ramvault.setPoolWithdrawable(0, false, { from: john }), "Ownable: caller is not the owner");
    });



    it("Gives dev fees correctly", async () => {
        let balanceOfDev = (await this.ram.balanceOf(dev)).valueOf().toNumber()
        let ramBalanceOfClean2 = (await this.ram.balanceOf(clean2)).valueOf().toNumber()
        await this.feeapprover.setFeeMultiplier(10, { from: alice })


        await this.ram.setFeeDistributor(this.ramvault.address, { from: alice });
        assert.equal((await this.ram.balanceOf(dev)).valueOf(), balanceOfDev);

        await this.ramvault.add('100', this.ramWETHPair.address, true, true, { from: alice });
        assert.equal((await this.ram.balanceOf(dev)).valueOf().toString(), balanceOfDev);

        // await this.ramWETHPair.mint(minter);
        await this.ramWETHPair.approve(this.ramvault.address, '10000000000000', { from: clean2 });

        await this.ramWETHPair.transfer(clean2, '1000000', { from: minter });

        await this.ramvault.deposit(0, "100", { from: clean2 });
        assert.equal((await this.ram.balanceOf(dev)).valueOf().toString(), balanceOfDev);

        await this.ram.transfer(burner, '1000000', { from: minter })
        ///10000 expected farming fee
        assert.equal((await this.ram.balanceOf(this.ramvault.address)).valueOf().toString(), '10000');

        //724 expected dev fee
        //9276 expected after fee

        assert.equal((await this.ramvault.pendingRewards()).valueOf().toString(), "10000");
        assert.equal((await this.ram.balanceOf(dev)).valueOf().toString(), balanceOfDev);
        await this.ramvault.deposit(0, "0", { from: john });
        assert.equal((await this.ramvault.pendingRam(0, clean2)).valueOf().toString(), "9276");

        await this.ramvault.deposit(0, "0", { from: clean2 });
        assert.equal((await this.ram.balanceOf(clean2)).valueOf().toString(), ramBalanceOfClean2 + 9276);

        assert.equal((await this.ram.balanceOf(dev)).valueOf().toString(), balanceOfDev + 724);

        // assert.equal((await this.ramvault.pendingRam(0, clean2)).valueOf().toString(), "9276");
        // assert.equal((await this.ramvault.pendingRam(0, dev)).valueOf().toString(), "67158");

        assert.equal((await this.ram.balanceOf(dev)).valueOf().toString(), balanceOfDev + 724);
        balanceOfDev = (await this.ram.balanceOf(dev)).valueOf().toNumber();
        ramBalanceOfClean2 = (await this.ram.balanceOf(clean2)).valueOf().toNumber();
        await this.ram.transfer(burner, '1000000', { from: minter })
        await this.ramvault.setDevFee('1000', { from: alice });
        await this.ramvault.deposit(0, "0", { from: john });

        assert.equal((await this.ramvault.pendingRam(0, clean2)).valueOf().toString(), "9000");
        await this.ramvault.deposit(0, "0", { from: clean2 });

        assert.equal((await this.ram.balanceOf(clean2)).valueOf().toString(), ramBalanceOfClean2 + 9000);
        assert.equal((await this.ram.balanceOf(dev)).valueOf().toString(), balanceOfDev + 1000);
    })




    it('should Mint LP tokens sucessfully successfully', async () => {
        await this.weth.transfer(this.ramWETHPair.address, '10000000', { from: minter });
        await this.ram.transfer(this.ramWETHPair.address, '10000000', { from: minter });
        await this.ramWETHPair.mint(minter);
        assert.notEqual((await this.ramWETHPair.balanceOf(minter)).valueOf().toString(), "0");
    });

    it('Should give correct numbers on view pending', async () => {
        await this.ram.setFeeDistributor(this.ramvault.address, { from: alice });
        await this.feeapprover.setFeeMultiplier(10, { from: alice })

        await this.ramvault.add('100', this.ramWETHPair.address, true, true, { from: alice });
        // await this.ramWETHPair.mint(minter);
        await this.ramWETHPair.transfer(clean2, '100', { from: minter });
        await this.ramWETHPair.approve(this.ramvault.address, '10000000000000', { from: clean2 });
        await this.ramvault.deposit(0, "100", { from: clean2 });
        await this.ram.transfer(burner, '1000', { from: minter })
        assert.equal((await this.ramvault.pendingRewards()).valueOf().toString(), "10")
        assert.equal((await this.ram.balanceOf(this.ramvault.address)).valueOf().toString(), "10")

        await time.advanceBlock();
        await this.ramvault.massUpdatePools();
        const balance = (await this.ram.balanceOf(clean2)).valueOf().toNumber()
        assert.equal((await this.ramvault.pendingRewards()).valueOf().toString(), "0")
        assert.equal((await this.ramvault.pendingRam(0, clean2)).valueOf().toString(), "10")
        await this.ramvault.deposit(0, "0", { from: clean2 });
        assert.equal((await this.ram.balanceOf(clean2)).valueOf().toString(), `${balance + 10}`);

    });

    it('Should not let people withdraw for someone without approval and updates allowances correctly', async () => {
        await this.ram.setFeeDistributor(this.ramvault.address, { from: alice });
        await this.feeapprover.setFeeMultiplier(10, { from: alice })

        await this.ramvault.add('100', this.ramWETHPair.address, true, true, { from: alice });
        await this.ramWETHPair.transfer(clean2, '100', { from: minter });
        await this.ramWETHPair.approve(this.ramvault.address, '10000000000000', { from: clean2 });
        await this.ramvault.deposit(0, "100", { from: clean2 });
        await this.ram.transfer(burner, '1000', { from: minter })

        // function withdrawFrom(address owner, uint256 _pid, uint256 _amount) public{

        await expectRevert(this.ramvault.withdrawFrom(clean2, 0, '100', { from: minter }), "withdraw: insufficient allowance");
        await expectRevert(this.ramvault.withdrawFrom(clean2, 0, '100', { from: alice }), "withdraw: insufficient allowance");
        await expectRevert(this.ramvault.withdrawFrom(clean2, 0, '100', { from: clean3 }), "withdraw: insufficient allowance");
        await expectRevert(this.ramvault.withdrawFrom(clean2, 0, '100', { from: clean }), "withdraw: insufficient allowance");
        await expectRevert(this.ramvault.withdrawFrom(clean2, 0, '100', { from: clean2 }), "withdraw: insufficient allowance");

        await this.ramvault.setAllowanceForPoolToken(clean5, 0, '100', { from: clean2 });
        await this.ramvault.withdrawFrom(clean2, 0, '100', { from: clean5 });

        await this.ramvault.deposit(0, "100", { from: clean2 });
        await expectRevert(this.ramvault.withdrawFrom(clean2, 0, '100', { from: clean5 }), "withdraw: insufficient allowance");
        await this.ramvault.setAllowanceForPoolToken(clean5, 0, '100', { from: clean2 });
        await this.ramvault.withdrawFrom(clean2, 0, '100', { from: clean5 });

        await expectRevert(this.ramvault.withdrawFrom(clean2, 0, '100', { from: clean5 }), "withdraw: insufficient allowance")
        await this.ramvault.setAllowanceForPoolToken(clean5, 0, '100', { from: clean2 });

        await expectRevert(this.ramvault.withdrawFrom(clean2, 0, '100', { from: clean5 }), "withdraw: not good")

        assert.equal((await this.ramWETHPair.balanceOf(clean5)).valueOf().toString(), '200');

    });

    it('Should have correct balances for deposit for', async () => {
        await this.ram.setFeeDistributor(this.ramvault.address, { from: alice });
        await this.feeapprover.setFeeMultiplier(10, { from: alice })

        await this.ramvault.add('100', this.ramWETHPair.address, true, true, { from: alice });
        await this.ramWETHPair.transfer(clean2, '100', { from: minter });
        await this.ramWETHPair.approve(this.ramvault.address, '10000000000000', { from: clean2 });
        await expectRevert(this.ramvault.withdraw(0, '100', { from: clean5 }), 'withdraw: not good')

        await this.ramvault.depositFor(clean5, 0, "100", { from: clean2 });
        await this.ram.transfer(burner, '1000', { from: minter });
        await this.ramvault.withdraw(0, '100', { from: clean5 })
        assert.notEqual(await this.ram.balanceOf(clean5).valueOf().toString(), '0');// got fes
        await expectRevert(this.ramvault.withdraw(0, '100', { from: clean5 }), 'withdraw: not good')

    });

    // TODO: Fix
    // it("should not allow people to burn at all", async () => {

    //     await this.weth.transfer(this.ramWETHPair.address, '100000000', { from: minter });

    //     await this.ram.transfer(this.ramWETHPair.address, '100000000', { from: minter });

    //     await this.ramWETHPair.mint(minter);


    //     await this.ramWETHPair.transfer(minter,
    //         (await this.ramWETHPair.balanceOf(this.ramWETHPair.address)).valueOf().toString(), { from: minter });


    //     assert.equal(await this.ramWETHPair.token0(), this.weth.address);

    //     // Call burn from minter
    //     await this.ramWETHPair.transfer(this.ramWETHPair.address, "10000", { from: minter });

    //     await expectRevert(this.ramWETHPair.burn(minter, { from: minter }), "UniswapV2: TRANSFER_FAILED")

    //     await this.ram.transfer(this.ramWETHPair.address, '100000000', { from: minter });

    //     await this.ramWETHPair.transfer(this.ramWETHPair.address, "2000000", { from: minter });

    //     await this.weth.transfer(this.ramWETHPair.address, '100', { from: minter });

    //     await this.ram.transfer(this.ramWETHPair.address, '100', { from: minter });
    //     await this.ramWETHPair.mint(minter);

    //     await expectRevert(this.ramWETHPair.burn(minter), "UniswapV2: TRANSFER_FAILED")
    //     await this.weth.transfer(burner, '100', { from: minter });

    //     await expectRevert(this.ramWETHPair.burn(minter), "UniswapV2: TRANSFER_FAILED", { from: alice })
    //     await this.weth.transfer(burner, '100', { from: minter });

    //     await expectRevert(this.ramWETHPair.burn(minter), "UniswapV2: TRANSFER_FAILED", { from: minter })
    //     await this.ramWETHPair.transfer(this.ramWETHPair.address, "2", { from: minter });

    //     await expectRevert(this.ramWETHPair.burn(minter), "UniswapV2: TRANSFER_FAILED", { from: clean })
    //     await this.weth.transfer(burner, '100', { from: minter });

    //     await this.ramWETHPair.transfer(this.ramWETHPair.address, "2", { from: minter });
    //     await this.weth.transfer(this.ramWETHPair.address, '100', { from: minter });
    //     await this.ramWETHPair.transfer(this.ramWETHPair.address, "2", { from: minter });

    //     await this.ram.transfer(this.ramWETHPair.address, '100', { from: minter });

    //     await this.ramWETHPair.mint(minter);
    //     await expectRevert(this.ramWETHPair.burn(minter), "UniswapV2: TRANSFER_FAILED", { from: john })
    //     await this.weth.transfer(this.ramWETHPair.address, '10000', { from: minter });

    //     await this.ram.transfer(this.ramWETHPair.address, '10000', { from: minter });
    //     await this.ramWETHPair.mint(john);
    //     await this.ramWETHPair.transfer(this.ramWETHPair.address, "2", { from: john });
    //     await this.ramWETHPair.transfer(this.ramWETHPair.address, "2", { from: john });

    //     await expectRevert(this.ramWETHPair.burn(minter), "UniswapV2: TRANSFER_FAILED")


    //     // await expectRevert(this.ramWETHPair.burn(minter, { from: minter }), 'UniswapV2: TRANSFER_FAILED')
    //     await this.ram.transfer(burner, '100000000', { from: minter });
    //     await expectRevert(this.ramWETHPair.burn(minter), "UniswapV2: TRANSFER_FAILED")
    // });

    // TODO: Fix
    // it("Should allow to swap tokens", async () => {

    //     console.log(`\n`)
    //     console.log('++adding liqiudity manually start +++')
    //     await this.ram.transfer(this.ramWETHPair.address, '10000000000', { from: minter });
    //     await this.weth.transfer(this.ramWETHPair.address, '100000000000', { from: minter });
    //     await this.ramWETHPair.mint(minter);
    //     console.log('++adding liqiudity end +++')

    //     await this.ram.transfer(clean5, '2000000000000', { from: minter });

    //     await this.weth.transfer(clean5, '100000', { from: minter });
    //     await this.weth.approve(this.router.address, '11000000000', { from: clean5 });
    //     await this.weth.approve(this.ramWETHPair.address, '11000000000', { from: clean5 });
    //     await this.ram.approve(this.router.address, '11000000000', { from: clean5 });
    //     await this.ram.approve(this.ramWETHPair.address, '11000000000', { from: clean5 });
    //     await this.weth.approve(this.router.address, '11000000000', { from: minter });
    //     await this.weth.approve(this.ramWETHPair.address, '11000000000', { from: minter });
    //     await this.ram.approve(this.router.address, '11000000000', { from: minter });
    //     await this.ram.approve(this.ramWETHPair.address, '11000000000', { from: minter });

    //     assert.equal(await this.router.WETH(), this.weth.address);
    //     assert.equal(await this.ramWETHPair.token0(), this.weth.address)
    //     assert.equal(await this.ramWETHPair.token1(), this.ram.address)

    //     await this.ramWETHPair.approve(this.router.address, '110000000000000', { from: minter });

    //     console.log(`\n`)
    //     console.log("--start remove liquidity ETH---");
    //     await expectRevert(this.router.removeLiquidityETH(this.ram.address, '200', '1', '1', minter, 15999743005, { from: minter }), 'UniswapV2: TRANSFER_FAILED')
    //     console.log("--end remove liquidity ETH---");

    //     console.log(`\n`)
    //     console.log("--start remove liquidity normal---");
    //     await expectRevert(this.router.removeLiquidity(this.ram.address, this.weth.address, '200', '1', '1', minter, 15999743005, { from: minter }), 'UniswapV2: TRANSFER_FAILED')
    //     console.log("--end remove liquidity normal---");

    //     console.log(`\n`)
    //     console.log("--start remove liquidity with support for fee transfer---");
    //     await expectRevert(this.router.removeLiquidityETHSupportingFeeOnTransferTokens(this.ram.address, '200', '1', '1', minter, 15999743005, { from: minter }), 'UniswapV2: TRANSFER_FAILED')
    //     console.log("--end remove liquidity with support for fee transfer---");

    //     console.log(`\n`)
    //     console.log("--start token SELL");
    //     await this.router.swapExactTokensForETHSupportingFeeOnTransferTokens('1100000', '1000', [this.ram.address, await this.router.WETH()], clean5, 15999743005, { from: clean5 });
    //     console.log("--end token SELL");

    //     console.log(`\n`)
    //     console.log("++start buy swap for WETH+++");
    //     await this.router.swapExactETHForTokensSupportingFeeOnTransferTokens('1000', [await this.router.WETH(), this.ram.address], clean5, 15999743005, { from: alice, value: '343242423' });
    //     console.log("+++end buy swap fro WETH");

    //     console.log(`\n`)
    //     console.log('++adding liqiudity manually start +++')
    //     await this.weth.transfer(this.ramWETHPair.address, '100000', { from: minter });
    //     await this.ram.transfer(this.ramWETHPair.address, '100000', { from: minter });
    //     await this.ramWETHPair.mint(minter);
    //     console.log('++adding liqiudity end +++')

    //     console.log(`\n`)
    //     console.log('--calling burn ---')
    //     await expectRevert(this.ramWETHPair.burn(minter, { from: minter }), "UniswapV2: TRANSFER_FAILED")
    //     console.log('--end calling burn--')

    //     console.log(`\n`)
    //     console.log("--start token SELL");
    //     await this.router.swapExactTokensForETHSupportingFeeOnTransferTokens('1100000', '1000', [this.ram.address, await this.router.WETH()], clean5, 15999743005, { from: clean5 });
    //     console.log("--end token SELL");

    //     console.log(`\n`)
    //     console.log('--calling burn ---')
    //     await expectRevert(this.ramWETHPair.burn(minter, { from: minter }), "UniswapV2: TRANSFER_FAILED")
    //     console.log('--end calling burn--')


    //     console.log(`\n`)
    //     console.log("++start buy swap for WETH+++");
    //     await this.router.swapExactETHForTokensSupportingFeeOnTransferTokens('1000', [await this.router.WETH(), this.ram.address], clean5, 15999743005, { from: alice, value: '343242423' });
    //     console.log("+++end buy swap for WETH++")

    //     console.log(`\n`)
    //     console.log('++adding liqiudity manually start +++')
    //     await this.weth.transfer(this.ramWETHPair.address, '100000', { from: minter });
    //     await this.ram.transfer(this.ramWETHPair.address, '100000', { from: minter });
    //     await this.ramWETHPair.mint(minter);
    //     console.log('++adding liqiudity end +++')


    //     await this.ram.approve(this.ramWETHPair.address, '100000000000000000', { from: alice });
    //     await this.ram.approve(this.router.address, '100000000000000000', { from: alice });


    //     console.log(`\n`)
    //     console.log("--start remove liquidity with support for fee transfer---");
    //     await expectRevert(this.router.removeLiquidityETHSupportingFeeOnTransferTokens(this.ram.address, '200', '1', '1', minter, 15999743005, { from: minter }), 'UniswapV2: TRANSFER_FAILED')
    //     console.log("--end remove liquidity with support for fee transfer---");



    //     console.log(`\n`)
    //     console.log('++adding liqiudity via ETH start +++')
    //     await this.router.addLiquidityETH(this.ram.address, '10000', '1000', '1000', alice, 15999743005, { from: minter, value: 4543534 });
    //     console.log('++adding liqiudity end +++')

    //     console.log(`\n`)
    //     console.log('--calling burn ---')
    //     await expectRevert(this.ramWETHPair.burn(minter, { from: minter }), "UniswapV2: TRANSFER_FAILED")
    //     console.log('--end calling burn--')

    //     console.log(`\n`)
    //     console.log("--start remove liquidity normal---");
    //     await expectRevert(this.router.removeLiquidity(this.ram.address, this.weth.address, '1', '1', '1', minter, 15999743005, { from: minter }), 'UniswapV2: TRANSFER_FAILED')
    //     console.log("--end remove liquidity normal---");

    //     console.log(`\n`)
    //     console.log('--calling burn ---')
    //     await expectRevert(this.ramWETHPair.burn(minter, { from: minter }), "UniswapV2: TRANSFER_FAILED")
    //     console.log('--end calling burn--')

    //     console.log(`\n`)
    //     console.log('--start token SELL ---')
    //     await this.router.swapExactTokensForETHSupportingFeeOnTransferTokens('1100000', '1000', [this.ram.address, await this.router.WETH()], clean5, 15999743005, { from: clean5 });
    //     console.log('--end token SELL--')


    //     console.log(`\n`)
    //     console.log('++adding liqiudity via ETH start +++')
    //     await this.router.addLiquidityETH(this.ram.address, '9', '1', '1', alice, 15999743005, { from: minter, value: 4543534 });
    //     console.log('++adding liqiudity end +++')
    //     console.log(`\n`)
    //     console.log("--start remove liquidity normal---");
    //     await expectRevert(this.router.removeLiquidity(this.ram.address, this.weth.address, '1', '1', '1', minter, 15999743005, { from: minter }), 'UniswapV2: TRANSFER_FAILED')
    //     console.log("--end remove liquidity normal---");

    //     console.log(`\n`)
    //     console.log('--calling burn ---')
    //     await expectRevert(this.ramWETHPair.burn(minter, { from: minter }), "UniswapV2: TRANSFER_FAILED");
    //     console.log('--end calling burn--')


    //     console.log(`\n`)
    //     console.log('+++start buy via ETH and then WETH+++')
    //     //buy via eth
    //     await this.router.swapExactETHForTokensSupportingFeeOnTransferTokens('0', [await this.router.WETH(), this.ram.address], clean5, 15999743005, { from: alice, value: '34324233' });
    //     //buy via weth
    //     await this.router.swapExactTokensForTokensSupportingFeeOnTransferTokens('10000', '0', [await this.router.WETH(), this.ram.address], clean5, 15999743005, { from: clean5 });
    //     console.log('+++end buy via ETH and WETH+++')

    //     console.log(`\n`)
    //     console.log('--calling burn ---')
    //     await expectRevert(this.ramWETHPair.burn(minter, { from: minter }), "UniswapV2: TRANSFER_FAILED")
    //     console.log('--end calling burn--')

    //     console.log(`\n`)
    //     console.log('++adding liqiudity manually start +++')
    //     await this.weth.transfer(this.ramWETHPair.address, '100000', { from: minter });
    //     await this.ram.transfer(this.ramWETHPair.address, '100000', { from: minter });
    //     await this.ramWETHPair.mint(minter);
    //     console.log('++adding liqiudity end +++')

    //     console.log(`\n`)
    //     console.log('++adding liqiudity via ETH  start +++')
    //     await this.router.addLiquidityETH(this.ram.address, '90000', '1', '1', alice, 15999743005, { from: minter, value: 4543534 });
    //     console.log('+++adding liqiudity end +++')

    //     console.log(`\n`)
    //     console.log("--start remove liquidity ETH---");
    //     await expectRevert(this.router.removeLiquidityETH(this.ram.address, '200', '1', '1', minter, 15999743005, { from: minter }), 'UniswapV2: TRANSFER_FAILED')
    //     console.log("--end remove liquidity ETH---");

    //     console.log(`\n`)
    //     console.log('--calling burn ---')
    //     await expectRevert(this.ramWETHPair.burn(minter, { from: minter }), "UniswapV2: TRANSFER_FAILED")
    //     console.log('--end calling burn--')


    //     console.log(`\n`)
    //     console.log('--start token SELL ---')
    //     await this.router.swapExactTokensForETHSupportingFeeOnTransferTokens('1100000', '1000', [this.ram.address, await this.router.WETH()], clean5, 15999743005, { from: clean5 });
    //     console.log('--end token SELL--')
    //     console.log(`\n`)
    //     console.log("++start buy swap for WETH+++");
    //     await this.router.swapExactTokensForTokensSupportingFeeOnTransferTokens('10000', '0', [await this.router.WETH(), this.ram.address], clean5, 15999743005, { from: clean5 });
    //     console.log("++end buy swap for WETH+++");

    //     console.log(`\n`)
    //     console.log('--calling burn ---')
    //     await expectRevert(this.ramWETHPair.burn(minter, { from: minter }), "UniswapV2: TRANSFER_FAILED");
    //     console.log('--end calling burn--')


    //     assert.notEqual((await this.weth.balanceOf(clean5)).valueOf().toString(), '0')


    //     console.log(`\n`)
    //     console.log("--start remove liquidity with support for fee transfer---");
    //     await expectRevert(this.router.removeLiquidityETHSupportingFeeOnTransferTokens(this.ram.address, '200', '1', '1', minter, 15999743005, { from: minter }), 'UniswapV2: TRANSFER_FAILED')
    //     console.log("--end remove liquidity with support for fee transfer---");


    //     console.log(`\n`)
    //     console.log('--sell start---')
    //     await this.router.swapExactTokensForTokensSupportingFeeOnTransferTokens('1000', '0', [this.ram.address, await this.router.WETH()], clean5, 15999743005, { from: clean5 });
    //     console.log('--sell end---')


    //     console.log(`\n`)
    //     console.log("--start remove liquidity ETH---");
    //     await expectRevert(this.router.removeLiquidityETH(this.ram.address, '200', '1', '1', minter, 15999743005, { from: minter }), 'UniswapV2: TRANSFER_FAILED')
    //     console.log("--end remove liquidity ETH---");


    //     console.log(`\n`)
    //     console.log('+++adding liqiudity via ETH  start +++')
    //     await this.router.addLiquidityETH(this.ram.address, '90000', '1', '1', alice, 15999743005, { from: minter, value: 4543534 });
    //     console.log('+++adding liqiudity end +++');



    //     console.log(`\n`)
    //     console.log('++adding liqiudity manually start +++')
    //     await this.weth.transfer(this.ramWETHPair.address, '100000', { from: minter });
    //     await this.ram.transfer(this.ramWETHPair.address, '100000', { from: minter });
    //     await this.ramWETHPair.mint(minter);
    //     console.log('+++adding liqiudity end +++')
    //     console.log(`\n`)
    //     console.log('--start token SELL ---')
    //     console.log("selling from ", clean5)
    //     await this.router.swapExactTokensForETHSupportingFeeOnTransferTokens('110', '1', [this.ram.address, await this.router.WETH()], clean5, 15999743005, { from: clean5 });
    //     console.log('--end token sell')
    //     console.log(`\n`)
    //     console.log("++start buy swap for WETH+++");
    //     await this.router.swapExactTokensForTokensSupportingFeeOnTransferTokens('10000', '0', [await this.router.WETH(), this.ram.address], clean5, 15999743005, { from: clean5 });
    //     console.log("++end buy swap for WETH+++");

    //     console.log(`\n`)
    //     console.log("++start buy swap for WETH+++");
    //     await this.router.swapExactETHForTokensSupportingFeeOnTransferTokens('1000', [await this.router.WETH(), this.ram.address], clean5, 15999743005, { from: alice, value: '34324233' });
    //     console.log("++end buy swap for WETH+++");

    //     console.log(`\n`)
    //     console.log('++adding liqiudity via ETH  start +++')
    //     await this.router.addLiquidityETH(this.ram.address, '90000', '1', '1', alice, 15999743005, { from: minter, value: 4543534 });
    //     console.log('+++adding liqiudity end +++')
    //     console.log(`\n`)
    //     console.log('--start token SELL ---')
    //     console.log("selling from ", clean5)
    //     await this.router.swapExactTokensForETHSupportingFeeOnTransferTokens('110', '1', [this.ram.address, await this.router.WETH()], clean5, 15999743005, { from: clean5 });
    //     console.log('--end token sell')
    //     console.log(`\n`)
    //     console.log("++start buy swap for WETH+++");
    //     await this.router.swapExactTokensForTokensSupportingFeeOnTransferTokens('10000', '0', [await this.router.WETH(), this.ram.address], clean5, 15999743005, { from: clean5 });
    //     console.log("++end buy swap for WETH+++");

    //     console.log(`\n`)
    //     console.log("--start remove liquidity ETH---");
    //     await expectRevert(this.router.removeLiquidityETH(this.ram.address, '200', '1', '1', minter, 15999743005, { from: minter }), 'UniswapV2: TRANSFER_FAILED')
    //     console.log("--end remove liquidity ETH---");

    //     console.log(`\n`)
    //     console.log('+++adding liqiudity manually start +++')
    //     await this.weth.transfer(this.ramWETHPair.address, '100000', { from: minter });
    //     await this.ram.transfer(this.ramWETHPair.address, '100000', { from: minter });
    //     await this.ramWETHPair.mint(minter);
    //     console.log('+++adding liqiudity end +++')


    //     console.log(`\n`)
    //     console.log('--calling burn ---')
    //     await expectRevert(this.ramWETHPair.burn(minter, { from: minter }), "UniswapV2: TRANSFER_FAILED")
    //     console.log('--end calling burn--')

    //     console.log(`\n`)
    //     console.log('+++ adding liqiudity via ETH  start +++')
    //     await this.router.addLiquidityETH(this.ram.address, '109000000', '10000000999000', '100000099', alice, 15999743005, { from: minter, value: 10000000000000000000 });
    //     console.log('+++adding liqiudity end +++')
    //     console.log(`\n`)
    //     console.log("--start remove liquidity with support for fee transfer---");
    //     // await expectRevert(this.router.removeLiquidityETHSupportingFeeOnTransferTokens(this.ram.address, '1', '1', '1', minter, 15999743005, { from: minter }), 'UniswapV2: TRANSFER_FAILED')
    //     console.log("--end remove liquidity with support for fee transfer---");

    //     console.log("++start buy swap for ETHr+++");
    //     await this.router.swapExactETHForTokensSupportingFeeOnTransferTokens('1000', [await this.router.WETH(), this.ram.address], clean5, 15999743005, { from: alice, value: '34324233' });
    //     console.log("+++end buy swap for ETH+++");
    //     console.log("++start buy swap for ETHr+++");
    //     await this.router.swapExactETHForTokensSupportingFeeOnTransferTokens('1000', [await this.router.WETH(), this.ram.address], clean5, 15999743005, { from: alice, value: '34324233' });
    //     console.log("+++end buy swap for ETH+++");

    //     console.log(`\n`)
    //     console.log('--start token SELL ---')
    //     console.log("selling from ", clean5)
    //     await this.router.swapExactTokensForETHSupportingFeeOnTransferTokens('110', '1', [this.ram.address, await this.router.WETH()], clean5, 15999743005, { from: clean5 });
    //     console.log('--end token sell')
    //     console.log(`\n`)
    //     console.log('--start token SELL ---')
    //     console.log("selling from ", clean5)
    //     console.log("selling from ", (await this.ram.balanceOf(clean5)).valueOf().toString())
    //     await this.ram.approve(this.ramWETHPair.address, '999999999999', { from: clean5 })
    //     await this.router.swapExactTokensForETHSupportingFeeOnTransferTokens('100000000', '100000', [this.ram.address, await this.router.WETH()], clean5, 15999743005, { from: clean5 });
    //     console.log('--end token sell')



    //     console.log(`\n`)
    //     console.log("--start remove liquidity with support for fee transfer---");
    //     await expectRevert(this.router.removeLiquidityETHSupportingFeeOnTransferTokens(this.ram.address, '200', '1', '1', minter, 15999743005, { from: minter }), 'UniswapV2: TRANSFER_FAILED')
    //     console.log("--end remove liquidity with support for fee transfer---");

    //     console.log(`\n`)
    //     console.log("++start buy swap for ETHr+++");
    //     await this.router.swapExactETHForTokensSupportingFeeOnTransferTokens('1000', [await this.router.WETH(), this.ram.address], clean5, 15999743005, { from: alice, value: '34324233' });
    //     console.log("+++end buy swap for ETH+++");
    //     console.log(`\n`)
    //     console.log("++start buy swap for ETHr+++");
    //     await this.router.swapExactETHForTokensSupportingFeeOnTransferTokens('1000', [await this.router.WETH(), this.ram.address], clean5, 15999743005, { from: alice, value: '34324233' });
    //     console.log("+++end buy swap for ETH+++");
    //     console.log(`\n`)
    //     console.log("++start buy swap for ETHr+++");
    //     await this.router.swapExactETHForTokensSupportingFeeOnTransferTokens('1000', [await this.router.WETH(), this.ram.address], clean5, 15999743005, { from: alice, value: '34324233' });
    //     console.log("+++end buy swap for ETH+++");

    //     console.log(`\n`)
    //     console.log("--start remove liquidity with support for fee transfer---");
    //     await expectRevert(this.router.removeLiquidityETHSupportingFeeOnTransferTokens(this.ram.address, '200', '1', '1', minter, 15999743005, { from: minter }), 'UniswapV2: TRANSFER_FAILED')
    //     console.log("--end remove liquidity with support for fee transfer---");
    //     console.log(`\n`)
    //     console.log("--start remove liquidity with support for fee transfer---");
    //     await expectRevert(this.router.removeLiquidityETHSupportingFeeOnTransferTokens(this.ram.address, '100', '1', '1', dev, 15999743005, { from: minter }), 'UniswapV2: TRANSFER_FAILED')
    //     console.log("--end remove liquidity with support for fee transfer---");
    // });


});
