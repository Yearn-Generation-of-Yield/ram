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

  const RAM = await deploy("RAM", {
    from: deployer,
    log: true,
    args: [UNIFactory.address],
  });

  // deploy testnet tokens
  const WETH = await deploy("WETH9", {
    from: deployer,
    log: true,
  });
  const weth = await ethers.getContractAt("WETH9", WETH.address);
  weth.deposit({ from: deployer, value: (5e18).toString() });

  const YGY = await deploy("Token", {
    from: deployer,
    log: true,
    args: ["YGY", "YGY", parseEther("20000")],
  });

  await deploy("Token", {
    from: deployer,
    log: true,
    args: ["dXIOT", "dXIOT", parseEther("20000")],
  });

  const pairtx1 = await UNIFactory.createPair(WETH.address, YGY.address, { from: deployer });
  const pairtx2 = await UNIFactory.createPair(RAM.address, YGY.address, { from: deployer });

  const txres = await pairtx1.wait();
  const txres2 = await pairtx2.wait();

  const YGYWETHAddr = txres.events[0].args[0];
  const YGYRAMAddr = txres2.events[0].args[0];

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
