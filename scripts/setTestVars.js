const setTestVars = async (that, ethers, deployments) => {
  const VaultProxy = await ethers.getContract("VaultProxy");
  that.RAMVault = await ethers.getContractAt("RAMVault", VaultProxy.address);
  console.log(that.RAMVault.address);
  that.RAMRouter = await ethers.getContract("RAMv1Router");
  that.Governance = await ethers.getContract("Governance");
  that.YGY = await ethers.getContract("YGY");
  that.RAM = await ethers.getContract("RAM");
  that.WETH = await ethers.getContract("WETH9");
  that.FeeApprover = await ethers.getContract("FeeApprover");
  that.ChainLink = await ethers.getContract("ChainLinkToken");
  that.NFTFactory = await ethers.getContract("NFTFactory");
  that.Storage = await ethers.getContract("YGYStorageV1");

  // Test addresses
  that.YGYWETHPair = await ethers.getContractAt("UniswapV2Pair", "0xf6bfAFC3c2987aA67D620D6f2Ed576a4Dc84F662");
  that.YGYRAMPair = await ethers.getContractAt("UniswapV2Pair", "0x260FB9cc6a191e1fcD8a85e6f40D25b5E2245244");
};

module.exports = {
  setTestVars,
};
