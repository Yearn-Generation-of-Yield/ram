import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, ethers } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();
  const UNI = await deploy("UniswapV2Factory", {
    from: deployer,
    log: true,
    args: [deployer],
  });
  console.log("UNIFactory at:", UNI.address);
};

export default func;
