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
  const YGY = await ethers.getContractAt("YGY", "0x938842c3e97755D049b77FC586Dc26cB5d608911", deployerSigner);
  await YGY.connect(deployerSigner).approve("0x98AA54AcA23d9fd3164798a6056E0371a56Db7A7", "100000000000000000000000");

  const RAMVault = await ethers.getContractAt("RAMVault", "0x98AA54AcA23d9fd3164798a6056E0371a56Db7A7", deployerSigner);
  let tx = await RAMVault.addYGYRewardsOwner(ethers.utils.parseEther("100"));

  await tx.wait();

  tx = await RAMVault.massUpdatePools();
  await tx.wait();

  const feeApprover = await ethers.getContract("FeeApprover");
  await feeApprover.sync();
  console.log("Mass updated");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
