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

// const deployTokenFromSigner = (contractABI, contractBytecode, wallet, args = []) => {

//     const factory = new ContractFactory(contractABI, contractBytecode)
//     let deployTx = factory.getDeployTransaction(...args)
//     console.log(deployTx)
//     // deployTokenFromSigner(tokenUnpacked.abi, tokenUnpacked.bytecode, provider, tokenArgs)
// }

// const getContractDeployTx = (contractABI, contractBytecode, wallet, provider, args = []) => {
//     const factory = new ContractFactory(contractABI, contractBytecode, wallet.connect(provider))
//     let txRequest = factory.getDeployTransaction(...args)
//     return txRequest
// }

const deployContract = async (contractABI, contractBytecode, wallet, provider, args = []) => {
    const factory = new ContractFactory(contractABI, contractBytecode, wallet.connect(provider))
    return await factory.deploy(...args);
}

const deployRAM = async (mnemonic = "", mainnet = false) => {

    // Get the built metadata for our contracts
    let ramTokenUnpacked = unpackArtifact("./build/contracts/RAM.json")
    let feeApproverUnpacked = unpackArtifact("./build/contracts/FeeApprover.json")
    let ygyTokenUnpacked = unpackArtifact("./build/contracts/Token.json")
    let ramVaultUnpacked = unpackArtifact("./build/contracts/RAMVault.json")
    let ramV1RouterUnpacked = unpackArtifact("./build/contracts/RAMv1Router.json")
    let governanceUnpacked = unpackArtifact("./build/contracts/Governance.json")
    let wethUnpacked = unpackArtifact("./build/contracts/WETH9.json")

    let provider;
    let wethAddress;
    const uniswapFactoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
    const uniswapRouterAddress = "0x7a250d5630b4cf539739df2c5dacb4c659f2488d";
    if(mainnet) {
        provider = ethers.getDefaultProvider("homestead")
        wethAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
    }
    else {
        provider = ethers.getDefaultProvider("kovan")
        wethAddress = "0xd0a1e359811322d97991e03f863a0c30c2cf029c"
    }

    // Do the deployments

    // Create a wallet and connect it to a network
    // First, the token
    // constructor(address router, address factory)

    // Connect to deployer wallet
    let wallet;
    let connectedWallet;
    if(mnemonic != "") {
        wallet = Wallet.fromMnemonic(mnemonic);
        connectedWallet = wallet.connect(provider);
    }

    console.log(connectedWallet)

    // Deploy YGY [TESTING: already deployed on mainnet]
    const ygyTokenArgs = ["YGY", "YGY", (20*1e18).toString()]
    const YGYToken = await deployContract(ygyTokenUnpacked.abi, ygyTokenUnpacked.bytecode, wallet, provider, ygyTokenArgs)
    console.log(`⌛ Deploying YGY token...`)
    await connectedWallet.provider.waitForTransaction(YGYToken.deployTransaction.hash)
    console.log(`✅ Deployed YGY token to ${YGYToken.address}`)

    // Deploy RAM
    const ramTokenArgs = [uniswapRouterAddress, uniswapFactoryAddress, YGYToken.address]
    const RAMtoken = await deployContract(ramTokenUnpacked.abi, ramTokenUnpacked.bytecode, wallet, provider, ramTokenArgs)
    console.log(`⌛ Deploying RAM token...`)
    await connectedWallet.provider.waitForTransaction(RAMtoken.deployTransaction.hash)
    console.log(`✅ Deployed RAM token to ${RAMtoken.address}`)

    // Deploy fee approver contract
    const feeApprover = await deployContract(feeApproverUnpacked.abi, feeApproverUnpacked.bytecode, wallet, provider, [])
    console.log(`⌛ Deploying feeApprover...`)
    await connectedWallet.provider.waitForTransaction(feeApprover.deployTransaction.hash)
    console.log(`✅ Deployed feeApprover.`)

    console.log(`⌛ feeApprover initialize...`)
    let initResult = await feeApprover.initialize(RAMToken.address, YGYToken.address, uniswapFactoryAddress);
    await connectedWallet.provider.waitForTransaction(initResult.hash)
    console.log(`✅ feeApprover initialized.`)

    console.log(`⌛ setPaused...`)
    let setPausedResult = await feeApprover.setPaused(false);
    await connectedWallet.provider.waitForTransaction(setPausedResult.hash)
    console.log(`✅ feeApprover unpaused.`)

    console.log(`⌛ setShouldTransferChecker...`)
    let setTransferCheckerResult = await RAMToken.setShouldTransferChecker(feeApprover.address);
    await connectedWallet.provider.waitForTransaction(setTransferCheckerResult.hash)
    console.log(`✅ Called setShouldTransferChecker(${feeApprover.address} on RAM token at ${RAMToken.address}`)

    console.log(`⌛ setFeeBearerResult...`)
    let setFeeBearerResult = await RAMToken.setFeeBearer(wallet.address) // TODO: investigate
    console.log(`✅ Called setFeeBearer(${wallet.address} on token at ${RAMToken.address})`)

    console.log(setTransferCheckerResult)
    console.log(setFeeBearerResult)

    // MAINNET SET UP
    // console.log(`⌛ calling createUniswapPairMainnet...`)
    // let tx = await token.createUniswapPairMainnet();
    // console.log(`⌛ createUniswapPairMainnet...`)
    // await connectedWallet.provider.waitForTransaction(tx.hash)
    // console.log(`✅ Called createUniswapPairMainnet() on token at ${RAMtoken.address}`)

    // TESTNET SET UP
    // Create a YGY-RAM pair on uniswap [FOR TESTING, this would be created by RAM constructor in production]
    const YGYRAMPair = await UniV2Pair.at((await this.uniV2Factory.createPair(RAMToken.address, YGYToken.address)));

    await YGYToken.transfer(YGYRAMPair.address, (5*1e18).toString());
    await RAMToken.transfer(YGYRAMPair.address, (5*1e18).toString());
    await YGYRAMPair.mint(wallet.address);


    // TODO: need contract instance
    // wethAddress.deposit(value: (5e18).toString() });

    // Mimic liquidity generator event
    // The next 3 commands simulate a LGE where RAM/WETH is contributed and the contributor receives RAMPair tokens
    const YGYWETHPair = await UniV2Pair.at((await this.uniV2Factory.createPair(wethAddress, YGYToken.address)));
    await YGYToken.transfer(YGYWETHPair.address, (0.01*1e18).toString());
    await weth.transfer(YGYWETHPair.address, (0.01*1e18).toString());
    await YGYWETHPair.mint(wallet.address);

    // Now let's set up the vault
    const RAMvault = await deployContract(ramVaultUnpacked.abi, ramVaultUnpacked.bytecode, wallet, provider, [])
    console.log(`✅ Deployed RAMvault ${RAMvault.address}`)

    // TODO: This won't get called on mainnet
    // let tx = await RAMVAULT.createUniswapPairMainnet();

    // TODO: add an actual rengeneratorAddr
    const rengeneratorAddr = wallet.address
    const ramRouterTokenArgs = [RAMToken.address, YGYToken.address, weth.address, uniswapFactoryAddress, YGYRAMPair.address, YGYWETHPair.address, feeapprover.address, RAMvault.address, rengeneratorAddr]
    const RAMRouter = await deployContract(ramV1RouterUnpacked.abi, ramV1RouterUnpacked.bytecode, wallet, provider, ramRouterTokenArgs)
    console.log(`✅ Deployed RAMRouter ${RAMRouter.address}`)

    // Deploy governance contract and set on router
    const governanceArgs = [YGYToken.address, RAMRouter.address];
    const governance = await deployContract(governanceUnpacked.abi, governanceUnpacked.bytecode, wallet, provider, governanceArgs)
    console.log(`✅ Deployed governance ${governance.address}`)

    console.log(`⌛ setGovernance...`)
    await RAMRouter.setGovernance(governance.address);
    console.log(`✅ Called setGovernance to (${governance.address} on RAMRouter at ${RAMRouter.address})`)

    // Initialize RAMVault
    console.log(`⌛ RAMvault initialize...`)
    // TODO: devAccount, teamAddr, regeneratorAddr, setterAccount
    await RAMvault.initialize(RAMToken.address, regeneratorAddr, regeneratorAddr, rengeneratorAddr, regeneratorAddr);
    console.log(`✅ Called initialize RAMvault at ${RAMvault.address})`)

    console.log("All done!")

}

// const mnemonic = "saddle earn oblige jeans wine flash insect custom rebuild scheme donkey bless";
const mnemonic = "below frequent call slush enhance floor banner grit turn habit bonus aim";
deployRAM(mnemonic, false);
