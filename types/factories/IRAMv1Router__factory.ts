/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer } from "ethers";
import { Provider } from "@ethersproject/providers";

import type { IRAMv1Router } from "../IRAMv1Router";

export class IRAMv1Router__factory {
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IRAMv1Router {
    return new Contract(address, _abi, signerOrProvider) as IRAMv1Router;
  }
}

const _abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_regeneratorTax",
        type: "uint256",
      },
    ],
    name: "setRegeneratorTax",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
