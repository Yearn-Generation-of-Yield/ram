var HDWalletProvider = require("truffle-hdwallet-provider");
const { kovanPrivateKey, kovanProvider, etherscanApiKey } = require("./password");

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 9545,
      network_id: "*", // Match any network id
      gas: 8000000,
    },
    kovan: {
      provider: function() {
        return new HDWalletProvider(kovanPrivateKey, kovanProvider);
      },
      network_id: "42",
      gasPrice: 10000000000,
      gas: 8200000,
    },
  },
  compilers: {
    solc: {
      version: "0.6.12",
      optimizer: {
        enabled: true,
        runs: 555,
      },
    },
  },
  plugins: ["truffle-plugin-verify"],
  api_keys: {
    etherscan: etherscanApiKey,
  },
};
