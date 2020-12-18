// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  const { ethers, getNamedAccounts } = hre;
  const { deployer } = await getNamedAccounts();

  //@ts-ignore
  const deployerSigner = await hre.ethers.getSigner(deployer);

  const VaultProxy = await ethers.getContract("VaultProxy");
  const RAMVault = await ethers.getContractAt("RAMVault", VaultProxy.address, deployerSigner);
  const YGYRAMPair = await ethers.getContractAt("UniswapV2Pair", "0xa4c0817cCb516C15Bc0a7c2F8038520042c34795");
  console.log("Adding a pool for", YGYRAMPair.address);
  let tx = await RAMVault.addPool(100, YGYRAMPair.address, true);
  await tx.wait();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
