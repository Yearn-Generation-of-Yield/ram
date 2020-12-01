const { ethers, Wallet, ContractFactory, Provider } = require("ethers");
const fs = require('fs');

const unpackArtifact = (artifactPath) => {
    let contractData = JSON.parse(fs.readFileSync(artifactPath))
    const contractBytecode = contractData['bytecode']
    const contractABI = contractData['abi']
    const constructorArgs = contractABI.filter((itm) => {
        return itm.type == 'constructor'
    })
    let constructorStr;
    if(constructorArgs.length < 1) {
        constructorStr = "    -- No constructor arguments -- "
    }
    else {
        constructorJSON = constructorArgs[0].inputs
        constructorStr = JSON.stringify(constructorJSON.map((c) => {
            return {
                name: c.name,
                type: c.type
            }
        }))
    }
    return {
        abi: contractABI,
        bytecode: contractBytecode,
        description:`  ${contractData.contractName}\n    ${constructorStr}`
    }
}

const logDeployTx = (contractABI, contractBytecode, args = []) => {
    const factory = new ContractFactory(contractABI, contractBytecode)
    let deployTx;
    if(args.length === 0) {
        deployTx = factory.getDeployTransaction()
    }
    else {
        deployTx = factory.getDeployTransaction(...args)
    }
    console.log(deployTx)
}

const getContractDeploymentTxFor = async (artifactPath, args) => {
    // Get the built metadata for our contracts
    let contractUnpacked = unpackArtifact(artifactPath)
    console.log(contractUnpacked.description)
    logDeployTx(contractUnpacked.abi, contractUnpacked.bytecode, args)
}



// fill out data for steps as you go
let deployedProxyAdminAddress = "";
let deployedRAMVaultAddress = "";
let deployedProxy = "";
let deployedFeeApprover = "";
let ramTokenAddress = ""
let devAddr = ""

// Step 1.
// Deploy proxy admin contract and get the address..
if(!deployedProxyAdminAddress) {
    getContractDeploymentTxFor(
        "./prodartifacts/ProxyAdmin.json"
    );
    return;
}

// Step 2.
// Deploy the RAMVault logic
if(!deployedRAMVaultAddress) {
    getContractDeploymentTxFor(
        "./prodartifacts/RAMVault.json"
    )
    return;
}

// Step 3.
// Deploy the proxy for RAMVault logic
if(!deployedProxy) {
    getContractDeploymentTxFor(
        "./build/contracts/AdminUpgradeabilityProxy.json",
        [
            deployedRAMVaultAddress, /*logic*/
            deployedProxyAdminAddress, /*admin*/
            []
            // ["64c0c53b8b", ramTokenAddress, devAddr, devAddr]
            /*[1,2,3] skip initialization */
        ]
    );
    return;
}

// Step 4.
// Call initializer on the proxied RAMVault

// Step 5.
// Release FeeApprover
if(!deployedFeeApprover) {
    getContractDeploymentTxFor(
        "./prodartifacts/FeeApprover.json"
    )
    return;
}
