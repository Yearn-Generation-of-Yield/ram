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

  const RAMRouter = await ethers.getContractAt("RAMv1Router", "0xb300f486cBc745fE13A4f8BcA30312bdc9644640", deployerSigner);
  const UNIRouter = await ethers.getContractAt("UniswapV2Router02", "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", deployerSigner);
  const YGY = await ethers.getContract("YGY");
  const weth = await ethers.getContract("WETH9");
  const DXIOT = await ethers.getContract("dXIOT");
  let allowance = await YGY.allowance(deployer, RAMRouter.address);
  let dxiotBalancce = await DXIOT.balanceOf(RAMRouter.address);
  console.log("YGY allowance for router is:", allowance / 1e18);
  console.log("dXIOT balance in router is:", dxiotBalancce / 1e18);

  console.log("Adding liquidity YGY");
  await weth.approve(RAMRouter.address, ethers.utils.parseEther("1000000000"));
  await weth.approve(UNIRouter.address, ethers.utils.parseEther("1000000000"));
  const tx = await RAMRouter.connect(deployerSigner).addLiquidityYGYOnly(ethers.utils.parseEther("10"), true);
  const rec = await tx.wait();
  console.log(rec);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
