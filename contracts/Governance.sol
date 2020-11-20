pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol";
import "./IRAMv1Router.sol";

contract Governance {

    using SafeMath for uint256;

    IERC20 public YGYToken;
    IRAMv1Router public RAMRouter;

    uint256 weightedNumber; // Number 1-8 weighted by total user numbers
    uint256 totalYGY; // Includes liquid and timelocked YGY

    uint256 lastRAMRouterUpdateTime; // Last time the regenerator tax on the router was updated
    bool updateStagingMode;
    uint256 updateStagingReadyTime;

    struct User {
        uint256 number; // Number from 1-8 indicating the desired LGE regenerator tax %
        uint256 liquidYGY;
        uint256 timelockedYGY;
        // timelocks is a stack data structure implemented using a hashmap
        mapping(uint256 => TimeLock) timelocks;
        uint256 timelockTop;
        uint256 timelockLifetimeCount;
    }

    struct TimeLock {
        uint256 multipliedAmount;
        uint256 level;
        uint256 unlockTime;
    }

    mapping(address => User) public users;

    constructor(address _YGYToken, address _RAMRouter) public {
        YGYToken = IERC20(_YGYToken);
        RAMRouter = IRAMv1Router(_RAMRouter);
        weightedNumber = 1; // start at 1%
    }

    function setUserNumber(uint256 _number) public {
        User storage user = users[msg.sender];
        user.number = _number;

       calcWeightedNumber(msg.sender);
    }

    function enterRegeneratorUpdateStagingMode() public {
        // 1 day mandatory wait time after last router regenerator tax update
        require(block.timestamp >= lastRAMRouterUpdateTime.add(1 days), "Must wait 1 day since last update");
        updateStagingMode = true;
        updateStagingReadyTime = block.timestamp.add(10 minutes);
    }

    function updateRAMRouterRegeneratorTax() public {
        require(updateStagingMode, "Must be in update staging mode");
        require(block.timestamp >= updateStagingReadyTime, "Must wait 10 minutes since update staged");
        updateStagingMode = false;
        lastRAMRouterUpdateTime = block.timestamp;

        // Update the RAM router's regenerator tax
        RAMRouter.setRegeneratorTax(weightedNumber);
    }

    // users can deposit their YGY
    function depositLiquidYGY(uint256 _amount) public {
        require(YGYToken.transferFrom(msg.sender, address(this), _amount), "Have tokens been approved?");

        User storage user = users[msg.sender];
        user.liquidYGY.add(_amount);
        totalYGY.add(_amount);

        calcWeightedNumber(msg.sender);
    }

    // Users can withdraw their YGY
    function withdrawLiquidYGY(uint256 _amount) public {
        User storage user = users[msg.sender];
        require(user.liquidYGY >= _amount, "Staked amount doesn't support withdrawal");
        require(YGYToken.transfer(msg.sender, _amount), "Transfer failed");

        user.liquidYGY.sub(_amount);
        totalYGY.sub(_amount);

        calcWeightedNumber(msg.sender);
    }

    // users can lock YGY for time durations to get multipliers on their YGY
    function timelockYGY(uint256 _amount, uint256 _level) public {
        User storage user = users[msg.sender];
        require(user.liquidYGY >= _amount, "Must deposit tokens before lock");

        // Decrement user's liquid YGY and total YGY by the amount
        user.liquidYGY = user.liquidYGY.sub(_amount);
        totalYGY = totalYGY.sub(_amount);

        // Calculate effective voting power and create new timelock
        uint256 effectiveAmount =  _amount.mul(getMultiplierForLevel(_level));
        TimeLock memory timelock = TimeLock({
            multipliedAmount: effectiveAmount,
            level: _level,
            unlockTime: block.timestamp.add(getDurationForLevel(_level))
        });

        // Increment index total count, add to user's timelocks, and update stack of timelocks
        uint256 newTimelockLifetimeCount = user.timelockLifetimeCount.add(1);
        user.timelocks[newTimelockLifetimeCount] = timelock;
        user.timelockLifetimeCount = newTimelockLifetimeCount;

        // Add the new voting power to user and the total voting power
        user.timelockedYGY = user.timelockedYGY.add(effectiveAmount);
        totalYGY = totalYGY.add(effectiveAmount);

        calcWeightedNumber(msg.sender);
    }

    // User unlocks their oldest timelock, receiving all the YGY tokens directly to their address
    function unlockOldestTimelock() public {
        User storage user = users[msg.sender];
        TimeLock storage timelock = user.timelocks[user.timelockTop];
        require(block.timestamp >= timelock.unlockTime, "Tokens are still timelocked");

        // Update user's timelocked balances and user's liquid balances
        user.timelockedYGY = user.timelockedYGY.sub(timelock.multipliedAmount);
        uint256 underlyingAmount = timelock.multipliedAmount.div(getMultiplierForLevel(timelock.level));
        user.liquidYGY = user.liquidYGY.add(underlyingAmount);

        // Update total YGY balances
        totalYGY.sub(timelock.multipliedAmount).add(underlyingAmount);

        // Delete the timelock and update user's timelock stack
        delete user.timelocks[user.timelockTop];
        user.timelockTop = user.timelockTop.add(1);

        calcWeightedNumber(msg.sender);
    }

    function calcWeightedNumber(address addr) internal {
        User storage user = users[addr];

        // Calculate the sum of all weights
        uint256 userTotalYGY = user.liquidYGY.add(user.timelockedYGY);
        uint256 otherTotalYGY = totalYGY.sub(userTotalYGY);

        // Calculate the sum of all weighing factors
        uint256 userWeighingFactor = userTotalYGY.mul(user.number);
        uint256 otherWeighingFactor = otherTotalYGY.mul(weightedNumber);
        uint256 sumOfWeighingFactors = userWeighingFactor.add(otherWeighingFactor);

        // Weighted average = (sum weighing factors / sum of weight)
        weightedNumber = sumOfWeighingFactors.div(totalYGY);
    }

    function getDurationForLevel(uint256 _level) public pure returns (uint256) {
        if (_level == 1) {
            return 2 weeks;
        } else if (_level == 2) {
            return 4 weeks;
        } else if (_level == 3) {
            return 12 weeks;
        } else if (_level == 4) {
            return 24 weeks;
        }
        return 0;
    }

    function getMultiplierForLevel(uint256 _level) public pure returns (uint256) {
        if (_level == 1) {
            return 150; // 1.5x
        } else if (_level == 2) {
            return 300; // 3x
        } else if (_level == 3) {
            return 1000; // 10x
        } else if (_level == 4) {
            return 2500; // 25x
        }
        return 0;
    }
}
