// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/utils/EnumerableSet.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/access/Ownable.sol";
import "./INBUNIERC20.sol";
import "@nomiclabs/buidler/console.sol";

// Ram Vault distributes fees equally amongst staked pools
// Have fun reading it. Hopefully it's bug-free. God bless.
contract RAMVault is OwnableUpgradeSafe {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    // Info of each user.
    struct UserInfo {
        uint256 amount; // How many  tokens the user has provided.
        uint256 rewardDebt; // Reward debt. See explanation below.
        uint256 boostAmount;
        uint256 boostLevel;
        uint256 spentMultiplierTokens;
    }

    // At any point in time, the amount of RAMs entitled to a user but is pending to be distributed is:
    //
    //   pending reward = (user.amount+user.boostAmount * pool.accRAMPerShare) - user.rewardDebt
    //
    // Whenever a user deposits or withdraws  tokens to a pool. Here's what happens:
    //   1. The pool's `accRAMPerShare` (and `lastRewardBlock`) gets updated.
    //   2. User receives the pending reward sent to his/her address.
    //   3. User's `amount` gets updated.
    //   4, User's `boostAmount` gets updated.
    //   5. Pool's `effectiveAdditionalTokensFromBoosts` gets updated.
    //   4. User's `rewardDebt` gets updated.

    // Info of each pool.
    struct PoolInfo {
        IERC20 token; // Address of  token contract.
        uint256 allocPoint; // How many allocation points assigned to this pool. RAMs to distribute per block.
        uint256 accRAMPerShare; // Accumulated RAMs per share, times 1e12. See below.
        bool withdrawable; // Is this pool withdrawable?
        mapping(address => mapping(address => uint256)) allowance;
        uint256 effectiveAdditionalTokensFromBoosts; // Track the total additional accounting staked tokens from boosts.
    }

    // The RAM TOKEN!
    INBUNIERC20 public ram;
    // Dev address.
    address public devaddr;

    // Info of each pool.
    PoolInfo[] public poolInfo;
    // Info of each user that stakes  tokens.
    mapping(uint256 => mapping(address => UserInfo)) public userInfo;
    // Total allocation poitns. Must be the sum of all allocation points in all pools.
    uint256 public totalAllocPoint;

    // pending rewards awaiting anyone to massUpdate
    uint256 public pendingRewards;

    uint256 public contractStartBlock;
    uint256 public epochCalculationStartBlock;
    uint256 public cumulativeRewardsSinceStart;
    uint256 public rewardsInThisEpoch;
    uint public epoch;

    // Boosts
    address public regeneratoraddr;
    address public teamaddr;
    uint256 public boostFees;
    uint256 public boostLevelOneCost;
    uint256 public boostLevelTwoCost;
    uint256 public boostLevelThreeCost;
    uint256 public boostLevelFourCost;
    uint256 public boostLevelOneMultiplier;
    uint256 public boostLevelTwoMultiplier;
    uint256 public boostLevelThreeMultiplier;
    uint256 public boostLevelFourMultiplier;

    // Returns fees generated since start of this contract
    function averageFeesPerBlockSinceStart() external view returns (uint averagePerBlock) {
        averagePerBlock = cumulativeRewardsSinceStart.add(rewardsInThisEpoch).div(block.number.sub(contractStartBlock));
    }

    // Returns averge fees in this epoch
    function averageFeesPerBlockEpoch() external view returns (uint256 averagePerBlock) {
        averagePerBlock = rewardsInThisEpoch.div(block.number.sub(epochCalculationStartBlock));
    }

    // For easy graphing historical epoch rewards
    mapping(uint => uint256) public epochRewards;

    //Starts a new calculation epoch
    // Because averge since start will not be accurate
    function startNewEpoch() public {
        require(epochCalculationStartBlock + 50000 < block.number, "New epoch not ready yet"); // About a week
        epochRewards[epoch] = rewardsInThisEpoch;
        cumulativeRewardsSinceStart = cumulativeRewardsSinceStart.add(rewardsInThisEpoch);
        rewardsInThisEpoch = 0;
        epochCalculationStartBlock = block.number;
        ++epoch;
    }

    event Deposit(address indexed user, uint256 indexed pid, uint256 amount);
    event Withdraw(address indexed user, uint256 indexed pid, uint256 amount);
    event EmergencyWithdraw(
        address indexed user,
        uint256 indexed pid,
        uint256 amount
    );
    event Approval(address indexed owner, address indexed spender, uint256 _pid, uint256 value);
    event Boost(address indexed user, uint256 indexed pid, uint256 indexed level);

    function initialize(
        address _ram,
        address _devaddr,
        address _teamaddr,
        address _regeneratoraddr,
        address superAdmin
    ) public initializer {
        OwnableUpgradeSafe.__Ownable_init();
        DEV_FEE = 724;
        ram = INBUNIERC20(_ram);
        devaddr = _devaddr;
        teamaddr = _teamaddr;
        regeneratoraddr = _regeneratoraddr;
        contractStartBlock = block.number;
        _superAdmin = superAdmin;

        // Initial boost multipliers and costs
        boostLevelOneCost = 5 * 1e18;    // 5 RAM tokens
        boostLevelTwoCost = 15 * 1e18;   // 15 RAM tokens
        boostLevelThreeCost = 30 * 1e18; // 30 RAM tokens
        boostLevelFourCost = 60 * 1e18;  // 60 RAM tokens
        boostLevelOneMultiplier = 5;     // 5%
        boostLevelTwoMultiplier = 15;    // 15%
        boostLevelThreeMultiplier = 30;  // 30%
        boostLevelFourMultiplier = 60;   // 60%
    }

    // --------------------------------------------
    //                  Pools
    // --------------------------------------------

    function poolLength() external view returns (uint256) {
        return poolInfo.length;
    }

    // Add a new token pool. Can only be called by the owner.
    // Note contract owner is meant to be a governance contract allowing RAM governance consensus
    function add(
        uint256 _allocPoint,
        IERC20 _token,
        bool _withUpdate,
        bool _withdrawable
    ) public onlyOwner {
        if (_withUpdate) {
            massUpdatePools();
        }

        uint256 length = poolInfo.length;
        for (uint256 pid = 0; pid < length; ++pid) {
            require(poolInfo[pid].token != _token,"Error pool already added");
        }

        totalAllocPoint = totalAllocPoint.add(_allocPoint);

        poolInfo.push(
            PoolInfo({
                token: _token,
                allocPoint: _allocPoint,
                accRAMPerShare: 0,
                withdrawable : _withdrawable,
                effectiveAdditionalTokensFromBoosts: 0
            })
        );
    }

    // Update the given pool's RAMs allocation point. Can only be called by the owner.
        // Note contract owner is meant to be a governance contract allowing RAM governance consensus

    function set(
        uint256 _pid,
        uint256 _allocPoint,
        bool _withUpdate
    ) public onlyOwner {
        if (_withUpdate) {
            massUpdatePools();
        }

        totalAllocPoint = totalAllocPoint.sub(poolInfo[_pid].allocPoint).add(
            _allocPoint
        );
        poolInfo[_pid].allocPoint = _allocPoint;
    }

    // Update the given pool's ability to withdraw tokens
    // Note contract owner is meant to be a governance contract allowing RAM governance consensus
    function setPoolWithdrawable(
        uint256 _pid,
        bool _withdrawable
    ) public onlyOwner {
        poolInfo[_pid].withdrawable = _withdrawable;
    }

    // View function to see pending RAMs on frontend.
    function pendingRam(uint256 _pid, address _user)
        public
        view
        returns (uint256)
    {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][_user];
        uint256 accRAMPerShare = pool.accRAMPerShare;

        uint256 effectiveAmount = user.amount.add(user.boostAmount);
        return effectiveAmount.mul(accRAMPerShare).div(1e12).sub(user.rewardDebt);
    }

    // Update reward vairables for all pools. Be careful of gas spending!
    function massUpdatePools() public {
        console.log("Mass Updating Pools");
        uint256 length = poolInfo.length;
        uint allRewards;
        for (uint256 pid = 0; pid < length; ++pid) {
            allRewards = allRewards.add(updatePool(pid));
        }

        pendingRewards = pendingRewards.sub(allRewards);
    }

    // ----
    // Function that adds pending rewards, called by the RAM token.
    // ----
    uint256 private ramBalance;
    function addPendingRewards(uint256 _amount) public {
        uint256 newRewards = _amount;
        // uint256 newRewards = ram.balanceOf(_amount).sub(ramBalance);

        if(newRewards > 0) {
            // ramBalance = ram.balanceOf(address(this)); // If there is no change the balance didn't change
            pendingRewards = pendingRewards.add(newRewards);
            rewardsInThisEpoch = rewardsInThisEpoch.add(newRewards);
        }
    }

    // Update reward variables of the given pool to be up-to-date.
    function updatePool(uint256 _pid) internal returns (uint256 ramRewardWhole) {
        PoolInfo storage pool = poolInfo[_pid];

        uint256 tokenSupply = pool.token.balanceOf(address(this));
        if (tokenSupply == 0) { // avoids division by 0 errors
            return 0;
        }
        ramRewardWhole = pendingRewards // Multiplies pending rewards by allocation point of this pool and then total allocation
            .mul(pool.allocPoint)        // getting the percent of total pending rewards this pool should get
            .div(totalAllocPoint);       // we can do this because pools are only mass updated
        uint256 ramRewardFee = ramRewardWhole.mul(DEV_FEE).div(10000);
        uint256 ramRewardToDistribute = ramRewardWhole.sub(ramRewardFee);

        pending_DEV_rewards = pending_DEV_rewards.add(ramRewardFee);

        // Add pool's effective additional token amount from boosts
        uint256 effectivePoolStakedSupply = tokenSupply.add(pool.effectiveAdditionalTokensFromBoosts);
        // Calculate RAMPerShare using effective pool staked supply (not just total supply)
        pool.accRAMPerShare = pool.accRAMPerShare.add(ramRewardToDistribute.mul(1e12).div(effectivePoolStakedSupply));
    }

    // Deposit  tokens to RamVault for RAM allocation.
    function deposit(uint256 _pid, uint256 _amount) public {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];

        massUpdatePools();

        // Transfer pending tokens to user
        updateAndPayOutPending(_pid, msg.sender);

        // save gas
        if(_amount > 0) {
            pool.token.transferFrom(address(msg.sender), address(this), _amount);
            user.amount = user.amount.add(_amount);

            // Users that have bought multipliers will have an extra balance added to their stake according to the boost multiplier.
            if (user.boostLevel > 0) {
                uint256 prevBalancesAccounting = user.boostAmount;
                // Calculate and set user's new accounting balance
                uint256 accTotalMultiplier = getTotalMultiplier(user.boostLevel);
                uint256 newBalancesAccounting = user.amount
                    .mul(accTotalMultiplier)
                    .div(100);

                user.boostAmount = newBalancesAccounting;

                // Adjust total accounting supply accordingly
                uint256 diffBalancesAccounting = newBalancesAccounting.sub(prevBalancesAccounting);
                pool.effectiveAdditionalTokensFromBoosts = pool.effectiveAdditionalTokensFromBoosts.add(diffBalancesAccounting);
            }
        }

        uint256 effectiveAmount = user.amount.add(user.boostAmount);
        user.rewardDebt = effectiveAmount.mul(pool.accRAMPerShare).div(1e12);
        emit Deposit(msg.sender, _pid, _amount);
    }

    // Test coverage
    // [x] Does user get the deposited amounts?
    // [x] Does user that its deposited for update correcty?
    // [x] Does the depositor get their tokens decreased
    function depositFor(address depositFor, uint256 _pid, uint256 _amount) public {
        // requires no allowances
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][depositFor];

        massUpdatePools();

        // Transfer pending tokens
        // to user
        updateAndPayOutPending(_pid, depositFor); // Update the balances of person that amount is being deposited for

        if(_amount > 0) {
            pool.token.transferFrom(address(msg.sender), address(this), _amount);
            user.amount = user.amount.add(_amount); // This is depositedFor address

            // Users that have bought multipliers will have an extra balance added to their stake according to the boost multiplier.
            if (user.boostLevel > 0) {
                uint256 prevBalancesAccounting = user.boostAmount;
                // Calculate and set user's new accounting balance
                uint256 accTotalMultiplier = getTotalMultiplier(user.boostLevel);
                uint256 newBalancesAccounting = user.amount
                    .mul(accTotalMultiplier)
                    .div(100);

                user.boostAmount = newBalancesAccounting;

                // Adjust total accounting supply accordingly
                uint256 diffBalancesAccounting = newBalancesAccounting.sub(prevBalancesAccounting);
                pool.effectiveAdditionalTokensFromBoosts = pool.effectiveAdditionalTokensFromBoosts.add(diffBalancesAccounting);
            }
        }

        uint256 effectiveAmount = user.amount.add(user.boostAmount);
        user.rewardDebt = effectiveAmount.mul(pool.accRAMPerShare).div(1e12); // This is deposited for address
        emit Deposit(depositFor, _pid, _amount);
    }

    // Test coverage
    // [x] Does allowance update correctly?
    function setAllowanceForPoolToken(address spender, uint256 _pid, uint256 value) public {
        PoolInfo storage pool = poolInfo[_pid];
        pool.allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, _pid, value);
    }

    // Test coverage
    // [x] Does allowance decrease?
    // [x] Do oyu need allowance
    // [x] Withdraws to correct address
    function withdrawFrom(address owner, uint256 _pid, uint256 _amount) public{
        PoolInfo storage pool = poolInfo[_pid];
        require(pool.allowance[owner][msg.sender] >= _amount, "withdraw: insufficient allowance");
        pool.allowance[owner][msg.sender] = pool.allowance[owner][msg.sender].sub(_amount);
        _withdraw(_pid, _amount, owner, msg.sender);
    }

    // Withdraw  tokens from RamVault.
    function withdraw(uint256 _pid, uint256 _amount) public {
        _withdraw(_pid, _amount, msg.sender, msg.sender);
    }

    // Low level withdraw function
    function _withdraw(uint256 _pid, uint256 _amount, address from, address to) internal {
        PoolInfo storage pool = poolInfo[_pid];
        require(pool.withdrawable, "Withdrawing from this pool is disabled");
        UserInfo storage user = userInfo[_pid][from];
        require(user.amount >= _amount, "withdraw: not good");

        massUpdatePools();
        updateAndPayOutPending(_pid, from); // Update balances of from this is not withdrawal but claiming RAM farmed

        if(_amount > 0) {
            user.amount = user.amount.sub(_amount);
            pool.token.safeTransfer(address(to), _amount);

            // Users who have bought multipliers will have their accounting balances readjusted.
            if (user.boostLevel > 0) {
                // The previous extra balance user had
                uint256 prevBalancesAccounting = user.boostAmount;
                // Calculate and set user's new accounting balance
                uint256 accTotalMultiplier = getTotalMultiplier(user.boostLevel);
                uint256 newBalancesAccounting = user.amount
                    .mul(accTotalMultiplier)
                    .div(100);

                user.boostAmount = newBalancesAccounting;
                // Subtract the withdrawn amount from the accounting balance
                // If all tokens are withdrawn the balance will be 0.
                uint256 diffBalancesAccounting = prevBalancesAccounting.sub(newBalancesAccounting);
                pool.effectiveAdditionalTokensFromBoosts = pool.effectiveAdditionalTokensFromBoosts.sub(diffBalancesAccounting);
            }
        }

        uint256 effectiveAmount = user.amount.add(user.boostAmount);
        user.rewardDebt = effectiveAmount.mul(pool.accRAMPerShare).div(1e12);
        emit Withdraw(to, _pid, _amount);
    }

    function updateAndPayOutPending(uint256 _pid, address from) internal {
        uint256 pending = pendingRam(_pid, from);
        if(pending > 0) {
            safeRamTransfer(from, pending);
        }
    }

    // Withdraw without caring about rewards. EMERGENCY ONLY.
    // !Caution this will remove all your pending rewards!
    function emergencyWithdraw(uint256 _pid) public {
        PoolInfo storage pool = poolInfo[_pid];
        require(pool.withdrawable, "Withdrawing from this pool is disabled");
        UserInfo storage user = userInfo[_pid][msg.sender];
        pool.token.safeTransfer(address(msg.sender), user.amount);
        emit EmergencyWithdraw(msg.sender, _pid, user.amount);
        user.amount = 0;
        user.boostAmount = 0;
        user.rewardDebt = 0;
        // No mass update dont update pending rewards
    }

    // --------------------------------------------
    //                  Boosts
    // --------------------------------------------

    // Purchase a multiplier level for an individual user for an individual pool, same level cannot be purchased twice.
    function purchase(uint256 _pid, uint256 level) external {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];

        require(
            level > user.boostLevel,
            "Cannot downgrade level or same level"
        );

        // Cost will be reduced by the amount already spent on multipliers.
        uint256 cost = calculateCost(level);
        uint256 finalCost = cost.sub(user.spentMultiplierTokens);

        // Transfer RAM tokens to the contract
        require(ram.transferFrom(msg.sender, address(this), finalCost), "Transfer failed");

        // Update balances and level
        user.spentMultiplierTokens = user.spentMultiplierTokens.add(finalCost);
        user.boostLevel = level;

        // If user has staked balances, then set their new accounting balance
        if (user.amount > 0) {
            // Get the new multiplier
            uint256 accTotalMultiplier = getTotalMultiplier(level);

            // Calculate new accounting  balance
            uint256 newAccountingAmount = user.amount
                .mul(accTotalMultiplier)
                .div(100);

           // Get the user's previous accounting balance
            uint256 prevBalancesAccounting = user.boostAmount;

            // Set the user' new accounting balance
             user.boostAmount = newAccountingAmount;
            // Get the difference to adjust the total accounting balance
            uint256 diffBalancesAccounting = newAccountingAmount.sub(prevBalancesAccounting);
            pool.effectiveAdditionalTokensFromBoosts = pool.effectiveAdditionalTokensFromBoosts.add(diffBalancesAccounting);
        }

        boostFees = boostFees.add(finalCost);
        emit Boost(msg.sender, _pid, level);
    }

    // Returns the multiplier for user.
    function getTotalMultiplier(uint256 boostLevel) public view returns (uint256) {
        uint256 boostMultiplier = 0;
        if (boostLevel == 1) {
            boostMultiplier = boostLevelOneMultiplier;
        } else if (boostLevel == 2) {
            boostMultiplier = boostLevelTwoMultiplier;
        } else if (boostLevel == 3) {
            boostMultiplier = boostLevelThreeMultiplier;
        } else if (boostLevel == 4) {
            boostMultiplier = boostLevelFourMultiplier;
        }
        return boostMultiplier;
    }

    // Calculate the cost for purchasing a boost.
    function calculateCost(uint256 level) public view returns (uint256) {
        if (level == 1) {
            return boostLevelOneCost;
        } else if (level == 2) {
            return boostLevelTwoCost;
        } else if (level == 3) {
            return boostLevelThreeCost;
        } else if (level == 4) {
            return boostLevelFourCost;
        }
    }

   // Returns the users current multiplier level
    function getLevel(address account, uint256 pid) external view returns (uint256) {
        UserInfo memory user = userInfo[pid][account];
        return user.boostLevel;
    }

    // Return the amount spent on multipliers, used for subtracting for future purchases.
    function getSpent(address account, uint256 pid) external view returns (uint256) {
        UserInfo memory user = userInfo[pid][account];
        return user.spentMultiplierTokens;
    }

    // Distributes fees to devs and protocol
    function distributeFees() public {
        // Reset taxes to 0 before distributing any funds
        uint256 totalBoostDistAmt = boostFees;
        boostFees = 0;

        // Distribute taxes to regenerator and team 50/50%
        uint256 halfDistAmt = totalBoostDistAmt.div(2);
        if (halfDistAmt > 0) {
                // 50% to regenerator
                require(ram.transfer(regeneratoraddr, halfDistAmt), "Transfer failed.");
                // 70% of the other 50% to devs
                uint256 devDistAmt = halfDistAmt.mul(70).div(100);
                if (devDistAmt > 0) {
                    require(ram.transfer(devaddr, devDistAmt), "Transfer failed.");
                }
                // 30% of the other 50% to team
                uint256 teamDistAmt = halfDistAmt.mul(30).div(100);
                if (teamDistAmt > 0) {
                    require(ram.transfer(teamaddr, teamDistAmt), "Transfer failed.");
                }
        }
    }

    function updateBoosts(
        uint256[] memory _boostMultipliers,
        uint256[] memory _boostCosts
    ) public onlyOwner
    {
         require(_boostMultipliers.length == 4, "Must specify 4 multipliers");
         require(_boostCosts.length == 4, "Must specify 4 multipliers");
         // Update boost costs
         boostLevelOneCost = _boostCosts[0];
         boostLevelTwoCost = _boostCosts[1];
         boostLevelThreeCost = _boostCosts[2];
         boostLevelFourCost = _boostCosts[3];
         // Update boost multipliers
         boostLevelOneMultiplier = _boostMultipliers[0];
         boostLevelTwoMultiplier = _boostMultipliers[1];
         boostLevelThreeMultiplier = _boostMultipliers[2];
         boostLevelFourMultiplier = _boostMultipliers[3];
    }

    // --------------------------------------------
    //                  Utils
    // --------------------------------------------

    // Sets the dev fee for this contract
    // defaults at 7.24%
    // Note contract owner is meant to be a governance contract allowing RAM governance consensus
    uint16 DEV_FEE;
    function setDevFee(uint16 _DEV_FEE) public onlyOwner {
        require(_DEV_FEE <= 1000, 'Dev fee clamped at 10%');
        DEV_FEE = _DEV_FEE;
    }
    uint256 pending_DEV_rewards;


    // function that lets owner/governance contract
    // approve allowance for any token inside this contract
    // This means all future UNI like airdrops are covered
    // And at the same time allows us to give allowance to strategy contracts.
    // Upcoming cYFI etc vaults strategy contracts will  se this function to manage and farm yield on value locked
    function setStrategyContractOrDistributionContractAllowance(address tokenAddress, uint256 _amount, address contractAddress) public onlySuperAdmin {
        require(isContract(contractAddress), "Recipent is not a smart contract, BAD");
        require(block.number > contractStartBlock.add(95_000), "Governance setup grace period not over"); // about 2weeks
        IERC20(tokenAddress).approve(contractAddress, _amount);
    }

    function isContract(address addr) public returns (bool) {
        uint size;
        assembly { size := extcodesize(addr) }
        return size > 0;
    }

    // Safe ram transfer function, just in case if rounding error causes pool to not have enough RAMs.
    function safeRamTransfer(address _to, uint256 _amount) internal {
        uint256 ramBal = ram.balanceOf(address(this));

        if (_amount > ramBal) {
            ram.transfer(_to, ramBal);
            ramBalance = ram.balanceOf(address(this));

        } else {
            ram.transfer(_to, _amount);
            ramBalance = ram.balanceOf(address(this));

        }
        //Avoids possible recursion loop
        // proxy?
        transferDevFee();

    }

    function transferDevFee() public {
        if(pending_DEV_rewards == 0) return;

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

        if (devDistAmt > 0) { ram.transfer(devaddr, devDistAmt); }
        if (teamDistAmt > 0) { ram.transfer(teamaddr, teamDistAmt);}

        ramBalance = ram.balanceOf(address(this));
        pending_DEV_rewards = 0;
    }

    // Update dev address by the previous dev.
    // Note onlyOwner functions are meant for the governance contract
    // allowing RAM governance token holders to do this functions.
    function setDevFeeReciever(address _devaddr) public onlyOwner {
        devaddr = _devaddr;
    }

    // --------------------------------------------
    //                  Admin
    // --------------------------------------------

    address private _superAdmin;

    event SuperAdminTransfered(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Returns the address of the current super admin
     */
    function superAdmin() public view returns (address) {
        return _superAdmin;
    }

    /**
     * @dev Throws if called by any account other than the superAdmin
     */
    modifier onlySuperAdmin() {
        require(_superAdmin == _msgSender(), "Super admin : caller is not super admin.");
        _;
    }

    // Assisns super admint to address 0, making it unreachable forever
    function burnSuperAdmin() public virtual onlySuperAdmin {
        emit SuperAdminTransfered(_superAdmin, address(0));
        _superAdmin = address(0);
    }

    // Super admin can transfer its powers to another address
    function newSuperAdmin(address newOwner) public virtual onlySuperAdmin {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        emit SuperAdminTransfered(_superAdmin, newOwner);
        _superAdmin = newOwner;
    }
}
