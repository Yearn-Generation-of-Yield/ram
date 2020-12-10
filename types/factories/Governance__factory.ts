/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides } from "@ethersproject/contracts";

import type { Governance } from "../Governance";

export class Governance__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(
    _YGYToken: string,
    _RAMRouter: string,
    overrides?: Overrides
  ): Promise<Governance> {
    return super.deploy(
      _YGYToken,
      _RAMRouter,
      overrides || {}
    ) as Promise<Governance>;
  }
  getDeployTransaction(
    _YGYToken: string,
    _RAMRouter: string,
    overrides?: Overrides
  ): TransactionRequest {
    return super.getDeployTransaction(_YGYToken, _RAMRouter, overrides || {});
  }
  attach(address: string): Governance {
    return super.attach(address) as Governance;
  }
  connect(signer: Signer): Governance__factory {
    return super.connect(signer) as Governance__factory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): Governance {
    return new Contract(address, _abi, signerOrProvider) as Governance;
  }
}

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_YGYToken",
        type: "address",
      },
      {
        internalType: "address",
        name: "_RAMRouter",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "RAMRouter",
    outputs: [
      {
        internalType: "contract IRAMv1Router",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "YGYToken",
    outputs: [
      {
        internalType: "contract IERC20",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "enterRegeneratorUpdateStagingMode",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_level",
        type: "uint256",
      },
    ],
    name: "getDurationForLevel",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_level",
        type: "uint256",
      },
    ],
    name: "getMultiplierForLevel",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "lastRAMRouterUpdateTime",
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
        name: "_number",
        type: "uint256",
      },
    ],
    name: "setUserNumber",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_level",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_number",
        type: "uint256",
      },
    ],
    name: "timelockYGY",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_level",
        type: "uint256",
      },
    ],
    name: "unlockOldestTimelock",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "updateRAMRouterRegeneratorTax",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "updateStagingMode",
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
    inputs: [],
    name: "updateStagingReadyTime",
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
        name: "",
        type: "address",
      },
    ],
    name: "users",
    outputs: [
      {
        internalType: "uint256",
        name: "number",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "timelockedYGY",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "votingShares",
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
    inputs: [],
    name: "weightedNumber",
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
];

const _bytecode =
  "0x608060405234801561001057600080fd5b50604051610ddc380380610ddc8339818101604052604081101561003357600080fd5b508051602090910151600080546001600160a01b039384166001600160a01b03199182161790915560018054939092169216919091178155600255610d5f8061007d6000396000f3fe608060405234801561001057600080fd5b50600436106100f55760003560e01c8063978f254b11610097578063bbdc1d6711610066578063bbdc1d6714610219578063bf6ece4014610236578063c94c820114610252578063d80137e11461025a576100f5565b8063978f254b146101ad578063a3323159146101b5578063a87430ba146101d2578063ae38e47814610211576100f5565b8063776fb9c0116100d3578063776fb9c01461013b5780638a48abc4146101435780638e75217e14610160578063952c5df714610184576100f5565b80632a23cf20146100fa578063310fdd0a1461011957806370e5603014610133575b600080fd5b6101176004803603602081101561011057600080fd5b5035610262565b005b6101216102e5565b60408051918252519081900360200190f35b6101216102eb565b6101216102f1565b6101216004803603602081101561015957600080fd5b50356102f7565b610168610349565b604080516001600160a01b039092168252519081900360200190f35b6101176004803603606081101561019a57600080fd5b5080359060208101359060400135610358565b6101176105d9565b610117600480360360208110156101cb57600080fd5b50356106e9565b6101f8600480360360208110156101e857600080fd5b50356001600160a01b03166108c7565b6040805192835260208301919091528051918290030190f35b6101216108e0565b6101216004803603602081101561022f57600080fd5b50356108e6565b61023e61093e565b604080519115158252519081900360200190f35b610117610947565b6101686109b3565b60018110158015610274575060088111155b6102c5576040805162461bcd60e51b815260206004820152601b60248201527f4e756d626572206d75737420626520696e2072616e676520312d380000000000604482015290519081900360640190fd5b336000818152600760205260409020828155906102e1906109c2565b5050565b60035481565b60065481565b60025481565b6000816001141561030a57506096610344565b816002141561031c575061012c610344565b816003141561032e57506103e8610344565b816004141561034057506109c4610344565b5060965b919050565b6000546001600160a01b031681565b6001811015801561036a575060088111155b6103bb576040805162461bcd60e51b815260206004820152601b60248201527f4e756d626572206d75737420626520696e2072616e676520312d380000000000604482015290519081900360640190fd5b60008054604080516323b872dd60e01b81523360048201523060248201526044810187905290516001600160a01b03909216926323b872dd926064808401936020939083900390910190829087803b15801561041657600080fd5b505af115801561042a573d6000803e3d6000fd5b505050506040513d602081101561044057600080fd5b5051610493576040805162461bcd60e51b815260206004820152601a60248201527f4861766520746f6b656e73206265656e20617070726f7665643f000000000000604482015290519081900360640190fd5b336000908152600760205260408120906104c160646104bb6104b4876102f7565b8890610a62565b90610ac4565b90506104cb610c9e565b60405180606001604052808381526020018681526020016104f56104ee886108e6565b4290610b06565b9052600086815260038501602052604090205490915061053d57600085815260038401602052604090205461052b906001610b06565b60008681526003850160205260409020555b6000858152600484016020526040812054610559906001610b06565b6000878152600280870160209081526040808420858552825280842087518155828801516001808301919091558289015191909401558a8452600489019091529091208290558501549091506105af9084610b06565b60018501556003546105c19084610b06565b6003558484556105d0336109c2565b50505050505050565b60055460ff16610630576040805162461bcd60e51b815260206004820152601e60248201527f4d75737420626520696e207570646174652073746167696e67206d6f64650000604482015290519081900360640190fd5b6006544210156106715760405162461bcd60e51b8152600401808060200182810382526028815260200180610d026028913960400191505060405180910390fd5b6005805460ff1916905542600490815560015460025460408051630c39622b60e21b815293840191909152516001600160a01b03909116916330e588ac91602480830192600092919082900301818387803b1580156106cf57600080fd5b505af11580156106e3573d6000803e3d6000fd5b50505050565b33600090815260076020908152604080832084845260038101835281842054600280830185528386208287529094529190932091820154909190421015610777576040805162461bcd60e51b815260206004820152601b60248201527f546f6b656e7320617265207374696c6c2074696d656c6f636b65640000000000604482015290519081900360640190fd5b8054600184015461078791610b60565b6001840155805460035461079a91610b60565b60038190555060006107bf6107b760646104bb85600101546102f7565b835490610ac4565b600080546040805163a9059cbb60e01b81523360048201526024810185905290519394506001600160a01b039091169263a9059cbb92604480840193602093929083900390910190829087803b15801561081857600080fd5b505af115801561082c573d6000803e3d6000fd5b505050506040513d602081101561084257600080fd5b505060008581526002808601602090815260408084208785529091528220828155600180820184905591019190915561087c908490610b06565b600086815260038601602090815260408083209390935560048701905220546108a6906001610b60565b60008681526004860160205260409020556108c0336109c2565b5050505050565b6007602052600090815260409020805460019091015482565b60045481565b600081600114156108fb575062127500610344565b816002141561090e57506224ea00610344565b81600314156109215750626ebe00610344565b8160041415610934575062dd7c00610344565b5062127500919050565b60055460ff1681565b6004546109579062015180610b06565b4210156109955760405162461bcd60e51b8152600401808060200182810382526021815260200180610ce16021913960400191505060405180910390fd5b6005805460ff191660011790556109ae42610258610b06565b600655565b6001546001600160a01b031681565b6001600160a01b038116600090815260076020526040812060018101546003549192916109ee91610b60565b82546001840154919250600091610a0491610a62565b90506000610a1d60025484610a6290919063ffffffff16565b90506000610a2b8383610b06565b90506000600354118015610a43575060008560010154115b15610a5a57600354610a56908290610ac4565b6002555b505050505050565b600082610a7157506000610abe565b82820282848281610a7e57fe5b0414610abb5760405162461bcd60e51b8152600401808060200182810382526021815260200180610cc06021913960400191505060405180910390fd5b90505b92915050565b6000610abb83836040518060400160405280601a81526020017f536166654d6174683a206469766973696f6e206279207a65726f000000000000815250610ba2565b600082820183811015610abb576040805162461bcd60e51b815260206004820152601b60248201527f536166654d6174683a206164646974696f6e206f766572666c6f770000000000604482015290519081900360640190fd5b6000610abb83836040518060400160405280601e81526020017f536166654d6174683a207375627472616374696f6e206f766572666c6f770000815250610c44565b60008183610c2e5760405162461bcd60e51b81526004018080602001828103825283818151815260200191508051906020019080838360005b83811015610bf3578181015183820152602001610bdb565b50505050905090810190601f168015610c205780820380516001836020036101000a031916815260200191505b509250505060405180910390fd5b506000838581610c3a57fe5b0495945050505050565b60008184841115610c965760405162461bcd60e51b8152602060048201818152835160248401528351909283926044909101919085019080838360008315610bf3578181015183820152602001610bdb565b505050900390565b6040518060600160405280600081526020016000815260200160008152509056fe536166654d6174683a206d756c7469706c69636174696f6e206f766572666c6f774d75737420776169742031206461792073696e6365206c617374207570646174654d7573742077616974203130206d696e757465732073696e63652075706461746520737461676564a2646970667358221220bd3207c8874d87a58455ae6f0def20abbf1fc21db82d0f6c326d0bc0d93bea8b64736f6c634300060c0033";