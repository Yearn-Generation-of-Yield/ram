// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  const UNIFACTORY = {
    address: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
  };
  const RAMRouter = await ethers.getContract("RAMv1Router");
  const FEEAPPROVER = await ethers.getContract("FeeApprover");
  const VAULTPROXY = await ethers.getContract("VaultProxy");
  const NFTFACTORY = await ethers.getContract("NFTFactory");
  const YGYSTORAGE = await ethers.getContract("YGYStorageV1");
  const args = [
    UNIFACTORY.address.toString(),
    FEEAPPROVER.address.toString(),
    "0x4e445AD37B1b52d0Afb494e1cA52f8DC9ADafdeD",
    "0x1194664167761e76ef2A7E17959FF6eb687fC6ac",
    "0x7D60283E2Fad83bb81356F317009304082734D36",
    "0x9070233ce9aBCA46688af3ca185cd3C9e20Ad4D7",
    "0xa36085F69e2889c224210F603D836748e7dC0088",
    "0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9", // VRF KOVAN
  ];

  await hre.run("verify", {
    network: hre.network.name,
    address: RAMRouter.address,
    constructorArguments: args,
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
