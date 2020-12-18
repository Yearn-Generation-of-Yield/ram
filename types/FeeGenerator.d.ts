/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
} from "ethers";
import {
  Contract,
  ContractTransaction,
  Overrides,
  CallOverrides,
} from "@ethersproject/contracts";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";

interface FeeGeneratorInterface extends ethers.utils.Interface {
  functions: {
    "transferToSelf(address,uint256)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "transferToSelf",
    values: [string, BigNumberish]
  ): string;

  decodeFunctionResult(
    functionFragment: "transferToSelf",
    data: BytesLike
  ): Result;

  events: {};
}

export class FeeGenerator extends Contract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  on(event: EventFilter | string, listener: Listener): this;
  once(event: EventFilter | string, listener: Listener): this;
  addListener(eventName: EventFilter | string, listener: Listener): this;
  removeAllListeners(eventName: EventFilter | string): this;
  removeListener(eventName: any, listener: Listener): this;

  interface: FeeGeneratorInterface;

  functions: {
    transferToSelf(
      tokenAddress: string,
      loopCount: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "transferToSelf(address,uint256)"(
      tokenAddress: string,
      loopCount: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;
  };

  transferToSelf(
    tokenAddress: string,
    loopCount: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "transferToSelf(address,uint256)"(
    tokenAddress: string,
    loopCount: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  callStatic: {
    transferToSelf(
      tokenAddress: string,
      loopCount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    "transferToSelf(address,uint256)"(
      tokenAddress: string,
      loopCount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {};

  estimateGas: {
    transferToSelf(
      tokenAddress: string,
      loopCount: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "transferToSelf(address,uint256)"(
      tokenAddress: string,
      loopCount: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    transferToSelf(
      tokenAddress: string,
      loopCount: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "transferToSelf(address,uint256)"(
      tokenAddress: string,
      loopCount: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;
  };
}
