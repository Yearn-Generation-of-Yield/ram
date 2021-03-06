import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const MAX_INT = "11579208923731619542357098500868790785326998466564056403945758400791312963993";
const separator = () => console.log("-----------------------------------------");

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, getUnnamedAccounts, ethers } = hre;
  const { deploy } = deployments;
  const { parseEther } = ethers.utils;

  const { deployer, devaddr, teamaddr, regeneratoraddr } = await getNamedAccounts();
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
  let tx = await YGYStorage.init({ from: deployer });
  await tx.wait();
  console.log("YGYStorage initialized");

  separator();
  /** NFT'S */
  const NFTFACTORY = await deploy("NFTFactory", {
    from: deployer,
    log: true,
    args: [YGYStorage.address],
  });
  separator();
  /** VAULT DEPLOY */
  const RAMVAULT = await deploy("RAMVault", {
    from: deployer,
    log: true,
  });
  separator();

  // just sets boost values for storage..
  tx = await YGYStorage.initializeRAMVault();
  await tx.wait();
  console.log("Initialized RAM vault values in storage");
  separator();

  /* Deploy a proxy for Vault  */
  const VAULTPROXY = await deploy("VaultProxy", {
    from: deployer,
    log: true,
  });
  separator();

  const VaultProxy = await ethers.getContractAt("VaultProxy", VAULTPROXY.address, deployerSigner);
  tx = await VaultProxy.setup(RAMVAULT.address, YGYStorage.address);
  await tx.wait();
  console.log("Proxy initialized at", VaultProxy.address, "with implementation of vault at:", RAMVAULT.address);
  separator();

  // Deployed instance using proxy
  const RAMVault = await ethers.getContractAt("RAMVault", VAULTPROXY.address, deployerSigner);
  tx = await RAMVault.initialize(deployer, regeneratoraddr, devaddr, teamaddr);
  await tx.wait();
  console.log("Initialized ram vault itself through proxy.");
  console.log("DEV:", devaddr, "TEAM", teamaddr, "regenerator", regeneratoraddr);
  separator();

  // Deployed instance
  const NFTFactory = await ethers.getContractAt("NFTFactory", NFTFACTORY.address, deployerSigner);

  const nfts = [];

  /** NFT DEPLOYMENTS  */
  console.log("Deploying NFT 1");
  tx = await NFTFactory.deployNFT(
    "RAM LEVEL 1",
    "RAM1",
    "https://run.mocky.io/v3/3da52de1-1e4f-4e7e-8ae7-b68be4278835",
    0,
    2,
    deployer,
    true,
    false,
    MAX_INT,
    VAULTPROXY.address
  );
  let receipt = await tx.wait();
  nfts.push(receipt.logs[0].address);

  console.log("Deploying NFT 2");
  tx = await NFTFactory.deployNFT(
    "RAM LEVEL 2",
    "RAM3",
    "https://run.mocky.io/v3/3da52de1-1e4f-4e7e-8ae7-b68be4278835",
    1,
    2,
    deployer,
    true,
    false,
    MAX_INT,
    VAULTPROXY.address
  );
  receipt = await tx.wait();
  nfts.push(receipt.logs[0].address);

  console.log("Deploying NFT 3");
  tx = await NFTFactory.deployNFT(
    "RAM LEVEL 3",
    "RAM3",
    "https://run.mocky.io/v3/3da52de1-1e4f-4e7e-8ae7-b68be4278835",
    2,
    2,
    deployer,
    true,
    false,
    MAX_INT,
    VAULTPROXY.address
  );
  receipt = await tx.wait();
  nfts.push(receipt.logs[0].address);

  console.log("Deploying NFT 4");
  tx = await NFTFactory.deployNFT(
    "RAM LEVEL 4",
    "RAM4",
    "https://run.mocky.io/v3/3da52de1-1e4f-4e7e-8ae7-b68be4278835",
    3,
    2,
    deployer,
    true,
    false,
    MAX_INT,
    VAULTPROXY.address
  );

  receipt = await tx.wait();
  nfts.push(receipt.logs[0].address);

  console.log("Deploying NFT 5");
  tx = await NFTFactory.deployNFT(
    "RAM LEVEL 5",
    "RAM5",
    "https://run.mocky.io/v3/3da52de1-1e4f-4e7e-8ae7-b68be4278835",
    4,
    2,
    deployer,
    true,
    false,
    MAX_INT,
    VAULTPROXY.address
  );

  receipt = await tx.wait();
  nfts.push(receipt.logs[0].address);

  console.log("Deploying NFT 6");
  tx = await NFTFactory.deployNFT(
    "ROBOT",
    "ROBOT",
    "https://run.mocky.io/v3/3da52de1-1e4f-4e7e-8ae7-b68be4278835",
    5,
    1,
    deployer,
    false,
    true,
    50,
    VAULTPROXY.address
  );

  receipt = await tx.wait();
  nfts.push(receipt.logs[0].address);

  console.log("Deploying NFT 6");
  tx = await NFTFactory.deployNFT(
    "LINK",
    "LINK",
    "https://run.mocky.io/v3/3da52de1-1e4f-4e7e-8ae7-b68be4278835",
    6,
    1,
    deployer,
    false,
    false,
    MAX_INT,
    VAULTPROXY.address
  );

  receipt = await tx.wait();
  nfts.push(receipt.logs[0].address);
  console.table(nfts);

  // Robot and LINK nft share same props.
  tx = await YGYStorage.setNFTPropertiesForContract(nfts[0], [
    ["Something special", 11111, ethers.utils.formatBytes32String("Coming soon")],
    ["Even more special", 24224, ethers.utils.formatBytes32String("Coming soon")],
  ]);
  await tx.wait();
  tx = await YGYStorage.setNFTPropertiesForContract(nfts[1], [
    ["Something special", 17244, ethers.utils.formatBytes32String("Coming soon")],
    ["Even more special", 194294, ethers.utils.formatBytes32String("Coming soon")],
  ]);
  await tx.wait();
  tx = await YGYStorage.setNFTPropertiesForContract(nfts[2], [
    ["Something special", 14233, ethers.utils.formatBytes32String("Coming soon")],
    ["Even more special", 23123139, ethers.utils.formatBytes32String("Coming soon")],
  ]);
  await tx.wait();
  tx = await YGYStorage.setNFTPropertiesForContract(nfts[3], [
    ["Something special", 41411, ethers.utils.formatBytes32String("Coming soon")],
    ["Even more special", 23132392, ethers.utils.formatBytes32String("Coming soon")],
  ]);
  await tx.wait();
  tx = await YGYStorage.setNFTPropertiesForContract(nfts[4], [
    ["Something special", 50000, ethers.utils.formatBytes32String("Coming soon")],
    ["Even more special", 239329392, ethers.utils.formatBytes32String("Coming soon")],
  ]);
  await tx.wait();
  tx = await YGYStorage.setNFTPropertiesForContract(nfts[5], [["boost", 10, ethers.utils.formatBytes32String("Your special")]]);
  await tx.wait();
  tx = await YGYStorage.setNFTPropertiesForContract(nfts[6], [["boost", 10, ethers.utils.formatBytes32String("Your special")]]);
  await tx.wait();
  console.log("Total NFTs deployed: ", nfts.length);
  separator();

  /** GENERATE YGY-WETH UNI PAIR   (TEST-ONLY) */
  tx = await UNIFactory.createPair(WETH.address, YGY.address, { from: deployer });
  const txres = await tx.wait();

  // Pair address is third arg for the PairCreated event.
  const YGYWETHAddr = txres.events[0].args[2];
  const YGYRAMAddr = await RAM.tokenUniswapPair();
  const YGYRAMPair = await ethers.getContractAt("UniswapV2Pair", YGYRAMAddr);
  const YGYWETHPair = await ethers.getContractAt("UniswapV2Pair", YGYWETHAddr);
  console.log("Uniswap pairs created - ", "YGYWETH:", YGYWETHPair.address, "YGYRAM:", YGYRAMPair.address);

  separator();
  /** FEEAPPROVER */
  const FEEAPPROVER = await deploy("FeeApprover", {
    from: deployer,
    log: true,
  });
  separator();

  // Feeapprover instance
  const FeeApprover = await ethers.getContractAt("FeeApprover", FEEAPPROVER.address, deployerSigner);

  // Now we can initialize the FeeApprover contract
  tx = await FeeApprover.initialize(RAM.address, YGY.address, UNIFactory.address, RAMVault.address);
  await tx.wait();
  console.log("FeeApprover initialized");
  tx = await FeeApprover.setPaused(false);
  await tx.wait();

  separator();

  // Set tokens to storage
  tx = await YGYStorage.setTokens(RAM.address, YGY.address, WETH.address, YGYRAMPair.address, YGYWETHPair.address, nfts, dXIOT.address);
  await tx.wait();

  /** ROUTER */
  const RAMROUTER = await deploy("RAMv1Router", {
    from: deployer,
    log: true,
    args: [
      UNIFactory.address,
      FEEAPPROVER.address,
      VAULTPROXY.address,
      NFTFACTORY.address,
      regeneratoraddr,
      YGYSTORAGE.address,
      ChainLink.address,
      VRF.address,
    ],
  });
  tx = await dXIOT.connect(deployerSigner).approve(RAMROUTER.address, MAX_INT);
  await tx.wait();

  tx = await dXIOT.transfer(RAMROUTER.address, parseEther("2000"));
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

  // * NOTE: Initial LP supply used with the uniswap router
  await deploy("UniswapV2Router02", {
    from: deployer,
    log: true,
    args: [UNIFactory.address, WETH.address],
  });

  //@ts-ignore
  const Router = await ethers.getContract("UniswapV2Router02");

  tx = await RAM.approve(Router.address, parseEther("1000000000000000000"));
  await tx.wait();
  tx = await YGY.approve(Router.address, parseEther("1000000000000000000"));
  await tx.wait();

  const initialSupplyTx = await Router.addLiquidity(
    YGY.address,
    RAM.address,
    parseEther("10000"),
    parseEther("10000"),
    parseEther("10000"),
    parseEther("10000"),
    deployer,
    Date.now() + 100000000 / 1000
  );
  await initialSupplyTx.wait();

  tx = await WETH.approve(Router.address, MAX_INT);
  await tx.wait();

  console.log("Adding liquidity to YGYWETH");
  const weth = await ethers.getContractAt("WETH9", WETH.address);
  tx = await weth.connect(deployerSigner).deposit({ from: deployer, value: parseEther("1") });
  await tx.wait();
  tx = await Router.addLiquidity(
    YGY.address,
    WETH.address,
    parseEther("10"),
    parseEther("1"),
    parseEther("10"),
    parseEther("1"),
    deployer,
    Date.now() + 100000000 / 1000
  );
  await tx.wait();

  tx = await YGYRAMPair.sync();
  await tx.wait();

  tx = await FeeApprover.sync();
  await tx.wait();

  tx = await ChainLink.approve(RAMRouter.address, MAX_INT);
  await tx.wait();

  tx = await YGY.approve(RAMRouter.address, MAX_INT);
  await tx.wait();

  tx = await dXIOT.approve(RAMRouter.address, MAX_INT);
  await tx.wait();

  // // Bond NFT factory and deploy NFTs using RAM router
  tx = await NFTFactory.bondContract(RAMRouter.address);
  await tx.wait();

  // // Deploy governance contract and set on router
  const GOVERNANCE = await deploy("Governance", {
    from: deployer,
    log: true,
    args: [YGY.address, RAMRouter.address],
  });
  separator();

  tx = await RAMRouter.setGovernance(GOVERNANCE.address);
  await tx.wait();
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
