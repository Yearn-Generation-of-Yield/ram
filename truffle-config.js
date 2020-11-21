require("dotenv").config();
var HDWalletProvider = require("@truffle/hdwallet-provider");

const kovanProvider = new HDWalletProvider(process.env.PRIVATE_KEY, "https://kovan.infura.io/v3/".concat(process.env.INFURA_PROJECT_ID));

module.exports = {
  networks: {
    development: {
      protocol: 'http',
      host: 'localhost',
      port: 8545,
      gas: 5000000,
      gasPrice: 5e9,
      network_id: '*',
    },
    kovan: {
      provider: kovanProvider,
      network_id: 42,
      gas: 4600000
    }
  },
  compilers: {
    solc: {
      version: "0.6.12",
      docker: false,
      settings: {
       optimizer: {
         enabled: true,
         runs: 200
       }
      }
    }
  }
};
