/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides } from "@ethersproject/contracts";

import type { FeeGenerator } from "../FeeGenerator";

export class FeeGenerator__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(overrides?: Overrides): Promise<FeeGenerator> {
    return super.deploy(overrides || {}) as Promise<FeeGenerator>;
  }
  getDeployTransaction(overrides?: Overrides): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): FeeGenerator {
    return super.attach(address) as FeeGenerator;
  }
  connect(signer: Signer): FeeGenerator__factory {
    return super.connect(signer) as FeeGenerator__factory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): FeeGenerator {
    return new Contract(address, _abi, signerOrProvider) as FeeGenerator;
  }
}

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "loopCount",
        type: "uint256",
      },
    ],
    name: "transferToSelf",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b506101b0806100206000396000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c8063939fe7be14610030575b600080fd5b61005c6004803603604081101561004657600080fd5b506001600160a01b03813516906020013561005e565b005b60005b8181101561017557826001600160a01b031663a9059cbb30856001600160a01b03166370a08231306040518263ffffffff1660e01b815260040180826001600160a01b0316815260200191505060206040518083038186803b1580156100c657600080fd5b505afa1580156100da573d6000803e3d6000fd5b505050506040513d60208110156100f057600080fd5b5051604080516001600160e01b031960e086901b1681526001600160a01b03909316600484015260248301919091525160448083019260209291908290030181600087803b15801561014157600080fd5b505af1158015610155573d6000803e3d6000fd5b505050506040513d602081101561016b57600080fd5b5050600101610061565b50505056fea2646970667358221220510df061912fbcde4c05ebb423fce6db52e5e23f7e845045e6943e767c0ab2c064736f6c634300060c0033";
