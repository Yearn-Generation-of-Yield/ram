import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import "hardhat-deploy-ethers";
const separator = () => console.log("-----------------------------------------");
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, ethers } = hre;
  const { parseEther, formatEther } = ethers.utils;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  //@ts-ignore
  const UNIFactory = await ethers.getContract("UniswapV2Factory");

  await deploy("RAM", {
    from: deployer,
    log: true,
    args: [UNIFactory.address],
  });

  separator();

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

  const weth = await ethers.getContractAt("WETH9", WETH.address);
  weth.deposit({ from: deployer, value: (5e18).toString() });

  await deploy("YGY", {
    from: deployer,
    log: true,
    args: ["YGY", "YGY", parseEther("20000")],
  });
  separator();

  await deploy("dXIOT", {
    from: deployer,
    log: true,
    args: ["dXIOT", "dXIOT", parseEther("20000")],
  });
  separator();
};

export default func;
