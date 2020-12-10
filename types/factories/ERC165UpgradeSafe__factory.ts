/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides } from "@ethersproject/contracts";

import type { ERC165UpgradeSafe } from "../ERC165UpgradeSafe";

export class ERC165UpgradeSafe__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(overrides?: Overrides): Promise<ERC165UpgradeSafe> {
    return super.deploy(overrides || {}) as Promise<ERC165UpgradeSafe>;
  }
  getDeployTransaction(overrides?: Overrides): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): ERC165UpgradeSafe {
    return super.attach(address) as ERC165UpgradeSafe;
  }
  connect(signer: Signer): ERC165UpgradeSafe__factory {
    return super.connect(signer) as ERC165UpgradeSafe__factory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ERC165UpgradeSafe {
    return new Contract(address, _abi, signerOrProvider) as ERC165UpgradeSafe;
  }
}

const _abi = [
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
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
];

const _bytecode =
  "0x6080604052348015600f57600080fd5b5060ba8061001e6000396000f3fe6080604052348015600f57600080fd5b506004361060285760003560e01c806301ffc9a714602d575b600080fd5b605160048036036020811015604157600080fd5b50356001600160e01b0319166065565b604080519115158252519081900360200190f35b6001600160e01b03191660009081526033602052604090205460ff169056fea2646970667358221220596dc2f7b9c8917e220fd8cd20c83a46b6ea6798e2759928f61c967ce5db8f8e64736f6c634300060c0033";