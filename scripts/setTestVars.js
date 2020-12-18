const setTestVars = async (that, ethers, deployments) => {
  const VaultProxy = await ethers.getContract("VaultProxy");
  that.RAMVault = await ethers.getContractAt("RAMVault", VaultProxy.address);
  console.log(that.RAMVault.address);
  that.RAMRouter = await ethers.getContract("RAMv1Router");
  that.Governance = await ethers.getContract("Governance");
  that.YGY = await ethers.getContract("YGY");
  that.RAM = await ethers.getContract("RAM");
  that.dXIOT = await ethers.getContract("dXIOT");
  that.WETH = await ethers.getContract("WETH9");
  that.FeeApprover = await ethers.getContract("FeeApprover");
  that.ChainLink = await ethers.getContract("ChainLinkToken");
  that.NFTFactory = await ethers.getContract("NFTFactory");
  that.Storage = await ethers.getContract("YGYStorageV1");

  // Test addresses
  that.YGYWETHPair = await ethers.getContractAt("UniswapV2Pair", "0xEE75046FBF74f97380389AA26d9952E72e0E822B");
  that.YGYRAMPair = await ethers.getContractAt("UniswapV2Pair", "0x1D13930cD4a33a4A4D2038e4CAB566052485B8a1");
};

module.exports = {
  setTestVars,
};
