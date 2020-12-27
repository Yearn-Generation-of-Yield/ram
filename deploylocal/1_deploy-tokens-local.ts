import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { parseUnits } from "ethers/lib/utils";

const separator = () => console.log("-----------------------------------------");

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, ethers } = hre;
  const { parseEther, formatEther } = ethers.utils;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  //@ts-ignore
  const UNIFactory = await ethers.getContract("UniswapV2Factory");

  await deploy("ChainLinkToken", {
    from: deployer,
    log: true,
    args: ["LINK", "LINK", parseEther("20000")],
  });
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
    args: [parseUnits("2000000", 6)],
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
