import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, ethers } = hre;
  const { deploy, execute } = deployments;

  const { deployer } = await getNamedAccounts();
  const [deployerSigner] = await ethers.getSigners();

  const YGYStorage = await deploy("YGYStorageV1", {
    from: deployer,
  });

  const RAMVAULT = await deploy("RAMVault", {
    from: deployer,
    log: true,
  });

  const VAULTPROXY = await deploy("VaultProxy", {
    from: deployer,
    log: true,
  });

  // initialize the vault implementation
  const VaultProxy = await ethers.getContractAt("VaultProxy", VAULTPROXY.address, deployerSigner);
  await VaultProxy.initialize(RAMVAULT.address, YGYStorage.address);

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
