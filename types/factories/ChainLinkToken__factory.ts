/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, BigNumberish } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides } from "@ethersproject/contracts";

import type { ChainLinkToken } from "../ChainLinkToken";

export class ChainLinkToken__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(
    _name: string,
    _symbol: string,
    _initialSupply: BigNumberish,
    overrides?: Overrides
  ): Promise<ChainLinkToken> {
    return super.deploy(
      _name,
      _symbol,
      _initialSupply,
      overrides || {}
    ) as Promise<ChainLinkToken>;
  }
  getDeployTransaction(
    _name: string,
    _symbol: string,
    _initialSupply: BigNumberish,
    overrides?: Overrides
  ): TransactionRequest {
    return super.getDeployTransaction(
      _name,
      _symbol,
      _initialSupply,
      overrides || {}
    );
  }
  attach(address: string): ChainLinkToken {
    return super.attach(address) as ChainLinkToken;
  }
  connect(signer: Signer): ChainLinkToken__factory {
    return super.connect(signer) as ChainLinkToken__factory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ChainLinkToken {
    return new Contract(address, _abi, signerOrProvider) as ChainLinkToken;
  }
}

const _abi = [
  {
    inputs: [
      {
        internalType: "string",
        name: "_name",
        type: "string",
      },
      {
        internalType: "string",
        name: "_symbol",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "_initialSupply",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Paused",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "previousAdminRole",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "newAdminRole",
        type: "bytes32",
      },
    ],
    name: "RoleAdminChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "RoleGranted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "RoleRevoked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Unpaused",
    type: "event",
  },
  {
    inputs: [],
    name: "DEFAULT_ADMIN_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MINTER_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "PAUSER_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "burn",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "burnFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "subtractedValue",
        type: "uint256",
      },
    ],
    name: "decreaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
    ],
    name: "getRoleAdmin",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
    ],
    name: "getRoleMember",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
    ],
    name: "getRoleMemberCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "grantRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "hasRole",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "addedValue",
        type: "uint256",
      },
    ],
    name: "increaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "paused",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "renounceRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "revokeRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_value",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "_data",
        type: "bytes",
      },
    ],
    name: "transferAndCall",
    outputs: [
      {
        internalType: "bool",
        name: "success",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x60806040523480156200001157600080fd5b50604051620020ea380380620020ea833981810160405260608110156200003757600080fd5b81019080805160405193929190846401000000008211156200005857600080fd5b9083019060208201858111156200006e57600080fd5b82516401000000008111828201881017156200008957600080fd5b82525081516020918201929091019080838360005b83811015620000b85781810151838201526020016200009e565b50505050905090810190601f168015620000e65780820380516001836020036101000a031916815260200191505b50604052602001805160405193929190846401000000008211156200010a57600080fd5b9083019060208201858111156200012057600080fd5b82516401000000008111828201881017156200013b57600080fd5b82525081516020918201929091019080838360005b838110156200016a57818101518382015260200162000150565b50505050905090810190601f168015620001985780820380516001836020036101000a031916815260200191505b506040526020908101518551909350859250849183918391620001c19160049185019062000587565b508051620001d790600590602084019062000587565b50506006805461ff001960ff1990911660121716905550620002046000620001fe6200027a565b6200027e565b620002337f9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6620001fe6200027a565b620002627f65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a620001fe6200027a565b5062000271905033826200028e565b50505062000623565b3390565b6200028a8282620003a1565b5050565b6001600160a01b038216620002ea576040805162461bcd60e51b815260206004820152601f60248201527f45524332303a206d696e7420746f20746865207a65726f206164647265737300604482015290519081900360640190fd5b620002f8600083836200041a565b62000314816003546200043760201b62000ce31790919060201c565b6003556001600160a01b0382166000908152600160209081526040909120546200034991839062000ce362000437821b17901c565b6001600160a01b03831660008181526001602090815260408083209490945583518581529351929391927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9281900390910190a35050565b600082815260208181526040909120620003c691839062000d3d6200049b821b17901c565b156200028a57620003d66200027a565b6001600160a01b0316816001600160a01b0316837f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d60405160405180910390a45050565b62000432838383620004b260201b62000d521760201c565b505050565b60008282018381101562000492576040805162461bcd60e51b815260206004820152601b60248201527f536166654d6174683a206164646974696f6e206f766572666c6f770000000000604482015290519081900360640190fd5b90505b92915050565b600062000492836001600160a01b03841662000512565b620004ca8383836200043260201b62000a731760201c565b620004d462000561565b15620004325760405162461bcd60e51b815260040180806020018281038252602a815260200180620020c0602a913960400191505060405180910390fd5b60006200052083836200056f565b620005585750815460018181018455600084815260208082209093018490558454848252828601909352604090209190915562000495565b50600062000495565b600654610100900460ff1690565b60009081526001919091016020526040902054151590565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f10620005ca57805160ff1916838001178555620005fa565b82800160010185558215620005fa579182015b82811115620005fa578251825591602001919060010190620005dd565b50620006089291506200060c565b5090565b5b808211156200060857600081556001016200060d565b611a8d80620006336000396000f3fe608060405234801561001057600080fd5b50600436106101c45760003560e01c806370a08231116100f9578063a457c2d711610097578063d539139311610071578063d5391393146105f5578063d547741f146105fd578063dd62ed3e14610629578063e63ab1e914610657576101c4565b8063a457c2d714610580578063a9059cbb146105ac578063ca15c873146105d8576101c4565b80639010d07c116100d35780639010d07c1461050557806391d148541461054457806395d89b4114610570578063a217fddf14610578576101c4565b806370a08231146104ab57806379cc6790146104d15780638456cb59146104fd576101c4565b806336568abe116101665780634000aea0116101405780634000aea01461039f57806340c10f191461045a57806342966c68146104865780635c975abb146104a3576101c4565b806336568abe1461033f578063395093511461036b5780633f4ba83a14610397576101c4565b806323b872dd116101a257806323b872dd146102a0578063248a9ca3146102d65780632f2ff15d146102f3578063313ce56714610321576101c4565b806306fdde03146101c9578063095ea7b31461024657806318160ddd14610286575b600080fd5b6101d161065f565b6040805160208082528351818301528351919283929083019185019080838360005b8381101561020b5781810151838201526020016101f3565b50505050905090810190601f1680156102385780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6102726004803603604081101561025c57600080fd5b506001600160a01b0381351690602001356106f5565b604080519115158252519081900360200190f35b61028e610713565b60408051918252519081900360200190f35b610272600480360360608110156102b657600080fd5b506001600160a01b03813581169160208101359091169060400135610719565b61028e600480360360208110156102ec57600080fd5b50356107a0565b61031f6004803603604081101561030957600080fd5b50803590602001356001600160a01b03166107b5565b005b610329610821565b6040805160ff9092168252519081900360200190f35b61031f6004803603604081101561035557600080fd5b50803590602001356001600160a01b031661082a565b6102726004803603604081101561038157600080fd5b506001600160a01b03813516906020013561088b565b61031f6108d9565b610272600480360360608110156103b557600080fd5b6001600160a01b03823516916020810135918101906060810160408201356401000000008111156103e557600080fd5b8201836020820111156103f757600080fd5b8035906020019184600183028401116401000000008311171561041957600080fd5b91908080601f01602080910402602001604051908101604052809392919081815260200183838082843760009201919091525092955061094a945050505050565b61031f6004803603604081101561047057600080fd5b506001600160a01b038135169060200135610970565b61031f6004803603602081101561049c57600080fd5b50356109e1565b6102726109f5565b61028e600480360360208110156104c157600080fd5b50356001600160a01b0316610a03565b61031f600480360360408110156104e757600080fd5b506001600160a01b038135169060200135610a1e565b61031f610a78565b6105286004803603604081101561051b57600080fd5b5080359060200135610ae7565b604080516001600160a01b039092168252519081900360200190f35b6102726004803603604081101561055a57600080fd5b50803590602001356001600160a01b0316610b06565b6101d1610b1e565b61028e610b7f565b6102726004803603604081101561059657600080fd5b506001600160a01b038135169060200135610b84565b610272600480360360408110156105c257600080fd5b506001600160a01b038135169060200135610bec565b61028e600480360360208110156105ee57600080fd5b5035610c00565b61028e610c17565b61031f6004803603604081101561061357600080fd5b50803590602001356001600160a01b0316610c3b565b61028e6004803603604081101561063f57600080fd5b506001600160a01b0381358116916020013516610c94565b61028e610cbf565b60048054604080516020601f60026000196101006001881615020190951694909404938401819004810282018101909252828152606093909290918301828280156106eb5780601f106106c0576101008083540402835291602001916106eb565b820191906000526020600020905b8154815290600101906020018083116106ce57829003601f168201915b5050505050905090565b6000610709610702610da1565b8484610da5565b5060015b92915050565b60035490565b6000610726848484610e91565b61079684610732610da1565b610791856040518060600160405280602881526020016118b7602891396001600160a01b038a16600090815260026020526040812090610770610da1565b6001600160a01b031681526020810191909152604001600020549190610fee565b610da5565b5060019392505050565b60009081526020819052604090206002015490565b6000828152602081905260409020600201546107d8906107d3610da1565b610b06565b6108135760405162461bcd60e51b815260040180806020018281038252602f8152602001806117b5602f913960400191505060405180910390fd5b61081d8282611085565b5050565b60065460ff1690565b610832610da1565b6001600160a01b0316816001600160a01b0316146108815760405162461bcd60e51b815260040180806020018281038252602f8152602001806119ff602f913960400191505060405180910390fd5b61081d82826110ee565b6000610709610898610da1565b8461079185600260006108a9610da1565b6001600160a01b03908116825260208083019390935260409182016000908120918c168152925290205490610ce3565b6109057f65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a6107d3610da1565b6109405760405162461bcd60e51b81526004018080602001828103825260398152602001806118066039913960400191505060405180910390fd5b610948611157565b565b60006109568484610bec565b50610960846111fb565b1561079657610796848484611201565b61099c7f9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a66107d3610da1565b6109d75760405162461bcd60e51b81526004018080602001828103825260368152602001806118df6036913960400191505060405180910390fd5b61081d82826112db565b6109f26109ec610da1565b826113cd565b50565b600654610100900460ff1690565b6001600160a01b031660009081526001602052604090205490565b6000610a558260405180606001604052806024815260200161191560249139610a4e86610a49610da1565b610c94565b9190610fee565b9050610a6983610a63610da1565b83610da5565b610a7383836113cd565b505050565b610aa47f65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a6107d3610da1565b610adf5760405162461bcd60e51b81526004018080602001828103825260378152602001806119a36037913960400191505060405180910390fd5b6109486114c9565b6000828152602081905260408120610aff9083611551565b9392505050565b6000828152602081905260408120610aff908361155d565b60058054604080516020601f60026000196101006001881615020190951694909404938401819004810282018101909252828152606093909290918301828280156106eb5780601f106106c0576101008083540402835291602001916106eb565b600081565b6000610709610b91610da1565b84610791856040518060600160405280602581526020016119da6025913960026000610bbb610da1565b6001600160a01b03908116825260208083019390935260409182016000908120918d16815292529020549190610fee565b6000610709610bf9610da1565b8484610e91565b600081815260208190526040812061070d90611572565b7f9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a681565b600082815260208190526040902060020154610c59906107d3610da1565b6108815760405162461bcd60e51b81526004018080602001828103825260308152602001806118876030913960400191505060405180910390fd5b6001600160a01b03918216600090815260026020908152604080832093909416825291909152205490565b7f65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a81565b600082820183811015610aff576040805162461bcd60e51b815260206004820152601b60248201527f536166654d6174683a206164646974696f6e206f766572666c6f770000000000604482015290519081900360640190fd5b6000610aff836001600160a01b03841661157d565b610d5d838383610a73565b610d656109f5565b15610a735760405162461bcd60e51b815260040180806020018281038252602a815260200180611a2e602a913960400191505060405180910390fd5b3390565b6001600160a01b038316610dea5760405162461bcd60e51b815260040180806020018281038252602481526020018061197f6024913960400191505060405180910390fd5b6001600160a01b038216610e2f5760405162461bcd60e51b815260040180806020018281038252602281526020018061183f6022913960400191505060405180910390fd5b6001600160a01b03808416600081815260026020908152604080832094871680845294825291829020859055815185815291517f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b9259281900390910190a3505050565b6001600160a01b038316610ed65760405162461bcd60e51b815260040180806020018281038252602581526020018061195a6025913960400191505060405180910390fd5b6001600160a01b038216610f1b5760405162461bcd60e51b81526004018080602001828103825260238152602001806117926023913960400191505060405180910390fd5b610f268383836115c7565b610f6381604051806060016040528060268152602001611861602691396001600160a01b0386166000908152600160205260409020549190610fee565b6001600160a01b038085166000908152600160205260408082209390935590841681522054610f929082610ce3565b6001600160a01b0380841660008181526001602090815260409182902094909455805185815290519193928716927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef92918290030190a3505050565b6000818484111561107d5760405162461bcd60e51b81526004018080602001828103825283818151815260200191508051906020019080838360005b8381101561104257818101518382015260200161102a565b50505050905090810190601f16801561106f5780820380516001836020036101000a031916815260200191505b509250505060405180910390fd5b505050900390565b600082815260208190526040902061109d9082610d3d565b1561081d576110aa610da1565b6001600160a01b0316816001600160a01b0316837f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d60405160405180910390a45050565b600082815260208190526040902061110690826115d2565b1561081d57611113610da1565b6001600160a01b0316816001600160a01b0316837ff6391f5c32d9c69d2a47ea670b442974b53935d1edc7fd64eb21e047a839171b60405160405180910390a45050565b600654610100900460ff166111aa576040805162461bcd60e51b815260206004820152601460248201527314185d5cd8589b194e881b9bdd081c185d5cd95960621b604482015290519081900360640190fd5b6006805461ff00191690557f5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa6111de610da1565b604080516001600160a01b039092168252519081900360200190a1565b3b151590565b604051635260769b60e11b815233600482018181526024830185905260606044840190815284516064850152845187946001600160a01b0386169463a4c0ed369490938993899360840190602085019080838360005b8381101561126f578181015183820152602001611257565b50505050905090810190601f16801561129c5780820380516001836020036101000a031916815260200191505b50945050505050600060405180830381600087803b1580156112bd57600080fd5b505af11580156112d1573d6000803e3d6000fd5b5050505050505050565b6001600160a01b038216611336576040805162461bcd60e51b815260206004820152601f60248201527f45524332303a206d696e7420746f20746865207a65726f206164647265737300604482015290519081900360640190fd5b611342600083836115c7565b60035461134f9082610ce3565b6003556001600160a01b0382166000908152600160205260409020546113759082610ce3565b6001600160a01b03831660008181526001602090815260408083209490945583518581529351929391927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9281900390910190a35050565b6001600160a01b0382166114125760405162461bcd60e51b81526004018080602001828103825260218152602001806119396021913960400191505060405180910390fd5b61141e826000836115c7565b61145b816040518060600160405280602281526020016117e4602291396001600160a01b0385166000908152600160205260409020549190610fee565b6001600160a01b03831660009081526001602052604090205560035461148190826115e7565b6003556040805182815290516000916001600160a01b038516917fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9181900360200190a35050565b600654610100900460ff1615611519576040805162461bcd60e51b815260206004820152601060248201526f14185d5cd8589b194e881c185d5cd95960821b604482015290519081900360640190fd5b6006805461ff0019166101001790557f62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a2586111de610da1565b6000610aff8383611629565b6000610aff836001600160a01b03841661168d565b600061070d826116a5565b6000611589838361168d565b6115bf5750815460018181018455600084815260208082209093018490558454848252828601909352604090209190915561070d565b50600061070d565b610a73838383610d52565b6000610aff836001600160a01b0384166116a9565b6000610aff83836040518060400160405280601e81526020017f536166654d6174683a207375627472616374696f6e206f766572666c6f770000815250610fee565b8154600090821061166b5760405162461bcd60e51b81526004018080602001828103825260228152602001806117706022913960400191505060405180910390fd5b82600001828154811061167a57fe5b9060005260206000200154905092915050565b60009081526001919091016020526040902054151590565b5490565b6000818152600183016020526040812054801561176557835460001980830191908101906000908790839081106116dc57fe5b90600052602060002001549050808760000184815481106116f957fe5b60009182526020808320909101929092558281526001898101909252604090209084019055865487908061172957fe5b6001900381819060005260206000200160009055905586600101600087815260200190815260200160002060009055600194505050505061070d565b600091505061070d56fe456e756d657261626c655365743a20696e646578206f7574206f6620626f756e647345524332303a207472616e7366657220746f20746865207a65726f2061646472657373416363657373436f6e74726f6c3a2073656e646572206d75737420626520616e2061646d696e20746f206772616e7445524332303a206275726e20616d6f756e7420657863656564732062616c616e636545524332305072657365744d696e7465725061757365723a206d75737420686176652070617573657220726f6c6520746f20756e706175736545524332303a20617070726f766520746f20746865207a65726f206164647265737345524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e6365416363657373436f6e74726f6c3a2073656e646572206d75737420626520616e2061646d696e20746f207265766f6b6545524332303a207472616e7366657220616d6f756e74206578636565647320616c6c6f77616e636545524332305072657365744d696e7465725061757365723a206d7573742068617665206d696e74657220726f6c6520746f206d696e7445524332303a206275726e20616d6f756e74206578636565647320616c6c6f77616e636545524332303a206275726e2066726f6d20746865207a65726f206164647265737345524332303a207472616e736665722066726f6d20746865207a65726f206164647265737345524332303a20617070726f76652066726f6d20746865207a65726f206164647265737345524332305072657365744d696e7465725061757365723a206d75737420686176652070617573657220726f6c6520746f20706175736545524332303a2064656372656173656420616c6c6f77616e63652062656c6f77207a65726f416363657373436f6e74726f6c3a2063616e206f6e6c792072656e6f756e636520726f6c657320666f722073656c6645524332305061757361626c653a20746f6b656e207472616e73666572207768696c6520706175736564a26469706673582212201cdaa97b6b4824d9bca44153c9ac5f3f06b9c822cb0294fdb4d48e9d98e6082c64736f6c634300060c003345524332305061757361626c653a20746f6b656e207472616e73666572207768696c6520706175736564";