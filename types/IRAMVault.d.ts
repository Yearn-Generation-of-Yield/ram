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

interface IRAMVaultInterface extends ethers.utils.Interface {
  functions: {
    "addPendingRewards(uint256)": FunctionFragment;
    "depositFor(address,uint256,uint256)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "addPendingRewards",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "depositFor",
    values: [string, BigNumberish, BigNumberish]
  ): string;

  decodeFunctionResult(
    functionFragment: "addPendingRewards",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "depositFor", data: BytesLike): Result;

  events: {};
}

export class IRAMVault extends Contract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  on(event: EventFilter | string, listener: Listener): this;
  once(event: EventFilter | string, listener: Listener): this;
  addListener(eventName: EventFilter | string, listener: Listener): this;
  removeAllListeners(eventName: EventFilter | string): this;
  removeListener(eventName: any, listener: Listener): this;

  interface: IRAMVaultInterface;

  functions: {
    addPendingRewards(
      _amount: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "addPendingRewards(uint256)"(
      _amount: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    depositFor(
      _depositFor: string,
      _pid: BigNumberish,
      _amount: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "depositFor(address,uint256,uint256)"(
      _depositFor: string,
      _pid: BigNumberish,
      _amount: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;
  };

  addPendingRewards(
    _amount: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "addPendingRewards(uint256)"(
    _amount: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  depositFor(
    _depositFor: string,
    _pid: BigNumberish,
    _amount: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "depositFor(address,uint256,uint256)"(
    _depositFor: string,
    _pid: BigNumberish,
    _amount: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  callStatic: {
    addPendingRewards(
      _amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    "addPendingRewards(uint256)"(
      _amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    depositFor(
      _depositFor: string,
      _pid: BigNumberish,
      _amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    "depositFor(address,uint256,uint256)"(
      _depositFor: string,
      _pid: BigNumberish,
      _amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {};

  estimateGas: {
    addPendingRewards(
      _amount: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "addPendingRewards(uint256)"(
      _amount: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    depositFor(
      _depositFor: string,
      _pid: BigNumberish,
      _amount: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "depositFor(address,uint256,uint256)"(
      _depositFor: string,
      _pid: BigNumberish,
      _amount: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    addPendingRewards(
      _amount: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "addPendingRewards(uint256)"(
      _amount: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    depositFor(
      _depositFor: string,
      _pid: BigNumberish,
      _amount: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "depositFor(address,uint256,uint256)"(
      _depositFor: string,
      _pid: BigNumberish,
      _amount: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;
  };
}