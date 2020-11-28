const UniRAMRouter = artifacts.require("RAMv1Router");
const UniV2Factory = artifacts.require("UniswapV2Factory");
// const WETH = artifacts.require("WETH9");
const RAM = artifacts.require("RAM");
const RAMVAULT = artifacts.require("RAMVault");
// const Token = artifacts.require("Token");
const UniV2Pair = artifacts.require("UniswapV2Pair");
const Governance = artifacts.require("Governance");
const FeeApprover = artifacts.require('FeeApprover');
const NFTFactory = artifacts.require('NFTFactory');



module.exports = function(deployer, network, accounts) {
  // [MAINNET DEPLOYMENT]
  let setterAccount = deployer.networks.mainnet.from;
  let ygyTeamAddrSpendable = "";
  let ygyTeamAddrTxFee = "0xe50314F9d3a059bF558621ED1b5d47bbC0578549";
// Spendable: 0xc104069b0Ca2a7649A257377B412c0C4e385Fe2D
// Multiplier / Boost: 0xFC597788EF4D23a77081eA01Cf56f4cA340F546d
// Transaction Fee: 0xe50314F9d3a059bF558621ED1b5d47bbC0578549
// Multiplier / Boost: 0xFC597788EF4D23a77081eA01Cf56f4cA340F546d
  let wlxTeamAddr = "0x1200189ff024420f6a98d511D21FAa0b971Bf082";
  let rengeneratorAddr = "0x44C1758E5337BeFA9a95f051595857C99dF75052";
  let wethAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

  const dXiotAddress = "0x8b6dd24bcb2d0aea92c3abd4eb11103a5db6d714";

  // [KOVAN TESTNET DEPLOYMENT]
  // let setterAccount = deployer.networks.kovan.from;
  // let devAccount = "0xB5aC192829C65Fd553bFb0381E1139867A4626FD";
  // let teamAddr = "0x08F57A4acCfEB2970E0A56270160719A1aa5b4A4";
  // let rengeneratorAddr = "0x26C9264CB693AB4142ad19d2AB44B272dd1C9691";
  // let wethAddress = "0xd0a1e359811322d97991e03f863a0c30c2cf029c";
  // let ygyAddress = "0x11b0a8c0fa626627601ed518c3538a39d92d609e";

  // [LOCAL DEPLOYMENT]
  // let setterAccount = accounts[2];
  // let devAccount = accounts[2];
  // let teamAddr = accounts[3];
  // let rengeneratorAddr = accounts[4];

  // const tenThousand = "10000000000000000000000";
  // const fiveThousand = "5000000000000000000000";
  // const twoThousand = "2000000000000000000000";

  deployer.then(async () => {
    // Deploy a new Uniswap Factory and set 'setterAccount' which collects fees
    const uniV2Factory = await deployer.deploy(UniV2Factory, setterAccount);

    // Deploy a new WETH wrapped Ethereum token [FOR TESTING]
    // const weth = await deployer.deploy(WETH);

    // Deposit Ethereum and get WETH tokens
    // await weth.deposit({value: (1e18).toString() });

    // Deploy a new RAM token which manages Governance for the protocol
    // const YGYToken = await deployer.deploy(Token, "YGY", "YGY", tenThousand);
    const RAMToken = await deployer.deploy(RAM, uniV2Factory.address);

    // Deploy a new FeeApprover contract
    const feeapprover = await deployer.deploy(FeeApprover);

    // Create a YGY-WETH pair on uniswap [FOR TESTING, this would be created by RAM constructor in production]
    const YGYWETHPair = await UniV2Pair.at((await uniV2Factory.createPair(wethAddress, ygyAddress)).receipt.logs[0].args.pair);
    // Create a YGY-RAM pair on uniswap [FOR TESTING, this would be created by RAM constructor in production]
    const YGYRAMPair = await UniV2Pair.at((await uniV2Factory.createPair(RAMToken.address, ygyAddress)).receipt.logs[0].args.pair);

    // Now we can initialize the FeeApprover contract
    await feeapprover.initialize(RAMToken.address, ygyAddress, uniV2Factory.address);

    await feeapprover.setPaused(false);

    // Deploy RAMvault to manage yield farms
    const RAMVault = await deployer.deploy(RAMVAULT);

    // Sets transferCheckerAddress() to setter account
    await RAMToken.setShouldTransferChecker(feeapprover.address);
    await RAMToken.setFeeDistributor(RAMVault.address);

    // TODO:
    // The next 3 commands simulate a LGE where RAM/WETH is contributed and the contributor receives RAMPair tokens
    // await YGYToken.transfer(YGYWETHPair.address, twoThousand);
    // await weth.transfer(YGYWETHPair.address, (1*1e18).toString());
    // await YGYWETHPair.mint(setterAccount);

    // await YGYToken.transfer(YGYRAMPair.address, fiveThousand);
    // await RAMToken.transfer(YGYRAMPair.address, fiveThousand);
    // await YGYRAMPair.mint(setterAccount);

    // Deploy NFT Factory
    const nftFactory = await deployer.deploy(NFTFactory);

    // Simulate NFT deployment to get NFT expected contract address, then deploy the NFT
    const nftAddr1 = await nftFactory.deployNFT.call("RAM level 1", "RAMLEVEL1NFT", "ram.level1");
    await nftFactory.deployNFT("RAM level 1", "RAMLEVEL1NFT", "ram.level1");
    const nftAddr2 = await nftFactory.deployNFT.call("RAM level 2", "RAMLEVEL2NFT", "ram.level2");
    await nftFactory.deployNFT("RAM level 2", "RAMLEVEL2NFT", "ram.level2");
    const nftAddr3 = await nftFactory.deployNFT.call("RAM level 3", "RAMLEVEL3NFT", "ram.level3");
    await nftFactory.deployNFT("RAM level 3", "RAMLEVEL3NFT", "ram.level3");
    const nftAddr4 = await nftFactory.deployNFT.call("RAM level 1", "RAMLEVEL1NFT", "ram.level1");
    await nftFactory.deployNFT("RAM level 4", "RAMLEVEL4NFT", "ram.level4");
    const nftAddr5 = await nftFactory.deployNFT.call("RAM level 5", "RAMLEVEL5NFT", "ram.level5");
    await nftFactory.deployNFT("RAM level 5", "RAMLEVEL5NFT", "ram.level5");

    // Deploy a dummy dXIOT token to use as Robot NFT
    // const dXiotToken = await deployer.deploy(Token, "dXIOT", "dXIOT", tenThousand);

    const robotNFT = await nftFactory.deployNFT.call("RAM Robot NFT", "RAMROBOTNFT", "ram.robot");
    await nftFactory.deployNFT("RAM Robot NFT", "RAMROBOTNFT", "ram.robot");

    const linkNFT = await nftFactory.deployNFT.call("RAM LINK NFT", "RAMLINKNFT", "ram.link");
    await nftFactory.deployNFT("RAM LINK NFT", "RAMLINKNFT", "ram.link");

    const nftAddrs = [nftAddr1, nftAddr2, nftAddr3, nftAddr4, nftAddr5, robotNFT, linkNFT];

    // Deploy RAMRouter contract
    const RAMRouter = await deployer.deploy(UniRAMRouter, RAMToken.address, ygyAddress, wethAddress, uniV2Factory.address, YGYRAMPair.address, YGYWETHPair.address, feeapprover.address, RAMVault.address, nftFactory.address, nftAddrs, rengeneratorAddr, dXiotAddress);

    // Deploy governance contract and set on router
    const governance = await deployer.deploy(Governance, ygyAddress, RAMRouter.address);
    await RAMRouter.setGovernance(governance.address);

    // Initialize RAMVault
    await RAMVault.initialize(RAMToken.address, ygyTeamAddr, wlxTeamAddr, rengeneratorAddr, setterAccount);
  })
};
