import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const MAX_INT = "11579208923731619542357098500868790785326998466564056403945758400791312963993";
const separator = () => console.log("-----------------------------------------");

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, getUnnamedAccounts, ethers } = hre;
  const { deploy } = deployments;
  const { parseEther } = ethers.utils;

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

  separator();

  const VRF = await deploy("VRFCoordinator", {
    from: deployer,
    log: true,
    args: [ChainLink.address, BHASHSTORE.address],
  });

  separator();

  /** STORAGE DEPLOY */
  const YGYSTORAGE = await deploy("YGYStorageV1", {
    from: deployer,
  });
  separator();

  // Deployed instance
  const YGYStorage = await ethers.getContractAt("YGYStorageV1", YGYSTORAGE.address, deployerSigner);

  // Init for access control
  await YGYStorage.init({ from: deployer });
  console.log("YGYStorage initialized");

  separator();
  /** NFT'S */
  const NFTFACTORY = await deploy("NFTFactory", {
    from: deployer,
    log: true,
    args: [YGYStorage.address],
  });
  separator();

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
  const NFT2TX = await NFTFactory.deployNFT(
    "RAM LEVEL 2",
    "RAM3",
    "https://run.mocky.io/v3/3da52de1-1e4f-4e7e-8ae7-b68be4278835",
    1,
    2,
    deployer,
    true,
    false,
    MAX_INT,
    { from: deployer }
  );
  const NFT3TX = await NFTFactory.deployNFT(
    "RAM LEVEL 3",
    "RAM3",
    "https://run.mocky.io/v3/3da52de1-1e4f-4e7e-8ae7-b68be4278835",
    2,
    2,
    deployer,
    true,
    false,
    MAX_INT,
    { from: deployer }
  );
  const NFT4TX = await NFTFactory.deployNFT(
    "RAM LEVEL 4",
    "RAM4",
    "https://run.mocky.io/v3/3da52de1-1e4f-4e7e-8ae7-b68be4278835",
    3,
    2,
    deployer,
    true,
    false,
    MAX_INT,
    { from: deployer }
  );

  const NFT5TX = await NFTFactory.deployNFT(
    "RAM LEVEL 5",
    "RAM5",
    "https://run.mocky.io/v3/3da52de1-1e4f-4e7e-8ae7-b68be4278835",
    4,
    2,
    deployer,
    true,
    false,
    MAX_INT,
    { from: deployer }
  );
  const NFT6TX = await NFTFactory.deployNFT(
    "ROBOT",
    "ROBOT",
    "https://run.mocky.io/v3/3da52de1-1e4f-4e7e-8ae7-b68be4278835",
    5,
    1,
    deployer,
    false,
    true,
    50,
    { from: deployer }
  );
  const NFT7TX = await NFTFactory.deployNFT(
    "LINK",
    "LINK",
    "https://run.mocky.io/v3/3da52de1-1e4f-4e7e-8ae7-b68be4278835",
    6,
    1,
    deployer,
    false,
    false,
    MAX_INT,
    { from: deployer }
  );

  const receipts = await Promise.all([
    NFT1TX.wait(),
    NFT2TX.wait(),
    NFT3TX.wait(),
    NFT4TX.wait(),
    NFT5TX.wait(),
    NFT6TX.wait(),
    NFT7TX.wait(),
  ]);

  receipts.forEach((receipt) => {
    nfts.push(receipt.logs[0].address);
  });
  console.log("Total NFTs deployed: ", nfts.length);
  separator();

  /** GENERATE UNI PAIRS */

  const pairtx1 = await UNIFactory.createPair(WETH.address, YGY.address, { from: deployer });
  const pairtx2 = await UNIFactory.createPair(RAM.address, YGY.address, { from: deployer });
  const txres = await pairtx1.wait();
  const txres2 = await pairtx2.wait();

  // Pair address is third arg for the PairCreated event.
  const YGYWETHAddr = txres.events[0].args[2];
  const YGYRAMAddr = txres2.events[0].args[2];
  console.log("Uniswap pairs created - ", "YGYWETH:", YGYWETHAddr, "YGYRAM:", YGYRAMAddr);
  separator();

  const YGYWETHPair = await ethers.getContractAt("UniswapV2Pair", YGYWETHAddr, deployerSigner);
  const YGYRAMPair = await ethers.getContractAt("UniswapV2Pair", YGYRAMAddr, deployerSigner);

  /** VAULT DEPLOY */
  const RAMVAULT = await deploy("RAMVault", {
    from: deployer,
    log: true,
  });
  separator();
  // just sets boost values for storage..
  YGYStorage.initializeRAMVault();
  console.log("Initialized RAM vault values in storage");
  separator();
  // Deployed instance
  const RAMVault = await ethers.getContractAt("RAMVault", RAMVAULT.address, deployerSigner);

  // Initialize addresses.
  await RAMVault.initialize(deployer, regeneratorAddr, devAddr, teamAddr);
  console.log("Initialized ram vault itself:", RAMVault.address);
  separator();
  // Deploy a proxy for Vault
  const VAULTPROXY = await deploy("VaultProxy", {
    from: deployer,
    log: true,
  });
  separator();

  const VaultProxy = await ethers.getContractAt("VaultProxy", VAULTPROXY.address, deployerSigner);
  await VaultProxy.initialize(RAMVAULT.address, YGYStorage.address);
  console.log("Proxy initialized at", VaultProxy.address, "with implementation of vault at:", RAMVAULT.address);
  separator();
  /** FEEAPPROVER */
  const FEEAPPROVER = await deploy("FeeApprover", {
    from: deployer,
    log: true,
  });
  separator();

  // Feeapprover instancec
  const FeeApprover = await ethers.getContractAt("FeeApprover", FEEAPPROVER.address, deployerSigner);

  // Now we can initialize the FeeApprover contract
  await FeeApprover.initialize(RAM.address, YGY.address, UNIFactory.address);
  console.log("FeeApprover initialized");
  separator();
  await FeeApprover.setPaused(false);

  // Set tokens to storage
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
  console.log("RAMRouter at:", RAMROUTER.address);
  separator();

  await YGYStorage.setModifierContracts(VaultProxy.address, RAMROUTER.address, NFTFACTORY.address);
  // Get router instnace
  const RAMRouter = await ethers.getContractAt("RAMv1Router", RAMROUTER.address, deployerSigner);

  // Initialize tokens
  await RAMRouter.setTokens();
  console.log("RAMRouter tokens set");
  separator();
  // Sets transferCheckerAddress() to deployer account
  await RAM.setShouldTransferChecker(FEEAPPROVER.address);
  await RAM.setFeeDistributor(VAULTPROXY.address);
  console.log("FeeDistributor and transferChecker set on RAM token");
  separator();
  // The next 3 commands simulate a LGE where RAM/WETH is contributed and the contributor receives RAMPair tokens
  await YGY.transfer(YGYWETHAddr, parseEther("500"));
  await WETH.transfer(YGYWETHAddr, parseEther("50"));
  await YGYWETHPair.mint(deployer);

  await YGY.transfer(YGYRAMAddr, parseEther("1000"));
  await RAM.transfer(YGYRAMAddr, parseEther("1000"));

  await YGYRAMPair.mint(deployer);

  await ChainLink.approve(RAMRouter.address, MAX_INT);

  await YGY.approve(RAMRouter.address, MAX_INT);
  await dXIOT.approve(RAMRouter.address, MAX_INT);
  // // Bond NFT factory and deploy NFTs using RAM router
  await NFTFactory.bondContract(RAMRouter.address);

  // // Deploy governance contract and set on router
  const GOVERNANCE = await deploy("Governance", {
    from: deployer,
    log: true,
    args: [YGY.address, RAMRouter.address],
  });
  separator();

  RAMRouter.setGovernance(GOVERNANCE.address);
  console.log("Governance set in RAMRouter at: ", GOVERNANCE.address);
  separator();

  const all = await deployments.all();
  console.log("Deployment addresses");
  for (const deployment in all) {
    console.log(deployment, all[deployment].address);
  }
  separator();
};

export default func;
