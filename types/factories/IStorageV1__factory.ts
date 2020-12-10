/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer } from "ethers";
import { Provider } from "@ethersproject/providers";

import type { IStorageV1 } from "../IStorageV1";

export class IStorageV1__factory {
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IStorageV1 {
    return new Contract(address, _abi, signerOrProvider) as IStorageV1;
  }
}

const _abi = [
  {
    inputs: [],
    name: "getName",
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
    inputs: [
      {
        internalType: "string",
        name: "_name",
        type: "string",
      },
    ],
    name: "setName",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];