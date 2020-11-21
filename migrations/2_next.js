const UniRAMRouter = artifacts.require("RAMv1Router");
const UniV2Factory = artifacts.require("UniswapV2Factory");
const WETH = artifacts.require("WETH9");
const RAM = artifacts.require("RAM");
const RAMVAULT = artifacts.require("RAMVault");
const Token = artifacts.require("Token");
const UniV2Pair = artifacts.require("UniswapV2Pair");
const Governance = artifacts.require("Governance");
const FeeApprover = artifacts.require('FeeApprover');

module.exports = function(deployer, network, accounts) {

  let testAccount = accounts[0];
  let setterAccount = accounts[1];
  let devAccount = accounts[2];
  let teamAddr = accounts[3];
  let rengeneratorAddr = accounts[4];

  deployer.then(async () => {
    // Deploy a new Uniswap Factory and set 'setterAccount' which collects fees
    // const uniV2Factory = await UniV2Factory.new(setterAccount);
    const uniV2Factory = await deployer.deploy(UniV2Factory, setterAccount);

    // Deploy a new WETH wrapped Ethereum token [FOR TESTING]
    const weth = await deployer.deploy(WETH);

    // Deposit Ethereum and get WETH tokens
    await weth.deposit({ from: setterAccount, value: (5e18).toString() });

    // Deploy a new RAM token which manages Governance for the protocol
    const YGYToken = await deployer.deploy(Token, "YGY", "YGY", (20*1e18).toString(), { from: setterAccount });
    const RAMToken = await deployer.deploy(RAM, uniV2Factory.address, { from: setterAccount });

    // Deploy a new FeeApprover contract
    const feeapprover = await deployer.deploy(FeeApprover, { from: setterAccount });

    // Create a YGY-WETH pair on uniswap [FOR TESTING, this would be created by RAM constructor in production]
    const YGYWETHPair = await UniV2Pair.at((await uniV2Factory.createPair(weth.address, YGYToken.address, { from: setterAccount })).receipt.logs[0].args.pair);
    // const YGYWETHPair = await UniV2Pair.deploy(FeeApprover, { from: setterAccount });
    // Create a YGY-RAM pair on uniswap [FOR TESTING, this would be created by RAM constructor in production]
    const YGYRAMPair = await UniV2Pair.at((await uniV2Factory.createPair(RAMToken.address, YGYToken.address, { from: setterAccount })).receipt.logs[0].args.pair);

    // Now we can initialize the FeeApprover contract
    await feeapprover.initialize(RAMToken.address, YGYToken.address, uniV2Factory.address, { from: setterAccount });

    await feeapprover.setPaused(false, { from: setterAccount });

    // Sets transferCheckerAddress() to setter account
    await RAMToken.setShouldTransferChecker(feeapprover.address, { from: setterAccount });

    // The next 3 commands simulate a LGE where RAM/WETH is contributed and the contributor receives RAMPair tokens
    await YGYToken.transfer(YGYWETHPair.address, (4*1e18).toString(), { from: setterAccount });
    await weth.transfer(YGYWETHPair.address, (4*1e18).toString(), { from: setterAccount });
    await YGYWETHPair.mint(setterAccount);

    await YGYToken.transfer(YGYRAMPair.address, (5*1e18).toString(), { from: setterAccount });
    await RAMToken.transfer(YGYRAMPair.address, (5*1e18).toString(), { from: setterAccount });
    await YGYRAMPair.mint(setterAccount);

      // Deploy RAMvault to manage yield farms
      const RAMVault = await deployer.deploy(RAMVAULT, { from: setterAccount });

      // Deploy RAMRouter contract
      const RAMRouter = await deployer.deploy(UniRAMRouter, RAMToken.address, YGYToken.address, weth.address, uniV2Factory.address, YGYRAMPair.address, YGYWETHPair.address, feeapprover.address, RAMVault.address, rengeneratorAddr,  { from: setterAccount });

      // Deploy governance contract and set on router
      const governance = await deployer.deploy(Governance, YGYToken.address, RAMRouter.address, { from: setterAccount });
      await RAMRouter.setGovernance(governance.address, { from: setterAccount });

      // Initialize RAMVault
      await RAMVault.initialize(RAMToken.address, devAccount, teamAddr, rengeneratorAddr, setterAccount, { from: setterAccount });
  })
};
