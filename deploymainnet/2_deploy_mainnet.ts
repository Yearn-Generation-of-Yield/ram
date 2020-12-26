import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const MAX_INT = "11579208923731619542357098500868790785326998466564056403945758400791312963993";
const separator = () => console.log("-----------------------------------------");

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, getUnnamedAccounts, ethers } = hre;
  const { deploy } = deployments;
  const { parseEther } = ethers.utils;

  const { deployer } = await getNamedAccounts();
  const [deployerSigner] = await ethers.getSigners();

  //@ts-ignore
  const UNIFactory = await ethers.getContractAt("UniswapV2Factory", "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f");
  //@ts-ignore
  const YGY = await ethers.getContractAt("YGY", "0x11b0a8C0FA626627601eD518c3538a39d92D609E", deployerSigner);
  //@ts-ignore
  const RAM = await ethers.getContract("RAM");
  //@ts-ignore
  const WETH = await ethers.getContractAt("WETH9", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", deployerSigner);
  //@ts-ignore
  const dXIOT = await ethers.getContractAt("dXIOT", "0x8b6dd24bcb2d0aea92c3abd4eb11103a5db6d714", deployerSigner);
  //@ts-ignore
  const ChainLink = await ethers.getContractAt("YGY", "0x514910771af9ca656af840dff83e8264ecf986ca", deployerSigner);

  separator();

  /** STORAGE DEPLOY */
  const YGYSTORAGE = await deploy("YGYStorageV1", {
    from: deployer,
  });
  separator();

  // Deployed instance
  const YGYStorage = await ethers.getContractAt("YGYStorageV1", YGYSTORAGE.address, deployerSigner);

  // Init for access control
  let tx = await YGYStorage.init();
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

  // * SET FOR MAINNET
  let teamAddr = deployer; // TODO: update to YGY team address
  let devAddr = "0xA39d9eDDd61255828D965d8bEB7c9C63d4bA0EFB";
  let regeneratorAddr = "0x44C1758E5337BeFA9a95f051595857C99dF75052"; // REGENERATOR MAINNET

  tx = await RAMVault.initialize(deployer, regeneratorAddr, devAddr, teamAddr, NFTFACTORY.address);
  await tx.wait();
  //
  console.log("Initialized ram vault itself through proxy.");
  console.log("DEV:", devAddr, "TEAM", teamAddr, "regenerator", regeneratorAddr);
  separator();

  // Deployed instance
  const NFTFactory = await ethers.getContractAt("NFTFactory", NFTFACTORY.address, deployerSigner);

  const nfts = [];

  /** NFT DEPLOYMENTS  */
  console.log("Deploying NFT 1");
  tx = await NFTFactory.deployNFT(
    "RAM1",
    "RAM1",
    "https://run.mocky.io/v3/3da52de1-1e4f-4e7e-8ae7-b68be4278835",
    0,
    2,
    deployer,
    true,
    true,
    1000,
    VAULTPROXY.address
  );
  let receipt = await tx.wait();
  nfts.push(receipt.logs[0].address);

  console.log("Deploying NFT 2");
  tx = await NFTFactory.deployNFT(
    "RAM3",
    "RAM3",
    "https://run.mocky.io/v3/3da52de1-1e4f-4e7e-8ae7-b68be4278835",
    1,
    2,
    deployer,
    true,
    true,
    1000,
    VAULTPROXY.address
  );
  receipt = await tx.wait();
  nfts.push(receipt.logs[0].address);

  console.log("Deploying NFT 3");
  tx = await NFTFactory.deployNFT(
    "RAM3",
    "RAM3",
    "https://run.mocky.io/v3/3da52de1-1e4f-4e7e-8ae7-b68be4278835",
    2,
    2,
    deployer,
    true,
    true,
    500,
    VAULTPROXY.address
  );
  receipt = await tx.wait();
  nfts.push(receipt.logs[0].address);

  console.log("Deploying NFT 4");
  tx = await NFTFactory.deployNFT(
    "RAM4",
    "RAM4",
    "https://run.mocky.io/v3/3da52de1-1e4f-4e7e-8ae7-b68be4278835",
    3,
    1,
    deployer,
    true,
    true,
    200,
    VAULTPROXY.address
  );

  receipt = await tx.wait();
  nfts.push(receipt.logs[0].address);

  console.log("Deploying NFT 5");
  tx = await NFTFactory.deployNFT(
    "RAM5",
    "RAM5",
    "https://run.mocky.io/v3/3da52de1-1e4f-4e7e-8ae7-b68be4278835",
    4,
    1,
    deployer,
    true,
    true,
    200,
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
  console.log("Setting NFT PROPS");

  tx = await YGYStorage.setNFTPropertiesForContract(nfts[0], [
    ["boost-pool", 5, ethers.utils.formatBytes32String("Speed Up")],
    ["boost", 250000, ethers.utils.formatBytes32String("Super Sized Horns")],
  ]);
  await tx.wait();
  tx = await YGYStorage.setNFTPropertiesForContract(nfts[1], [
    ["boost", 250000, ethers.utils.formatBytes32String("Headbutt")],
    ["steal-non-il", 10, ethers.utils.formatBytes32String("Concussive shot")],
  ]);
  await tx.wait();
  tx = await YGYStorage.setNFTPropertiesForContract(nfts[2], [
    ["boost", 500000, ethers.utils.formatBytes32String("Extraly Wooly")],
    ["steal-non-il", 10, ethers.utils.formatBytes32String("Feinting Sheep")],
  ]);
  await tx.wait();
  tx = await YGYStorage.setNFTPropertiesForContract(nfts[3], [["boost", 1000000, ethers.utils.formatBytes32String("Ram")]]);
  await tx.wait();
  tx = await YGYStorage.setNFTPropertiesForContract(nfts[4], [["extend-active-nft", 1, ethers.utils.formatBytes32String("Locked Horns")]]);
  await tx.wait();
  tx = await YGYStorage.setNFTPropertiesForContract(nfts[5], [["boost", 10, ethers.utils.formatBytes32String("ROBOT")]]);
  await tx.wait();
  tx = await YGYStorage.setNFTPropertiesForContract(nfts[6], [["boost", 10, ethers.utils.formatBytes32String("LINK")]]);
  await tx.wait();
  console.log("Total NFTs deployed: ", nfts.length);
  separator();

  /** GENERATE YGY-WETH UNI PAIR   (TEST-ONLY) */
  const pairtx1 = await UNIFactory.createPair(WETH.address, YGY.address, { from: deployer });
  const txres = await pairtx1.wait();

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
  const ROUTERConstructor = [
    UNIFactory.address,
    FEEAPPROVER.address,
    VAULTPROXY.address,
    NFTFACTORY.address,
    "0x44C1758E5337BeFA9a95f051595857C99dF75052", // REGENERATOR MAINNET
    YGYSTORAGE.address,
    ChainLink.address,
    "0xf0d54349aDdcf704F77AE15b96510dEA15cb7952", // VRF MAINNET
  ];
  const RAMROUTER = await deploy("RAMv1Router", {
    from: deployer,
    log: true,
    args: ROUTERConstructor,
  });

  separator();

  console.log(
    "Adding modifier rights for vault @ ",
    VaultProxy.address,
    " - router @ ",
    RAMROUTER.address,
    " - NFTFactory @ ",
    NFTFACTORY.address
  );
  tx = await YGYStorage.setModifierContracts(VaultProxy.address, RAMROUTER.address, NFTFACTORY.address);
  await tx.wait();
  console.log("Modifiers added");
  // Get router instnace
  const RAMRouter = await ethers.getContractAt("RAMv1Router", RAMROUTER.address, deployerSigner);

  // Initialize tokens
  tx = await RAMRouter.setTokens();
  await tx.wait();
  console.log("RAMRouter tokens set");
  separator();

  // Sets transferCheckerAddress() to deployer account
  tx = await RAM.setShouldTransferChecker(FEEAPPROVER.address);
  await tx.wait();
  tx = await RAM.setFeeDistributor(VAULTPROXY.address);
  await tx.wait();
  console.log("FeeDistributor and transferChecker set on RAM token");
  separator();

  // SET MAINNETs
  const Router = await ethers.getContractAt("UniswapV2Router02", "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D");

  console.log("Approving RAM & YGY for UNI Routter");
  tx = await RAM.approve(Router.address, parseEther("1000000000000000000"));
  await tx.wait();
  tx = await YGY.approve(Router.address, parseEther("1000000000000000000"));
  await tx.wait();

  console.log("Adding YGY RAM Liquidity");
  tx = await Router.addLiquidity(
    YGY.address,
    RAM.address,
    parseEther("10000"),
    parseEther("10000"),
    parseEther("10000"),
    parseEther("10000"),
    deployer,
    Date.now() + 100000000 / 1000
  );
  await tx.wait();

  separator();

  console.log("Approving weth");
  tx = await WETH.connect(deployerSigner).approve(Router.address, MAX_INT);
  await tx.wait();
  tx = await WETH.connect(deployerSigner).approve(RAMRouter.address, MAX_INT);
  await tx.wait();

  console.log("Adding liquidity to YGYWETH");
  const weth = await ethers.getContractAt("WETH9", WETH.address);
  tx = await weth.connect(deployerSigner).deposit({ from: deployer, value: parseEther("5") });
  await tx.wait();

  tx = await Router.addLiquidity(
    YGY.address,
    WETH.address,
    parseEther("5000"),
    parseEther("5"),
    parseEther("5000"),
    parseEther("5"),
    deployer,
    Date.now() + 1000000 / 1000
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

  // console.log("transferring DXIOT to router");
  // tx = await dXIOT.transfer(RAMRouter.address, parseEther("20000"));
  // await tx.wait();
  // // Bond NFT factory and deploy NFTs using RAM router
  tx = await NFTFactory.bondContract(RAMRouter.address);
  await tx.wait();

  // Deploy governance contract and set on router
  const GOVERNANCEArgs = [YGY.address, RAMRouter.address];
  const GOVERNANCE = await deploy("Governance", {
    from: deployer,
    log: true,
    args: GOVERNANCEArgs,
  });
  separator();

  tx = await RAMRouter.setGovernance(GOVERNANCE.address);
  await tx.wait();
  console.log("Governance set in RAMRouter at: ", GOVERNANCE.address);
  separator();

  console.log("Adding a pool for", YGYRAMPair.address);
  tx = await RAMVault.addPool(100, YGYRAMPair.address, true);
  await tx.wait();

  const all = await deployments.all();
  console.log("Deployment addresses");
  for (const deployment in all) {
    console.log(deployment, all[deployment].address);
  }
  separator();
  if (hre.network.name !== "hardhat") {
    console.log("trying to verify..");
    console.log("RAMRouter at:", RAMROUTER.address, "verifying...");
    await hre.run("verify", {
      network: hre.network.name,
      address: RAMROUTER.address,
      constructorArguments: ROUTERConstructor,
    });

    console.log("trying to verify  governance..");
    console.log("Governance at:", GOVERNANCE.address, "verifying...");
    await hre.run("verify", {
      network: hre.network.name,
      address: GOVERNANCE.address,
      constructorArguments: GOVERNANCEArgs,
    });
  }
};

export default func;
