import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const separator = () => console.log("-----------------------------------------");

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, ethers } = hre;
  const { parseEther, formatEther } = ethers.utils;
  const { deploy } = deployments;

  const { deployer, teamaddr, user1 } = await getNamedAccounts();

  //@ts-ignore
  const user1Signer = await ethers.getSigner(user1);
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

  const weth = await ethers.getContractAt("WETH9", WETH.address);
  weth.deposit({ from: deployer, value: parseEther("500") });
  weth.connect(user1Signer).deposit({ from: user1, value: parseEther("50") });

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
    args: ["dXIOT", "dXIOT", parseEther("20000")],
  });
  separator();
};

export default func;
