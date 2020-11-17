pragma solidity 0.6.12;



import "./IFeeApprover.sol";

import "@openzeppelin/contracts-ethereum-package/contracts/access/Ownable.sol";

/// Please do not use this contract until its done, and tested.
/// Undefined behaviour might happen.
/// This code is shared/provided WITHOUT any warranties of any kind.

/// This contract is supposed to streamline liquidity additions
// By allowing people to put in any amount of ETH or RAM and get LP tokens back
contract RAMv1Router is OwnableUpgradeSafe {
    IFeeApprover public _feeApprover;
    mapping (address => bool) public ramChosen;

    mapping(address => uint256) public hardRAM;

    // RNG variables
    uint public constant MAX = uint(0) - uint(1); // using underflow to generate the maximum possible value
    uint public constant SCALE = 10;
    uint public constant SCALIFIER = MAX / SCALE;
    uint public constant OFFSET = 1;
    uint256 public randomResult;
    bytes32 internal keyHash;
    uint256 internal fee;

    // RAM protocol variables
    address public _RAMToken;
    address public _RAMWETHPair;
    IFeeApprover public _feeApprover;
    IRAMVault public _RAMVault;
    IWETH public _WETH;
    address public _uniV2Factory;

    constructor(address RAMToken, address WETH, address uniV2Factory, address RAMWethPair, address feeApprover, address RAMVault)
        VRFConsumerBase(
            0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9, // VRF Coordinator (KOVAN)
            0xa36085F69e2889c224210F603D836748e7dC0088  // LINK Token (KOVAN)
        )
        public
    {
        _RAMToken = RAMToken;
        _WETH = IWETH(WETH);
        _uniV2Factory = uniV2Factory;
        _feeApprover = IFeeApprover(feeApprover);
        _RAMWETHPair = RAMWethPair;
        _RAMVault = IRAMVault(RAMVault);
        refreshApproval();

        keyHash = 0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4;
        fee = 0.1 * 10 ** 18; // 0.1 LINK
    }


    function refreshApproval() public {
        IUniswapV2Pair(_RAMWETHPair).approve(address(_RAMVault), uint(-1));
    }

    event FeeApproverChanged(address indexed newAddress, address indexed oldAddress);

    fallback() external payable {
        if(msg.sender != address(_WETH)){
             addLiquidityETHOnly(msg.sender, false);
        }
    }

    /// Route 1 : Buy LP for ETH
    /// Route 2 : Buy LP for RAM

    // Function sell Ram for ETH

    // Function wrap ETH

    // Function get price of RAM after sell

    // Function get amount of RAM with a ETH buy

    // Function get RAM needed to pair per ETH


    function addLiquidityETHOnly(address payable to, bool autoStake) public payable {
        require(to != address(0), "Invalid address");
        hardRAM[msg.sender] = hardRAM[msg.sender].add(msg.value);

        uint256 buyAmount = msg.value.div(2);
        require(buyAmount > 0, "Insufficient ETH amount");

        _WETH.deposit{value : msg.value}();

        (uint256 reserveWeth, uint256 reserveRAM) = getPairReserves();
        uint256 outRAM = UniswapV2Library.getAmountOut(buyAmount, reserveWeth, reserveRAM);

        _WETH.transfer(_RAMWETHPair, buyAmount);

        (address token0, address token1) = UniswapV2Library.sortTokens(address(_WETH), _RAMToken);
        IUniswapV2Pair(_RAMWETHPair).swap(_RAMToken == token0 ? outRAM : 0, _RAMToken == token1 ? outRAM : 0, address(this), "");

        _addLiquidity(outRAM, buyAmount, to, autoStake);

        _feeApprover.sync();
    }

    function _addLiquidity(uint256 RAMAmount, uint256 wethAmount, address payable to, bool autoStake) internal {
        (uint256 wethReserve, uint256 RAMReserve) = getPairReserves();

        uint256 optimalRAMAmount = UniswapV2Library.quote(wethAmount, wethReserve, RAMReserve);

        uint256 optimalWETHAmount;
        if (optimalRAMAmount > RAMAmount) {
            optimalWETHAmount = UniswapV2Library.quote(RAMAmount, RAMReserve, wethReserve);
            optimalRAMAmount = RAMAmount;
        }
        else
            optimalWETHAmount = wethAmount;

        assert(_WETH.transfer(_RAMWETHPair, optimalWETHAmount));
        assert(IERC20(_RAMToken).transfer(_RAMWETHPair, optimalRAMAmount));

        if (autoStake) {
            IUniswapV2Pair(_RAMWETHPair).mint(address(this));
            _RAMVault.depositFor(to, 0, IUniswapV2Pair(_RAMWETHPair).balanceOf(address(this)));
        }
        else
            IUniswapV2Pair(_RAMWETHPair).mint(to);

        //refund dust
        if (RAMAmount > optimalRAMAmount)
            IERC20(_RAMToken).transfer(to, RAMAmount.sub(optimalRAMAmount));

        if (wethAmount > optimalWETHAmount) {
            uint256 withdrawAmount = wethAmount.sub(optimalWETHAmount);
            _WETH.withdraw(withdrawAmount);
            to.transfer(withdrawAmount);
        }
    }

    function getLPTokenPerEthUnit(uint ethAmt) public view  returns (uint liquidity){
        (uint256 reserveWeth, uint256 reserveRAM) = getPairReserves();
        uint256 outRAM = UniswapV2Library.getAmountOut(ethAmt.div(2), reserveWeth, reserveRAM);
        uint _totalSupply =  IUniswapV2Pair(_RAMWETHPair).totalSupply();

        (address token0, ) = UniswapV2Library.sortTokens(address(_WETH), _RAMToken);
        (uint256 amount0, uint256 amount1) = token0 == _RAMToken ? (outRAM, ethAmt.div(2)) : (ethAmt.div(2), outRAM);
        (uint256 _reserve0, uint256 _reserve1) = token0 == _RAMToken ? (reserveRAM, reserveWeth) : (reserveWeth, reserveRAM);
        liquidity = Math.min(amount0.mul(_totalSupply) / _reserve0, amount1.mul(_totalSupply) / _reserve1);
    }

    function getPairReserves() internal view returns (uint256 wethReserves, uint256 RAMReserves) {
        (address token0,) = UniswapV2Library.sortTokens(address(_WETH), _RAMToken);
        (uint256 reserve0, uint reserve1,) = IUniswapV2Pair(_RAMWETHPair).getReserves();
        (wethReserves, RAMReserves) = token0 == _RAMToken ? (reserve1, reserve0) : (reserve0, reserve1);
    }

    // Function sync fee approver
    function sync() public {
        _feeApprover.updateTxState();
    }

    // sets fee approver in case fee approver gets chaned.
    function setFeeApprover(address feeApproverAddress) onlyOwner public{
        _feeApprover = IFeeApprover(feeApproverAddress);
    }

    function changeFeeApprover(address feeApprover) external onlyOwner {
        address oldAddress = address(_feeApprover);
        _feeApprover = IFeeApprover(feeApprover);

        emit FeeApproverChanged(feeApprover, oldAddress);
    }

    // -------------------------------------------------
    //                  Chainlink RNG
    // -------------------------------------------------

    /**
     * Requests randomness from a user-provided seed
     */
    function getRandomNumber(uint256 userProvidedSeed) public returns (bytes32 requestId) {
        require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK on contract");
        return requestRandomness(keyHash, fee, userProvidedSeed);
    }

    /**
     * Requests randomness from a user-provided seed
     */
    function selfRequestRandomNumber(uint256 userProvidedSeed) public returns (bytes32 requestId) {
        require(LINK.transferFrom(msg.sender, address(this), fee), "Not enough LINK approved to contract");
        return requestRandomness(keyHash, fee, userProvidedSeed);
    }

    /**
     * Callback function used by VRF Coordinator
     */
    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        uint scaled = randomness / SCALIFIER;
        uint adjusted = scaled + OFFSET;
        randomResult = randomness;
    }
}
