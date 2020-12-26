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
  const YGY = await ethers.getContractAt("YGY", "0x11b0a8C0FA626627601eD518c3538a39d92D609E", deployerSigner);

  const treasury = "ADDRESS HERE"; // TODO: plug in treasury address

  await deploy("RAM", {
    from: deployer,
    log: true,
    args: [UNIFactory.address, YGY.address, treasury],
  });
};

export default func;
