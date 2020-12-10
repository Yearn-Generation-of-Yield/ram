const setTestVars = async (that, ethers, deployments) => {
  const VaultProxy = await ethers.getContract("VaultProxy");
  that.RAMVault = await ethers.getContractAt("RAMVault", VaultProxy.address);
  that.RAMRouter = await ethers.getContract("RAMv1Router");
  that.Governance = await ethers.getContract("Governance");
  that.YGY = await ethers.getContract("YGY");
  that.RAM = await ethers.getContract("RAM");
  that.WETH = await ethers.getContract("WETH9");
  that.FeeApprover = await ethers.getContract("FeeApprover");

  // Test addresses
  that.YGYWETHPair = await ethers.getContractAt("UniswapV2Pair", "0x65604d6dDB85ed0A629BC3a3b5f7C2d2622d9F09");
  that.YGYRAMPair = await ethers.getContractAt("UniswapV2Pair", "0x6fAE32Fe7b291639924c2f89baD54cAd958a1729");
};

module.exports = {
  setTestVars,
};
