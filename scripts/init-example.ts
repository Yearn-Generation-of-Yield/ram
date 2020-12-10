const UniRAMRouter = artifacts.require("RAMv1Router");
const UniV2Factory = artifacts.require("UniswapV2Factory");
const NFTFactory = artifacts.require("NFTFactory");
const NFT = artifacts.require("NFT");
const WETH = artifacts.require("WETH9");
const RAM = artifacts.require("RAM");
const RAMVAULT = artifacts.require("RAMVault");
const Token = artifacts.require("Token");
const BlockHashStore = artifacts.require("BlockHashStore");
const VRFCoordinator = artifacts.require("VRFCoordinator");
const ChainLinkToken = artifacts.require("ChainLinkToken");
const UniV2Pair = artifacts.require("UniswapV2Pair");
const Governance = artifacts.require("Governance");
const FeeApprover = artifacts.require("FeeApprover");
const timeMachine = require("ganache-time-traveler");

const MAX_INT = "11579208923731619542357098500868790785326998466564056403945758400791312963993";

const initializeEnvironment = async (that, accounts) => {
  let testAccount = accounts[0];
  let setterAccount = accounts[1];
  let testAccount2 = accounts[2];
  let testAccount3 = accounts[3];
  let devAccount = accounts[4];
  let teamAddr = accounts[5];
  let rengeneratorAddr = accounts[6];
  // Take time snapshot
  let snapshot = await timeMachine.takeSnapshot();
  snapshotId = snapshot["result"];

  // Deploy a new Uniswap Factory and set 'setterAccount' which collects fees
  that.uniV2Factory = await UniV2Factory.new(setterAccount);

  // Deploy a new WETH wrapped Ethereum token [FOR TESTING]
  that.weth = await WETH.new();

  // Deposit Ethereum and get WETH tokens
  that.weth.deposit({ from: testAccount2, value: (5e18).toString() });
  that.weth.deposit({ from: setterAccount, value: (5e18).toString() });

  // Deploy the YGY token
  that.YGYToken = await Token.new("YGY", "YGY", web3.utils.toWei("200000"), { from: setterAccount });
  // Deploy the YGY token
  that.dxiotToken = await Token.new("DXIOT", "DXIOT", web3.utils.toWei("200000"), { from: setterAccount });

  // Deploy a new RAM token which manages Governance for the protocol
  that.RAMToken = await RAM.new(that.uniV2Factory.address, { from: setterAccount });

  // Deploy a new FeeApprover contract
  that.feeapprover = await FeeApprover.new({ from: setterAccount });

  // Create a YGY-WETH pair on uniswap [FOR TESTING, that would be created by RAM constructor in production]
  that.YGYWETHPair = await UniV2Pair.at(
    (await that.uniV2Factory.createPair(that.weth.address, that.YGYToken.address, { from: setterAccount })).receipt.logs[0].args.pair
  );
  // Create a YGY-RAM pair on uniswap [FOR TESTING, that would be created by RAM constructor in production]
  that.YGYRAMPair = await UniV2Pair.at(
    (await that.uniV2Factory.createPair(that.RAMToken.address, that.YGYToken.address, { from: setterAccount })).receipt.logs[0].args.pair
  );
  // Deploy RAMvault to manage yield farms
  that.RAMvault = await RAMVAULT.new({ from: setterAccount });
  // // Initialize RAMVault
  await that.RAMvault.initialize(that.RAMToken.address, that.YGYToken.address, devAccount, teamAddr, rengeneratorAddr, setterAccount, {
    from: setterAccount,
  });

  // Now we can initialize the FeeApprover contract
  await that.feeapprover.initialize(that.RAMToken.address, that.YGYToken.address, that.uniV2Factory.address, { from: setterAccount });

  await that.feeapprover.setPaused(false, { from: setterAccount });

  // Sets transferCheckerAddress() to setter account
  await that.RAMToken.setShouldTransferChecker(that.feeapprover.address, { from: setterAccount });
  await that.RAMToken.setFeeDistributor(that.RAMvault.address, { from: setterAccount });

  // The next 3 commands simulate a LGE where RAM/WETH is contributed and the contributor receives RAMPair tokens
  await that.YGYToken.transfer(that.YGYWETHPair.address, (4 * 1e18).toString(), { from: setterAccount });
  await that.weth.transfer(that.YGYWETHPair.address, (4 * 1e18).toString(), { from: setterAccount });
  await that.YGYWETHPair.mint(setterAccount);

  await that.YGYToken.transfer(that.YGYRAMPair.address, (5 * 1e18).toString(), { from: setterAccount });
  await that.RAMToken.transfer(that.YGYRAMPair.address, (5 * 1e18).toString(), { from: setterAccount });
  await that.YGYRAMPair.mint(setterAccount);

  // Deploy NFT Factory
  that.nftFactory = await NFTFactory.new({ from: setterAccount });
  that.nftAddrs = [];
  // Simulate NFT deployment to get NFT expected contract address, then deploy the NFT
  const NFT1 = await that.nftFactory.deployNFT(
    "RAM level 1",
    "RAMLEVEL1NFT",
    "https://run.mocky.io/v3/3da52de1-1e4f-4e7e-8ae7-b68be4278835",
    setterAccount,
    true,
    false,
    MAX_INT,
    {
      from: setterAccount,
    }
  );
  that.nftAddrs.push(NFT1.receipt.rawLogs[0].address);

  const NFT2 = await that.nftFactory.deployNFT(
    "RAM level 2",
    "RAMLEVEL2NFT",
    "https://run.mocky.io/v3/3da52de1-1e4f-4e7e-8ae7-b68be4278835",
    setterAccount,
    true,
    false,
    MAX_INT,
    {
      from: setterAccount,
    }
  );
  that.nftAddrs.push(NFT2.receipt.rawLogs[0].address);
  const NFT3 = await that.nftFactory.deployNFT(
    "RAM level 3",
    "RAMLEVEL3NFT",
    "https://run.mocky.io/v3/3da52de1-1e4f-4e7e-8ae7-b68be4278835",
    setterAccount,
    true,
    false,
    MAX_INT,
    {
      from: setterAccount,
    }
  );
  that.nftAddrs.push(NFT3.receipt.rawLogs[0].address);
  const NFT4 = await that.nftFactory.deployNFT(
    "RAM level 4",
    "RAMLEVEL4NFT",
    "https://run.mocky.io/v3/3da52de1-1e4f-4e7e-8ae7-b68be4278835",
    setterAccount,
    true,
    false,
    MAX_INT,
    {
      from: setterAccount,
    }
  );
  that.nftAddrs.push(NFT4.receipt.rawLogs[0].address);
  const NFT5 = await that.nftFactory.deployNFT(
    "RAM level 5",
    "RAMLEVEL5NFT",
    "https://run.mocky.io/v3/3da52de1-1e4f-4e7e-8ae7-b68be4278835",
    setterAccount,
    true,
    false,
    MAX_INT,
    {
      from: setterAccount,
    }
  );
  that.nftAddrs.push(NFT5.receipt.rawLogs[0].address);

  // Deploy a dummy dXIOT token to use as Robot NFT
  const NFTROBOT = await that.nftFactory.deployNFT(
    "RAM Robot NFT",
    "RAMROBOTNFT",
    "https://run.mocky.io/v3/3da52de1-1e4f-4e7e-8ae7-b68be4278835",
    setterAccount,
    false,
    true,
    50,
    {
      from: setterAccount,
    }
  );
  that.nftAddrs.push(NFTROBOT.receipt.rawLogs[0].address);

  // Deploy a dummy dXIOT token to use as Robot NFT
  const NFTLINK = await that.nftFactory.deployNFT(
    "RAM LINK NFT",
    "RAMLINKNFT",
    "https://run.mocky.io/v3/3da52de1-1e4f-4e7e-8ae7-b68be4278835",
    setterAccount,
    false,
    false,
    MAX_INT,
    {
      from: setterAccount,
    }
  );
  that.nftAddrs.push(NFTLINK.receipt.rawLogs[0].address);

  // deploy a dummy link token
  that.LINKToken = await ChainLinkToken.new("LINK", "LINK", web3.utils.toWei("200000"), { from: setterAccount });
  const BHashStore = await BlockHashStore.new();
  const VRF = await VRFCoordinator.new(that.LINKToken.address, BHashStore.address);
  // await VRFConsumerBase.new(VRF.address, that.LINKToken.address);
  // // Deploy RAMRouter contract
  that.RAMRouter = await UniRAMRouter.new(
    that.RAMToken.address,
    that.YGYToken.address,
    that.weth.address,
    that.uniV2Factory.address,
    that.YGYRAMPair.address,
    that.YGYWETHPair.address,
    that.feeapprover.address,
    that.RAMvault.address,
    that.nftFactory.address,
    that.nftAddrs,
    rengeneratorAddr,
    that.dxiotToken.address,
    that.LINKToken.address,
    VRF.address,
    { from: setterAccount }
  ).should.be.fulfilled;

  await that.LINKToken.approve(that.RAMRouter.address, web3.utils.toWei("10000000000"), { from: setterAccount });

  await that.YGYToken.approve(that.RAMRouter.address, web3.utils.toWei("10000000"), { from: setterAccount });
  await that.dxiotToken.approve(that.RAMRouter.address, MAX_INT, { from: setterAccount });
  // // Bond NFT factory and deploy NFTs using RAM router
  await that.nftFactory.bondContract(that.RAMRouter.address, { from: setterAccount });

  // // Deploy governance contract and set on router
  that.governance = await Governance.new(that.YGYToken.address, that.RAMRouter.address);
  that.RAMRouter.setGovernance(that.governance.address, { from: setterAccount });
};

module.exports = {
  initializeEnvironment,
  MAX_INT,
};
