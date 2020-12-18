import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const separator = () => console.log("-----------------------------------------");

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, ethers } = hre;
  const { parseEther, formatEther } = ethers.utils;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  //@ts-ignore
  const deployerSigner = await ethers.getSigner(deployer);
  //@ts-ignore
  const UNIFactory = await ethers.getContractAt("UniswapV2Factory", "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f", deployerSigner);
  separator();

  // deploy testnet tokens
  const WETH = await deploy("WETH9", {
    from: deployer,
    log: true,
  });

  separator();

  const YGY = await deploy("YGY", {
    from: deployer,
    log: true,
    args: ["YGY", "YGY", parseEther("2000000")],
  });

  separator();

  await deploy("RAM", {
    from: deployer,
    log: true,
    args: [UNIFactory.address, YGY.address, deployer], //  *  MAINNET: REAL UNI, YGY AND TREASURYADDRESSES
  });

  separator();

  await deploy("dXIOT", {
    from: deployer,
    log: true,
    args: ["dXIOT", "dXIOT", parseEther("2000000")],
  });
  separator();
};

export default func;
