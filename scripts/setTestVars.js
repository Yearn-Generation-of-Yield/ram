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
  that.YGYWETHPair = await ethers.getContractAt("UniswapV2Pair", "0x7c5956E649b71e416EC64586118a3a60D46Fe8e5");
  that.YGYRAMPair = await ethers.getContractAt("UniswapV2Pair", "0xa4c0817cCb516C15Bc0a7c2F8038520042c34795");
};

module.exports = {
  setTestVars,
};
