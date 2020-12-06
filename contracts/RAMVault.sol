// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

// import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol";
// import "@openzeppelin/contracts-ethereum-package/contracts/utils/EnumerableSet.sol";
// import "@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol";
// import "@openzeppelin/contracts-ethereum-package/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";

import "./YGYStorageV1.sol";
import "./libraries/YGYHelper.sol";
import "./libraries/PoolHelper.sol";
import "./libraries/UserHelper.sol";
import "hardhat/console.sol";

// Ram Vault distributes fees equally amongst staked pools
contract RAMVault is OwnableUpgradeSafe, YGYStorageV1 {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using UserHelper for UserInfo;
    using PoolHelper for PoolInfo;

    address public devaddr;
    address storageAddr;
    YGYStorageV1 _storage;

    event RewardPaid(uint256 pid, address to);
    event Deposit(address indexed user, uint256 indexed pid, uint256 amount);
    event Withdraw(address indexed user, uint256 indexed pid, uint256 amount);
    event EmergencyWithdraw(
        address indexed user,
        uint256 indexed pid,
        uint256 amount
    );
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 _pid,
        uint256 value
    );
    event Boost(
        address indexed user,
        uint256 indexed pid,
        uint256 indexed level
    );

    function initialize(address _storageAddr, address superAdmin)
        public
        initializer
    {
        OwnableUpgradeSafe.__Ownable_init();
        DEV_FEE = 724;
        _storage = YGYStorageV1(_storageAddr);
        storageAddr = _storageAddr;
        _superAdmin = superAdmin;
    }

    // --------------------------------------------
    //                  EPOCH
    // --------------------------------------------

    // Starts a new calculation epoch
    // Because averge since start will not be accurate
    function startNewEpoch() public {
        require(epochCalculationStartBlock + 50000 < block.number);

        epochRewards[epoch] = rewardsInThisEpoch;
        cumulativeRewardsSinceStart = cumulativeRewardsSinceStart.add(
            rewardsInThisEpoch
        );

        rewardsInThisEpoch = 0;

        epochCalculationStartBlock = block.number;
        ++epoch;
    }

    // --------------------------------------------
    //                OWNER
    // --------------------------------------------

    // Adds additional RAM rewards
    function addRAMRewardsOwner(uint256 _amount) public onlyOwner {
        require(ram.transferFrom(msg.sender, address(this), _amount));
        if (_amount > 0) {
            pendingRewards = pendingRewards.add(_amount);
            rewardsInThisEpoch = rewardsInThisEpoch.add(_amount);
        }
    }

    // Adds additional YGY rewards
    function addYGYRewardsOwner(uint256 _amount) public onlyOwner {
        require(ygy.transferFrom(msg.sender, address(this), _amount));
        if (_amount > 0) {
            YGYReserve = YGYReserve.add(_amount);
        }
    }

    // --------------------------------------------
    //                  POOL
    // --------------------------------------------

    // Add a new token pool. Can only be called by the owner.
    // Note contract owner is meant to be a governance contract allowing RAM governance consensus
    function add(
        uint256 _allocPoint,
        IERC20 _token,
        bool _withdrawable
    ) public onlyOwner {
        massUpdatePools();

        for (uint256 pid = 0; pid < poolInfo.length; ++pid) {
            require(poolInfo[pid].token != _token, "Error pool already added");
        }

        totalAllocPoint = totalAllocPoint.add(_allocPoint);

        poolInfo.push(
            PoolInfo({
                token: _token,
                allocPoint: _allocPoint,
                accRAMPerShare: 0,
                accYGYPerShare: 0,
                withdrawable: _withdrawable,
                effectiveAdditionalTokensFromBoosts: 0
            })
        );
    }

    // Update the given pool's RAMs allocation point. Can only be called by the owner.
    // Note contract owner is meant to be a governance contract allowing RAM governance consensus
    function set(
        uint256 _pid,
        uint256 _allocPoint,
        bool _withdrawable
    ) public onlyOwner {
        massUpdatePools();
        totalAllocPoint = totalAllocPoint.sub(poolInfo[_pid].allocPoint).add(
            _allocPoint
        );
        poolInfo[_pid].allocPoint = _allocPoint;
        poolInfo[_pid].withdrawable = _withdrawable;
    }

    // Update reward vairables for all pools. Be careful of gas spending!
    function massUpdatePools() public {
        uint256 allRewards;
        uint256 allYGYRewards;
        for (uint256 pid = 0; pid < poolInfo.length; ++pid) {
            (uint256 ramWholeReward, uint256 ygyWholeReward) = updatePool(pid);
            allRewards = allRewards.add(ramWholeReward);
            allYGYRewards = allYGYRewards.add(ygyWholeReward);
        }

        pendingRewards = pendingRewards.sub(allRewards);
        pendingYGYRewards = pendingYGYRewards.sub(allYGYRewards);
    }

    // Function that adds pending rewards, called by the RAM token.
    function addPendingRewards(uint256 _amount) external {
        require(msg.sender == address(ram));
        pendingRewards = pendingRewards.add(_amount);
        rewardsInThisEpoch = rewardsInThisEpoch.add(_amount);

        if (YGYReserve > _amount) {
            pendingYGYRewards = pendingYGYRewards.add(_amount);
            YGYReserve = YGYReserve.sub(_amount);
        } else if (YGYReserve > 0) {
            pendingYGYRewards = pendingYGYRewards.add(YGYReserve);
            YGYReserve = 0;
        }
    }

    // Update reward variables of the given pool to be up-to-date.
    function updatePool(uint256 _pid)
        internal
        returns (uint256 _ramRewardWhole, uint256 _ygyRewardWhole)
    {
        PoolInfo storage pool = poolInfo[_pid];
        // avoids division by 0 errors
        if (pool.token.balanceOf(address(this)) == 0) {
            return (0, 0);
        }

        // Get whole rewards for tokens
        (uint256 ramRewardWhole, uint256 ygyRewardWhole) = pool.getWholeRewards(
            _storage
        );

        uint256 ramRewardFee = ramRewardWhole.mul(DEV_FEE).div(10000);
        uint256 ygyRewardFee = ygyRewardWhole.mul(DEV_FEE).div(10000);

        // Add dev shares
        pending_DEV_rewards = pending_DEV_rewards.add(ramRewardFee);
        pending_DEV_YGY_rewards = pending_DEV_YGY_rewards.add(ygyRewardFee);

        // Calculate RAMPerShare, accYGYPerShare using effective pool staked supply (not just total supply)
        pool.updateShares(ygyRewardFee, ramRewardFee, _storage);
    }

    // Deposit tokens to RamVault for RAM allocation.
    function deposit(uint256 _pid, uint256 _amount) public {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];

        // Pay the user
        updateAndPayOutPending(_pid, msg.sender);

        // save gas
        if (_amount > 0) {
            pool.token.transferFrom(
                address(msg.sender),
                address(this),
                _amount
            );
            user.amount = user.amount.add(_amount);

            // Users that have bought multipliers will have an extra balance added to their stake according to the boost multiplier.
            if (user.boostLevel > 0) {
                user.adjustEffectiveStake(pool, 0, false, _storage);
            }
        }

        user.updateDebts(pool);
        emit Deposit(msg.sender, _pid, _amount);
    }

    function claimRewards(uint256 _pid) external {
        updateAndPayOutPending(_pid, msg.sender);
        emit RewardPaid(_pid, msg.sender);
    }

    // Test coverage
    // [x] Does user get the deposited amounts?
    // [x] Does user that its deposited for update correcty?
    // [x] Does the depositor get their tokens decreased
    function depositFor(
        address _depositFor,
        uint256 _pid,
        uint256 _amount
    ) public {
        // requires no allowances
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][_depositFor];

        // Pay the user
        updateAndPayOutPending(_pid, _depositFor); // Update the balances of person that amount is being deposited for

        if (_amount > 0) {
            pool.token.transferFrom(msg.sender, address(this), _amount);
            user.amount = user.amount.add(_amount); // This is depositedFor address

            // Users that have bought multipliers will have an extra balance added to their stake according to the boost multiplier.
            if (user.boostLevel > 0) {
                user.adjustEffectiveStake(pool, 0, false, _storage);
            }
        }

        user.updateDebts(pool);
        emit Deposit(_depositFor, _pid, _amount);
    }

    // Test coverage
    // [x] Does allowance update correctly?
    function setAllowanceForPoolToken(
        address spender,
        uint256 _pid,
        uint256 value
    ) public {
        PoolInfo storage pool = poolInfo[_pid];
        pool.allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, _pid, value);
    }

    // Test coverage
    // [x] Does allowance decrease?
    // [x] Do oyu need allowance
    // [x] Withdraws to correct address
    function withdrawFrom(
        address owner,
        uint256 _pid,
        uint256 _amount
    ) public {
        PoolInfo storage pool = poolInfo[_pid];
        require(pool.allowance[owner][msg.sender] >= _amount, "No allowance");
        pool.allowance[owner][msg.sender] = pool.allowance[owner][msg.sender]
            .sub(_amount);
        _withdraw(_pid, _amount, owner, msg.sender);
    }

    // Withdraw  tokens from RamVault.
    function withdraw(uint256 _pid, uint256 _amount) public {
        _withdraw(_pid, _amount, msg.sender, msg.sender);
    }

    // Low level withdraw function
    function _withdraw(
        uint256 _pid,
        uint256 _amount,
        address from,
        address to
    ) internal {
        PoolInfo storage pool = poolInfo[_pid];
        require(pool.withdrawable);
        UserInfo storage user = userInfo[_pid][from];
        require(user.amount >= _amount);

        updateAndPayOutPending(_pid, from); // Update balances of from this is not withdrawal but claiming RAM farmed

        if (_amount > 0) {
            user.amount = user.amount.sub(_amount);
            pool.token.safeTransfer(address(to), _amount);

            // Users who have bought multipliers will have their accounting balances readjusted.
            if (user.boostLevel > 0) {
                user.adjustEffectiveStake(pool, 0, true, _storage);
            }
        }

        user.updateDebts(pool);
        emit Withdraw(to, _pid, _amount);
    }

    function updateAndPayOutPending(uint256 _pid, address _from) internal {
        massUpdatePools();
        (uint256 pendingRAM, uint256 pendingYGY) = _storage.checkRewards(
            _pid,
            _from
        );
        if (pendingRAM > 0) {
            safeRamTransfer(_from, pendingRAM);
        }
        if (pendingYGY > 0) {
            safeYgyTransfer(_from, pendingYGY);
        }
    }

    // Withdraw without caring about rewards. EMERGENCY ONLY.
    // !Caution this will remove all your pending rewards!
    function emergencyWithdraw(uint256 _pid) public {
        PoolInfo storage pool = poolInfo[_pid];
        require(pool.withdrawable);
        UserInfo storage user = userInfo[_pid][msg.sender];
        pool.token.safeTransfer(address(msg.sender), user.amount);
        emit EmergencyWithdraw(msg.sender, _pid, user.amount);
        user.amount = 0;
        user.boostAmount = 0;
        user.rewardDebt = 0;
        user.rewardDebtYGY = 0;
        // No mass update dont update pending rewards
    }

    // --------------------------------------------
    //                  BOOST
    // --------------------------------------------

    // Purchase a multiplier level for an individual user for an individual pool, same level cannot be purchased twice.
    function purchase(uint256 _pid, uint256 _level) external {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];

        require(_level > user.boostLevel && _level <= 4);

        // Cost will be reduced by the amount already spent on multipliers.
        uint256 cost = _storage.getBoostLevelCost(_level);
        uint256 finalCost = cost.sub(user.spentMultiplierTokens);

        // Transfer RAM tokens to the contract
        require(ram.transferFrom(msg.sender, address(this), finalCost));

        // Update balances and level
        user.spentMultiplierTokens = user.spentMultiplierTokens.add(finalCost);
        user.boostLevel = _level;

        // If user has staked balances, then set their new accounting balance
        if (user.amount > 0) {
            // Get the new multiplier
            user.adjustEffectiveStake(pool, _level, false, _storage);
        }

        boostFees = boostFees.add(finalCost);
        emit Boost(msg.sender, _pid, _level);
    }

    // Distributes boost fees to devs and protocol
    function distributeFees() public {
        // Reset taxes to 0 before distributing any funds
        uint256 totalBoostDistAmt = boostFees;
        boostFees = 0;

        // Distribute taxes to regenerator and team 50/50%
        uint256 halfDistAmt = totalBoostDistAmt.div(2);
        if (halfDistAmt > 0) {
            // 50% to regenerator
            require(ram.transfer(regeneratoraddr, halfDistAmt));
            // 70% of the other 50% to devs
            uint256 devDistAmt = halfDistAmt.mul(70).div(100);
            if (devDistAmt > 0) {
                require(ram.transfer(devaddr, devDistAmt));
            }
            // 30% of the other 50% to team
            uint256 teamDistAmt = halfDistAmt.mul(30).div(100);
            if (teamDistAmt > 0) {
                require(ram.transfer(teamaddr, teamDistAmt));
            }
        }
    }

    // --------------------------------------------
    //                  Utils
    // --------------------------------------------

    // Sets the dev fee for this contract
    // defaults at 7.24%
    // Note contract owner is meant to be a governance contract allowing RAM governance consensus
    uint16 DEV_FEE;

    function setDevFee(uint16 _DEV_FEE) public onlyOwner {
        require(_DEV_FEE <= 1000, "Max 10%");
        DEV_FEE = _DEV_FEE;
    }

    uint256 pending_DEV_rewards;
    uint256 pending_DEV_YGY_rewards;

    // function that lets owner/governance contract
    // approve allowance for any token inside this contract
    // This means all future UNI like airdrops are covered
    // And at the same time allows us to give allowance to strategy contracts.
    // Upcoming cYFI etc vaults strategy contracts will  se this function to manage and farm yield on value locked
    function setStrategyContractOrDistributionContractAllowance(
        address tokenAddress,
        uint256 _amount,
        address contractAddress
    ) external {
        require(isContract(contractAddress) && _superAdmin == _msgSender());
        require(block.number > RAMVaultStartBlock.add(95_000), "Gov not ready");
        IERC20(tokenAddress).approve(contractAddress, _amount);
    }

    function isContract(address addr) internal view returns (bool) {
        uint256 size;
        assembly {
            size := extcodesize(addr)
        }
        return size > 0;
    }

    function safeRamTransfer(address _to, uint256 _amount) internal {
        uint256 ramBal = ram.balanceOf(address(this));

        if (_amount > ramBal) {
            ram.transfer(_to, ramBal);
        } else {
            ram.transfer(_to, _amount);
        }
        ramBalance = ram.balanceOf(address(this));
        transferRAMDevFee();
    }

    function safeYgyTransfer(address _to, uint256 _amount) internal {
        uint256 ygyBal = ygy.balanceOf(address(this));

        if (_amount > ygyBal) {
            ygy.transfer(_to, ygyBal);
        } else {
            ygy.transfer(_to, _amount);
        }
        YGYStorageV1.ygyBalance = ygy.balanceOf(address(this));
        transferYGYDevFee();
    }

    function transferRAMDevFee() public {
        if (pending_DEV_rewards > 0) {
            uint256 devDistAmt;
            uint256 teamDistAmt;
            uint256 ramBal = ram.balanceOf(address(this));
            if (pending_DEV_rewards > ramBal) {
                devDistAmt = ramBal.mul(70).div(100);
                teamDistAmt = ramBal.mul(30).div(100);
            } else {
                devDistAmt = pending_DEV_rewards.mul(70).div(100);
                teamDistAmt = pending_DEV_rewards.mul(30).div(100);
            }

            if (devDistAmt > 0) {
                ram.transfer(devaddr, devDistAmt);
            }
            if (teamDistAmt > 0) {
                ram.transfer(teamaddr, teamDistAmt);
            }

            YGYStorageV1.ramBalance = ram.balanceOf(address(this));
            pending_DEV_rewards = 0;
        }
    }

    function transferYGYDevFee() public {
        if (pending_DEV_YGY_rewards > 0) {
            uint256 devDistAmt;
            uint256 teamDistAmt;
            uint256 ygyBal = ygy.balanceOf(address(this));
            if (pending_DEV_YGY_rewards > ygyBal) {
                devDistAmt = ygyBal.mul(70).div(100);
                teamDistAmt = ygyBal.mul(30).div(100);
            } else {
                devDistAmt = pending_DEV_YGY_rewards.mul(70).div(100);
                teamDistAmt = pending_DEV_YGY_rewards.mul(30).div(100);
            }

            if (devDistAmt > 0) {
                ygy.transfer(devaddr, devDistAmt);
            }
            if (teamDistAmt > 0) {
                ygy.transfer(teamaddr, teamDistAmt);
            }

            YGYStorageV1.ygyBalance = ygy.balanceOf(address(this));
            pending_DEV_YGY_rewards = 0;
        }
    }

    function setDevFeeReciever(address _devaddr) external onlyOwner {
        devaddr = _devaddr;
    }

    address private _superAdmin;

    event SuperAdminTransfered(address previousOwner, address newOwner);

    function superAdmin() public view returns (address) {
        return _superAdmin;
    }

    function burnSuperAdmin() public virtual {
        require(_superAdmin == _msgSender());
        _superAdmin = address(0);
        emit SuperAdminTransfered(_superAdmin, address(0));
    }

    function newSuperAdmin(address newOwner) public virtual {
        require(_superAdmin == _msgSender());
        require(newOwner != address(0));
        _superAdmin = newOwner;
        emit SuperAdminTransfered(_superAdmin, newOwner);
    }
}
