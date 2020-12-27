import { parseUnits } from "ethers/lib/utils";
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
  const RAM = await ethers.getContractAt("RAM", "0xddec5cb890b066891151e5f6ffca101b4eb47409", deployerSigner);
  //@ts-ignore
  const WETH = await ethers.getContractAt("WETH9", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", deployerSigner);
  //@ts-ignore
  const dXIOT = await ethers.getContractAt("dXIOT", "0x8b6dd24bcb2d0aea92c3abd4eb11103a5db6d714", deployerSigner);
  //@ts-ignore
  const ChainLink = await ethers.getContractAt("YGY", "0x514910771af9ca656af840dff83e8264ecf986ca", deployerSigner);

  // separator();

  /** STORAGE DEPLOY */
  const YGYSTORAGE = await deploy("YGYStorageV1", {
    from: deployer,
    log: true,
  });
  separator();

  // // Deployed instance
  const YGYStorage = await ethers.getContractAt("YGYStorageV1", YGYSTORAGE.address, deployerSigner);

  // // Init for access control
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

  // // just sets boost values for storage..
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

  // @ts-ignore
  const VaultProxy = await ethers.getContractAt("VaultProxy", VAULTPROXY.address);
  // @ts-ignore
  tx = await VaultProxy.setup(RAMVAULT.address, YGYStorage.address);
  await tx.wait();

  console.log(
    "Proxy initialized at",
    VaultProxy.address,
    "with implementation of vault at:",
    RAMVAULT.address,
    "Storage at",
    YGYStorage.address
  );
  separator();

  // Deployed instance using proxy
  const RAMVault = await ethers.getContractAt("RAMVault", VAULTPROXY.address, deployerSigner);

  // * SET FOR MAINNET
  let teamAddr = "0xFC597788EF4D23a77081eA01Cf56f4cA340F546d";
  let devAddr = "0xA39d9eDDd61255828D965d8bEB7c9C63d4bA0EFB";
  let regeneratorAddr = "0x44C1758E5337BeFA9a95f051595857C99dF75052"; // REGENERATOR MAINNET

  tx = await RAMVault.initialize(deployer, regeneratorAddr, devAddr, teamAddr, NFTFACTORY.address);
  await tx.wait();
  // //
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

  const YGYWETHAddr = "0xa568b6f1173d6c6affd12655ac0eb22f766bbdb0";
  const YGYRAMAddr = await RAM.tokenUniswapPair();
  const YGYRAMPair = await ethers.getContractAt("UniswapV2Pair", YGYRAMAddr);
  const YGYWETHPair = await ethers.getContractAt("UniswapV2Pair", YGYWETHAddr);
  console.log("Uniswap pairs: ", "YGYWETH:", YGYWETHPair.address, "YGYRAM:", YGYRAMPair.address);

  separator();
  /** FEEAPPROVER */
  const FEEAPPROVER = await deploy("FeeApprover", {
    from: deployer,
    log: true,
  });
  separator();

  // Feeapprover instance
  const FeeApprover = await ethers.getContractAt("FeeApprover", FEEAPPROVER.address, deployerSigner);

  // // Now we can initialize the FeeApprover contract
  tx = await FeeApprover.initialize(RAM.address, YGY.address, UNIFactory.address, RAMVault.address);
  await tx.wait();
  console.log("FeeApprover initialized");
  tx = await FeeApprover.setPaused(false);
  await tx.wait();
  separator();

  // Set tokens to storage
  tx = await YGYStorage.setTokens(RAM.address, YGY.address, WETH.address, YGYRAMPair.address, YGYWETHPair.address, nfts, dXIOT.address);
  await tx.wait();
  // /** ROUTER */
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
    VAULTPROXY.address,
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

  // Bond NFT factory and deploy NFTs using RAM router
  tx = await NFTFactory.bondContract(RAMRouter.address);
  await tx.wait();

  const Governance = await ethers.getContractAt("Governance", "0x7E806e9166B3367c6f7E5bDE995258eF35Eb1527");
  tx = await RAMRouter.setGovernance(Governance.address);
  await tx.wait();
  console.log("Governance set in RAMRouter at: ", Governance.address);
  separator();

  // console.log("Adding a pool for", YGYRAMPair.address);
  tx = await RAMVault.addPool(100, YGYRAMPair.address, true);
  await tx.wait();

  tx = Governance.updateRouter(RAMRouter.address);
  await tx.wait();

  const all = await deployments.all();
  console.log("Deployment addresses");
  for (const deployment in all) {
    console.log(deployment, all[deployment].address);
  }
  // separator();
  // if (hre.network.name !== "hardhat") {
  //   console.log("trying to verify..");
  //   console.log("RAMRouter at:", RAMROUTER.address, "verifying...");
  //   await hre.run("verify", {
  //     network: hre.network.name,
  //     address: NFTFACTORY.address,
  //     constructorArguments: [YGYStorage.address],
  //   });

  //   await hre.run("verify", {
  //     network: hre.network.name,
  //     address: RAMROUTER.address,
  //     constructorArguments: ROUTERConstructor,
  //   });

  //   console.log("trying to verify  governance..");
  //   console.log("Governance at:", GOVERNANCE.address, "verifying...");
  //   await hre.run("verify", {
  //     network: hre.network.name,
  //     address: GOVERNANCE.address,
  //     constructorArguments: GOVERNANCEArgs,
  //   });
  // }
};

export default func;
