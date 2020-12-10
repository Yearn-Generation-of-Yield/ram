import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import "hardhat-deploy-ethers";

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

  await deploy("ChainLinkToken", {
    from: deployer,
    log: true,
    args: ["LINK", "LINK", parseEther("20000")],
  });

  // deploy testnet tokens
  const WETH = await deploy("WETH9", {
    from: deployer,
    log: true,
  });

  const weth = await ethers.getContractAt("WETH9", WETH.address);
  weth.deposit({ from: deployer, value: (5e18).toString() });

  await deploy("YGY", {
    from: deployer,
    log: true,
    args: ["YGY", "YGY", parseEther("20000")],
  });

  await deploy("dXIOT", {
    from: deployer,
    log: true,
    args: ["dXIOT", "dXIOT", parseEther("20000")],
  });

  // const _LogicV1 = await deploy("LogicV1", {
  //   from: deployer,
  //   log: true,
  //   args: ["Hello!"],
  // });

  // const _Delegator = await deploy("Delegator", {
  //   from: deployer,
  //   log: true,
  //   args: [_LogicV1.address],
  // });

  // const _ProxyV1 = await deploy("ProxyV1", {
  //   from: deployer,
  //   log: true,
  // });

  // const ProxyV1 = await ethers.getContractAt(_ProxyV1.abi, _ProxyV1.address);
  // await ProxyV1.initialize(_Delegator.address, _StorageV1.address);

  // const Logic = await ethers.getContractAt(_LogicV1.abi, _ProxyV1.address);
  // console.log(_ProxyV1.abi);
  // const greeting = await Logic.greet();
  // const name = await await ethers.getContractAt(_StorageV1.abi, ProxyV1._storage());

  // console.log(greeting, name);
};

export default func;
