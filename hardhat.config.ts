import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-web3";
import "@nomiclabs/hardhat-ethers";
import "hardhat-deploy-ethers";
// import "hardhat-typechain";
import "hardhat-contract-sizer";
import "hardhat-deploy";
import { removeConsoleLog } from "hardhat-preprocessor";

const { mainnetProvider, kovanProvider, privateKey, etherscanApiKey, kovanPrivateKey } = require("./password");

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    kovan: {
      url: kovanProvider,
      accounts: [kovanPrivateKey],
    },
  },
  solidity: {
    version: "0.6.12",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
      1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
      4: "0xA296a3d5F026953e17F472B497eC29a5631FB51B", // but for rinkeby it will be a specific address
      goerli: "0x84b9514E013710b9dD0811c9Fe46b837a4A0d8E0", //it can also specify a specific netwotk name (specified in hardhat.config.js)
    },
    devaddr: {
      default: 1,
    },
    teamaddr: {
      default: 2,
    },
    regeneratoraddr: {
      default: 3,
    },
    user1: {
      default: 4,
    },
    user2: {
      default: 5,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
    deploy: "./deploy",
    deployments: "./deployments",
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    disambiguatePaths: false,
  },
  typechain: {
    outDir: "./types",
    target: "ethers-v5",
  },
  preprocess: {
    eachLine: removeConsoleLog((bre) => bre.network.name !== "hardhat" && bre.network.name !== "localhost"),
  },
};
