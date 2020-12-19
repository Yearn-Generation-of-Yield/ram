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
  const RAM = await ethers.getContract("RAM");

  // console.log("doing 20 transfers");
  // for (let i = 0; i < 20; i++) {
  //   console.log("transfer", i + 1);
  //   let tx = await RAM.transfer(deployer, ethers.utils.parseEther("1000"));
  //   await tx.wait();
  // }

  const RAMVault = await ethers.getContractAt("RAMVault", "0x946068D93E69312f6dd7C5211CBFe0f7EC227a95");
  console.log("mass update");
  tx = await RAMVault.massUpdatePools();
  await tx.wait();

  console.log("mass updated");
  console.log("feeapprover sync");
  const feeApprover = await ethers.getContract("FeeApprover");
  tx = await feeApprover.sync();
  await tx.wait();
  console.log("feeapprover sync ed");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
