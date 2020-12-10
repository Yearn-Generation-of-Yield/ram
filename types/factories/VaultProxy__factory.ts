/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides } from "@ethersproject/contracts";

import type { VaultProxy } from "../VaultProxy";

export class VaultProxy__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(overrides?: Overrides): Promise<VaultProxy> {
    return super.deploy(overrides || {}) as Promise<VaultProxy>;
  }
  getDeployTransaction(overrides?: Overrides): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): VaultProxy {
    return super.attach(address) as VaultProxy;
  }
  connect(signer: Signer): VaultProxy__factory {
    return super.connect(signer) as VaultProxy__factory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): VaultProxy {
    return new Contract(address, _abi, signerOrProvider) as VaultProxy;
  }
}

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    stateMutability: "payable",
    type: "fallback",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_implementation",
        type: "address",
      },
      {
        internalType: "contract YGYStorageV1",
        name: "__storage",
        type: "address",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b50600280546001600160a01b0319163317905561023d806100326000396000f3fe6080604052600436106100225760003560e01c8063485cc9551461005957610029565b3661002957005b6001546001600160a01b03163660008037600080366000845af43d6000803e808015610054573d6000f35b3d6000fd5b34801561006557600080fd5b506100946004803603604081101561007c57600080fd5b506001600160a01b0381358116916020013516610096565b005b6002546001600160a01b031633146100ad57600080fd5b6100cf6040518060600160405280602b81526020016101dd602b913983610100565b600080546001600160a01b039283166001600160a01b03199182161790915560018054939092169216919091179055565b6101b782826040516024018080602001836001600160a01b03168152602001828103825284818151815260200191508051906020019080838360005b8381101561015457818101518382015260200161013c565b50505050905090810190601f1680156101815780820380516001836020036101000a031916815260200191505b5060408051601f198184030181529190526020810180516001600160e01b031663319af33360e01b17905293506101bb92505050565b5050565b80516a636f6e736f6c652e6c6f67602083016000808483855afa505050505056fe73657474696e6720696d706c656d656e746174696f6e20616e642073746f72616765206c6f636174696f6ea2646970667358221220028e9248743731e0730d63998c4c5c602b6a6833b99381c7a4cb699df01ca2ac64736f6c634300060c0033";
