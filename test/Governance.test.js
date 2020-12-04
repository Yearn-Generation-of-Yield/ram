const timeMachine = require('ganache-time-traveler');
const truffleAssert = require("truffle-assertions");
const assert = require("chai").assert;
const { initializeEnvironment } = require('../test-helpers');

contract("Governance", accounts => {
    let testAccount = accounts[0];
    let setterAccount = accounts[1];
    let testAccount2 = accounts[2];

    beforeEach(async () => {
        await initializeEnvironment(this, accounts);
    });

    it("should be able to set number selection", async () => {
        const initialWeightedNumber = Number(await this.governance.weightedNumber.call());
        assert.isTrue(initialWeightedNumber == 1);

        await this.governance.setUserNumber(5, { from: testAccount });

        // User number should increase
        const userAfter = await this.governance.users.call(testAccount);
        assert.isTrue(userAfter.number == 5);

        // User had no stake, global weighted number shouldn't change
        const afterWeightedNumber = Number(await this.governance.weightedNumber.call());
        assert.isTrue(afterWeightedNumber == 1);
    });

    it("should be able to timelock YGY tokens", async () => {
        await this.YGYToken.transfer(testAccount, 2e18.toString(), { from: setterAccount });

        // Check initial values
        const userFirst = await this.governance.users.call(testAccount);
        assert.isTrue(userFirst.timelockedYGY == 0);
        const votingSharesFirst = await this.governance.votingShares.call();
        assert.isTrue(votingSharesFirst == 0e18);
        const weightedNumberFirst = Number(await this.governance.weightedNumber.call());
        assert.isTrue(weightedNumberFirst == 1);

        await this.YGYToken.approve(this.governance.address, 2e18.toString(), { from: testAccount });
        truffleAssert.passes(
            await this.governance.timelockYGY(1e18.toString(), 2, 5, { from: testAccount })
        );

        // Level 2 applies a 3x multiplier for a lockup duration of one month
        const afterUser = await this.governance.users.call(testAccount);
        assert.isTrue(afterUser.timelockedYGY == 3e18);
        const afterTotalYGY = await this.governance.votingShares.call();
        assert.isTrue(afterTotalYGY == 3e18);
        const afterWeightedNumber = Number(await this.governance.weightedNumber.call());
        assert.isTrue(afterWeightedNumber == 5);
    });

    it("should weight timelocked votes correctly", async () => {
        await this.YGYToken.transfer(testAccount, 2e18.toString(), { from: setterAccount });
        await this.YGYToken.approve(this.governance.address, 2e18.toString(), { from: testAccount });
        await this.YGYToken.transfer(testAccount2, 2e18.toString(), { from: setterAccount });
        await this.YGYToken.approve(this.governance.address, 2e18.toString(), { from: testAccount2 });

        const beforeTotalYGY = await this.governance.votingShares.call();
        assert.isTrue(beforeTotalYGY == 0);

        truffleAssert.passes(
            await this.governance.timelockYGY(1e18.toString(), 2, 2, { from: testAccount })
        );

        // Level 3 applies a 300% multipliers
        const afterTotalYGY = await this.governance.votingShares.call();
        assert.isTrue(afterTotalYGY == (1e18*3).toString());
        const firstWeightedNumber = await this.governance.weightedNumber.call();
        assert.isTrue(firstWeightedNumber == 2);

        truffleAssert.passes(
            await this.governance.timelockYGY(1e18.toString(), 3, 8, { from: testAccount2 })
        );

        // (1*10)+(1*3) = 13
        const secondTotalYGY = await this.governance.votingShares.call();
        assert.isTrue(secondTotalYGY == 13e18);

        // (3*2)+(10*8)/13 = (6+80)/13 = 86/13 = 6.61538 -> rounds down to 6
        const secondWeightedNumber = await this.governance.weightedNumber.call();
        assert.isTrue(secondWeightedNumber == 6);
    });

    it("should be able to retrieve timelocked YGY tokens", async () => {
        await this.YGYToken.transfer(testAccount, 2e18.toString(), { from: setterAccount });

        await this.YGYToken.approve(this.governance.address, 2e18.toString(), { from: testAccount });
        truffleAssert.passes(
            await this.governance.timelockYGY(1e18.toString(), 2, 8, { from: testAccount })
        );

        // Level 2 applies a 3x multiplier for a lockup duration of one month
        const userFirst = await this.governance.users.call(testAccount);
        assert.isTrue(userFirst.timelockedYGY == 3e18);

        const votingSharesFirst = await this.governance.votingShares.call();
        assert.isTrue(votingSharesFirst == 3e18);

        // Advance time forward more than a month
        const oneMonthInSeconds = 2419200;
        const moreThanOneMonth = oneMonthInSeconds + 10000;
        await timeMachine.advanceTimeAndBlock(moreThanOneMonth);

        truffleAssert.passes(
            await this.governance.unlockOldestTimelock(2, { from: testAccount })
        );

        const userSecond = await this.governance.users.call(testAccount);
        assert.isTrue(userSecond.timelockedYGY == 0e18);

        const votingSharesSecond = await this.governance.votingShares.call();
        assert.isTrue(votingSharesSecond == 0e18);
    });

});
