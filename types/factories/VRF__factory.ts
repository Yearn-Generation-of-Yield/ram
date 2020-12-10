/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides } from "@ethersproject/contracts";

import type { VRF } from "../VRF";

export class VRF__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(overrides?: Overrides): Promise<VRF> {
    return super.deploy(overrides || {}) as Promise<VRF>;
  }
  getDeployTransaction(overrides?: Overrides): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): VRF {
    return super.attach(address) as VRF;
  }
  connect(signer: Signer): VRF__factory {
    return super.connect(signer) as VRF__factory;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): VRF {
    return new Contract(address, _abi, signerOrProvider) as VRF;
  }
}

const _abi = [
  {
    inputs: [],
    name: "PROOF_LENGTH",
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
  "0x6080604052348015600f57600080fd5b5060818061001e6000396000f3fe6080604052348015600f57600080fd5b506004361060285760003560e01c8063e911439c14602d575b600080fd5b60336045565b60408051918252519081900360200190f35b6101a08156fea2646970667358221220172d8c22082eac8bd03bf64c90329bf6bf57cb55d15eb90ef9e78b4b83caa52564736f6c634300060c0033";
