// SPDX-License-Identifier: UNLICENSED;
pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;

/**
Storage contract for the YGY system
*/
import "@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol";
import "./interfaces/INBUNIERC20.sol";
import "./uniswapv2/interfaces/IWETH.sol";

contract YGYStorageV1 is AccessControlUpgradeSafe {
    /* STORAGE CONFIG */
    using SafeMath for uint256;

    bytes32 public constant MODIFIER_ROLE = keccak256("MODIFIER_ROLE");

    function initialize() public initializer {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()));
        _setupRole(MODIFIER_ROLE, _msgSender());
    }

    /* RAMVAULT */

    // User properties per vault/pool.
    struct UserInfo {
        uint256 amount; // How many  tokens the user has provided.
        uint256 rewardDebt; // Reward debt. See explanation below.
        uint256 rewardDebtYGY;
        uint256 boostAmount;
        uint256 boostLevel;
        uint256 spentMultiplierTokens;
        bool hasNFTBoostApplied;
    }

    // Pool/Vault-id -> userrAddress -> userInfo
    mapping(uint256 => mapping(address => UserInfo)) public userInfo;

    // Pool properties
    struct PoolInfo {
        IERC20 token; // Address of  token contract.
        uint256 allocPoint; // How many allocation points assigned to this pool. RAMs to distribute per block.
        uint256 accRAMPerShare; // Accumulated RAMs per share, times 1e12. See below.
        uint256 accYGYPerShare; // Accumulated YGYs per share, times 1e12. See below.
        bool withdrawable; // Is this pool withdrawable?
        mapping(address => mapping(address => uint256)) allowance;
        uint256 effectiveAdditionalTokensFromBoosts; // Track the total additional accounting staked tokens from boosts.
    }
    // All pool properties
    PoolInfo[] public poolInfo;

    function getPoolInfo(uint256 _poolId)
        external
        view
        returns (
            IERC20 _token,
            uint256 _allocPointt,
            uint256 _accRAMPerShare,
            uint256 _accYGYPerShare,
            bool _withdrawable,
            uint256 _effectiveAdditionalTokensFromBoosts
        )
    {
        PoolInfo memory pool = poolInfo[_poolId];
        return (
            pool.token,
            pool.allocPoint,
            pool.accRAMPerShare,
            pool.accYGYPerShare,
            pool.withdrawable,
            pool.effectiveAdditionalTokensFromBoosts
        );
    }

    // Total allocattion points for the whole contract
    uint256 public totalAllocPoint;

    // Pending rewards.
    uint256 public pendingRewards;
    uint256 public pendingYGYRewards;

    // Extra balance-keeping for extra-token rewards
    uint256 public YGYReserve;

    // Reward token balance-keeping
    uint256 internal ramBalance;
    uint256 internal ygyBalance;

    uint256 public RAMVaultStartBlock;
    uint256 public epochCalculationStartBlock;
    uint256 public cumulativeRewardsSinceStart;
    uint256 public cumulativeYGYRewardsSinceStart;
    uint256 public rewardsInThisEpoch;

    uint256 public epoch;

    // System addresses
    address public regeneratoraddr;
    address public teamaddr;

    // TOKENS
    INBUNIERC20 public ram; // The RAM token
    IERC20 public ygy; // The YGY token
    address public _YGYRAMPair;
    address public _YGYToken;
    address public _YGYWETHPair;
    address public _RAMToken;
    IERC20 public _dXIOTToken;
    IWETH public _WETH;

    function initializeRAMVault(
        address _ram,
        address _ygy,
        address _teamaddr,
        address _regeneratoraddr
    ) external initializer {
        require(hasRole(MODIFIER_ROLE, _msgSender()));
        ram = INBUNIERC20(_ram);
        ygy = IERC20(_ygy);
        teamaddr = _teamaddr;
        regeneratoraddr = _regeneratoraddr;
        RAMVaultStartBlock = block.number;

        boostLevelCosts[1] = 5 * 1e18; // 5 RAM tokens
        boostLevelCosts[2] = 15 * 1e18; // 15 RAM tokens
        boostLevelCosts[3] = 30 * 1e18; // 30 RAM tokens
        boostLevelCosts[4] = 60 * 1e18; // 60 RAM tokens
        boostLevelMultipliers[1] = 5; // 5%
        boostLevelMultipliers[2] = 15; // 15%
        boostLevelMultipliers[3] = 30; // 30%
        boostLevelMultipliers[4] = 60; // 60%
    }

    function setTokens(
        address RAMToken,
        address YGYToken,
        address WETH,
        address YGYRAMPair,
        address YGYWethPair,
        address[] memory nfts,
        address dXIOTToken
    ) external {
        require(hasRole(MODIFIER_ROLE, _msgSender()));
        _RAMToken = RAMToken;
        _YGYToken = YGYToken;
        _WETH = IWETH(WETH);
        _YGYRAMPair = YGYRAMPair;
        _YGYWETHPair = YGYWethPair;
        _dXIOTToken = IERC20(dXIOTToken);
        for (uint256 i = 0; i < nfts.length; i++) {
            _NFTs[i + 1] = nfts[i];
        }
    }

    // Boosts
    uint256 public boostFees;
    mapping(uint256 => uint256) public boostLevelCosts;

    function poolLength() external view returns (uint256) {
        return poolInfo.length;
    }

    function checkRewards(uint256 _pid, address _user)
        external
        view
        returns (uint256 pendingRAM, uint256 pendingYGY)
    {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][_user];
        uint256 effectiveAmount = user.amount.add(user.boostAmount);
        uint256 YGYRewards;
        if (pool.accYGYPerShare > 0) {
            YGYRewards = effectiveAmount.mul(pool.accYGYPerShare).div(1e12).sub(
                user.rewardDebtYGY
            );
        }
        return (
            effectiveAmount.mul(pool.accRAMPerShare).div(1e12).sub(
                user.rewardDebt
            ),
            YGYRewards
        );
    }

    function getBoostLevelCost(uint256 _level) external view returns (uint256) {
        return boostLevelCosts[_level];
    }

    mapping(uint256 => uint256) public boostLevelMultipliers;

    function getBoostLevelMultiplier(uint256 _level)
        external
        view
        returns (uint256)
    {
        return boostLevelMultipliers[_level];
    }

    function updateBoosts(
        uint256[] memory _boostMultipliers,
        uint256[] memory _boostCosts
    ) external {
        require(hasRole(MODIFIER_ROLE, _msgSender()));
        // Update boost costs
        for (uint8 i; i <= _boostMultipliers.length; i++) {
            boostLevelCosts[i + 1] = _boostCosts[i];
            boostLevelMultipliers[i + 1] = _boostMultipliers[i];
        }
    }

    // For easy graphing historical epoch rewards
    mapping(uint256 => uint256) public epochRewards;

    function getEpochRewards(uint256 _epoch) external view returns (uint256) {
        return epochRewards[_epoch];
    }

    /*
         ROUTER
    */

    // Lottery tracking
    struct LotteryTicket {
        address owner;
        uint256 levelOneChance;
        uint256 levelTwoChance;
        uint256 levelThreeChance;
        uint256 levelFourChance;
        uint256 levelFiveChance;
    }
    uint256 public ticketCount;

    mapping(uint256 => LotteryTicket) public tickets;
    // Total eth contributed to a vault.
    mapping(address => uint256) public liquidityContributedEthValue;
    mapping(address => uint256) public lastTicketLevel; // Mapping of (user => last ticket level)

    // NFT STUFF
    mapping(uint256 => address) public _NFTs; // Mapping of (level number => NFT address)

    // Property object, extra field for arbirtrary values in futurer
    struct NFTProperty {
        string pType;
        uint256 pValue;
        bytes32 extra;
    }

    mapping(address => NFTProperty[]) public nftPropertyChoices;

    function getNFTAddress(uint256 _contractId)
        external
        view
        returns (address)
    {
        return _NFTs[_contractId];
    }

    function getNFTProperty(uint256 _contractId, uint256 _index)
        external
        view
        returns (
            string memory,
            uint256,
            bytes32
        )
    {
        address NFTAddress = _NFTs[_contractId];
        NFTProperty memory properties = nftPropertyChoices[NFTAddress][_index];

        return (properties.pType, properties.pValue, properties.extra);
    }

    function getNFTPropertyCount(uint256 _contractId)
        external
        view
        returns (uint256)
    {
        address NFTAddress = _NFTs[_contractId];
        NFTProperty[] memory properties = nftPropertyChoices[NFTAddress];
        return properties.length;
    }

    // General-purpose mappings
    mapping(bytes32 => mapping(address => bool)) booleanMapStorage;
    uint256[] public booleanMapStorageCount;

    function getBooleanMapValue(string memory _key, address _address)
        external
        view
        returns (bool)
    {
        bytes32 key = stringToBytes32(_key);
        booleanMapStorage[key][_address];
    }

    mapping(bytes32 => address) addressStorage;
    uint256[] public addressStorageCount;

    function getAddressStorage(string memory _key)
        external
        view
        returns (address)
    {
        bytes32 key = stringToBytes32(_key);
        return addressStorage[key];
    }

    mapping(bytes32 => uint256) uintStorage;
    uint256[] public uintStorageCount;

    struct StateStruct {
        bytes32 name;
        mapping(bytes32 => bytes32) value;
    }

    struct ObjectStruct {
        StateStruct state;
        address owner;
        bool isObject;
    }

    function stringToBytes32(string memory source)
        public
        pure
        returns (bytes32 result)
    {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }

        assembly {
            result := mload(add(source, 32))
        }
    }
}
