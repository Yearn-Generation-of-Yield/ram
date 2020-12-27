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
  const treasury = "0xB865D0d3c38BF6e149731065413bd5Eb578C3c52";

  const RAMArgs = [UNIFactory.address, "0x11b0a8C0FA626627601eD518c3538a39d92D609E", treasury];
  // const RAM = await deploy("RAM", {
  //   from: deployer,
  //   log: true,
  //   args: RAMArgs,
  // });

  await hre.run("verify", {
    network: hre.network.name,
    address: "0xddec5cb890b066891151e5f6ffca101b4eb47409",
    constructorArguments: RAMArgs,
  });
};

export default func;
