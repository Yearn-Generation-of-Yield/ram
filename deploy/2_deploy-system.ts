import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
const MAX_INT = "11579208923731619542357098500868790785326998466564056403945758400791312963993";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, getUnnamedAccounts, ethers } = hre;
  const { deploy, execute } = deployments;
  const { parseEther, formatEther } = ethers.utils;

  const { deployer } = await getNamedAccounts();
  const [, devAddr, teamAddr, regeneratorAddr] = await getUnnamedAccounts();
  const [deployerSigner] = await ethers.getSigners();

  //@ts-ignore
  const UNIFactory = await ethers.getContract("UniswapV2Factory");
  //@ts-ignore
  const YGY = await ethers.getContract("YGY");
  //@ts-ignore
  const RAM = await ethers.getContract("RAM");
  //@ts-ignore
  const WETH = await ethers.getContract("WETH9");
  //@ts-ignore
  const dXIOT = await ethers.getContract("dXIOT");
  //@ts-ignore
  const ChainLink = await ethers.getContract("ChainLinkToken");

  /** CHAINLINK FOR TESTING PURPOSES */
  const BHASHSTORE = await deploy("BlockhashStore", {
    from: deployer,
    log: true,
  });

  const VRF = await deploy("VRFCoordinator", {
    from: deployer,
    log: true,
    args: [ChainLink.address, BHASHSTORE.address],
  });

  /** GENERATE PAIRS */

  const pairtx1 = await UNIFactory.createPair(WETH.address, YGY.address, { from: deployer });
  const pairtx2 = await UNIFactory.createPair(RAM.address, YGY.address, { from: deployer });
  const txres = await pairtx1.wait();
  const txres2 = await pairtx2.wait();

  /** STORAGE DEPLOY */
  const YGYSTORAGE = await deploy("YGYStorageV1", {
    from: deployer,
  });

  // Deployed instance
  const YGYStorage = await ethers.getContractAt("YGYStorageV1", YGYSTORAGE.address, deployerSigner);

  // Init for access control
  await YGYStorage.init({ from: deployer });

  /** NFT'S */
  const NFTFACTORY = await deploy("NFTFactory", {
    from: deployer,
    log: true,
    args: [YGYStorage.address],
  });

  // Deployed instance
  const NFTFactory = await ethers.getContractAt("NFTFactory", NFTFACTORY.address, deployerSigner);

  const nfts = [];

  /** NFT DEPLOYMENTS  */
  const NFT1TX = await NFTFactory.deployNFT(
    "RAM LEVEL 1",
    "RAM1",
    "https://run.mocky.io/v3/3da52de1-1e4f-4e7e-8ae7-b68be4278835",
    0,
    2,
    deployer,
    true,
    false,
    MAX_INT,
    { from: deployer }
  );

  const NFT1 = await NFT1TX.wait();

  nfts.push(NFT1.logs[0].address);

  // Pair address is third arg for the PairCreated event.
  const YGYWETHAddr = txres.events[0].args[2];
  const YGYRAMAddr = txres2.events[0].args[2];

  const YGYWETHPair = await ethers.getContractAt("UniswapV2Pair", YGYWETHAddr, deployerSigner);
  const YGYRAMPair = await ethers.getContractAt("UniswapV2Pair", YGYRAMAddr, deployerSigner);

  /** VAULT DEPLOY */
  const RAMVAULT = await deploy("RAMVault", {
    from: deployer,
    log: true,
  });

  // just sets boost values for storage..
  YGYStorage.initializeRAMVault();

  // Deployed instance
  const RAMvault = await ethers.getContractAt("RAMVault", RAMVAULT.address, deployerSigner);

  // Initialize addresses.
  await RAMvault.initialize(deployer, regeneratorAddr, devAddr, teamAddr);

  // Deploy a proxy for Vault
  const VAULTPROXY = await deploy("VaultProxy", {
    from: deployer,
    log: true,
  });

  const VaultProxy = await ethers.getContractAt("VaultProxy", VAULTPROXY.address, deployerSigner);
  await VaultProxy.initialize(RAMVAULT.address, YGYStorage.address);

  /** FEEAPPROVER */
  const FEEAPPROVER = await deploy("FeeApprover", {
    from: deployer,
    log: true,
  });

  // Feeapprover instancec
  const FeeApprover = await ethers.getContractAt("FeeApprover", FEEAPPROVER.address, deployerSigner);

  // Now we can initialize the FeeApprover contract
  await FeeApprover.initialize(RAM.address, YGY.address, UNIFactory.address);

  await FeeApprover.setPaused(false, { from: deployer });
  await YGYStorage.setTokens(RAM.address, YGY.address, WETH.address, YGYRAMPair.address, YGYWETHPair.address, nfts, dXIOT.address);
  /** ROUTER */
  const RAMROUTER = await deploy("RAMv1Router", {
    from: deployer,
    log: true,
    args: [
      UNIFactory.address,
      FEEAPPROVER.address,
      VAULTPROXY.address,
      NFTFACTORY.address,
      regeneratorAddr,
      YGYSTORAGE.address,
      ChainLink.address,
      VRF.address,
    ],
  });

  await YGYStorage.setModifierContracts(VaultProxy.address, RAMROUTER.address, NFTFACTORY.address, { from: deployer });
  // Get router instnace
  const RAMRouter = await ethers.getContractAt("RAMv1Router", RAMROUTER.address, deployerSigner);

  // Initialize tokens
  await RAMRouter.setTokens({ from: deployer });

  // Sets transferCheckerAddress() to deployer account
  await RAM.setShouldTransferChecker(FEEAPPROVER.address, { from: deployer });
  await RAM.setFeeDistributor(VAULTPROXY.address, { from: deployer });

  // Deploy a proxy for Vault
  // const VAULTPROXY = await deploy("VaultProxy", {
  //   from: deployer,
  //   log: true,
  // });

  // The next 3 commands simulate a LGE where RAM/WETH is contributed and the contributor receives RAMPair tokens
  await YGY.transfer(YGYWETHAddr, parseEther("1"), { from: deployer });
  await WETH.transfer(YGYWETHAddr, parseEther("1"), { from: deployer });
  await YGYWETHPair.mint(deployer, { from: deployer });

  await YGY.transfer(YGYRAMAddr, parseEther("0.5"), { from: deployer });
  await RAM.transfer(YGYRAMAddr, parseEther("0.5"), { from: deployer });

  await YGYRAMPair.mint(deployer, { from: deployer });

  await ChainLink.approve(RAMRouter.address, MAX_INT, { from: deployer });

  await YGY.approve(RAMRouter.address, MAX_INT, { from: deployer });
  await dXIOT.approve(RAMRouter.address, MAX_INT, { from: deployer });
  // // Bond NFT factory and deploy NFTs using RAM router
  await NFTFactory.bondContract(RAMRouter.address, { from: deployer });

  // // Deploy governance contract and set on router
  const GOVERNANCE = await deploy("Governance", {
    from: deployer,
    log: true,
    args: [YGY.address, RAMRouter.address],
  });

  RAMRouter.setGovernance(GOVERNANCE.address, { from: deployer });
};

export default func;
