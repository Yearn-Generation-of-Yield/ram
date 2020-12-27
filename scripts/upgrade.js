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
  const Proxy = await ethers.getContract("VaultProxy");
  const owner = await Proxy.proxyOwner();
  // let tx = await Proxy.setup("0x7af2a68da367d8b6621ff6e15b911dbab0d94483", "0x1BAC3c3268Ee8Fb3a82443453CC83d1a9DCA3C11");
  // await tx.wait();
  console.log(owner);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
