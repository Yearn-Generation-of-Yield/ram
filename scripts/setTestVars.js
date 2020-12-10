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
  that.YGYWETHPair = await ethers.getContractAt("UniswapV2Pair", "0xdD74F6b03C804134E19dB4a08Ca5031Fdb0FD398");
  that.YGYRAMPair = await ethers.getContractAt("UniswapV2Pair", "0xB36a5b09e7c54bfb171281f6ae755928B87809c4");
};

module.exports = {
  setTestVars,
};
