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

interface IRAMv1RouterInterface extends ethers.utils.Interface {
  functions: {
    "setRegeneratorTax(uint256)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "setRegeneratorTax",
    values: [BigNumberish]
  ): string;

  decodeFunctionResult(
    functionFragment: "setRegeneratorTax",
    data: BytesLike
  ): Result;

  events: {};
}

export class IRAMv1Router extends Contract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  on(event: EventFilter | string, listener: Listener): this;
  once(event: EventFilter | string, listener: Listener): this;
  addListener(eventName: EventFilter | string, listener: Listener): this;
  removeAllListeners(eventName: EventFilter | string): this;
  removeListener(eventName: any, listener: Listener): this;

  interface: IRAMv1RouterInterface;

  functions: {
    setRegeneratorTax(
      _regeneratorTax: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "setRegeneratorTax(uint256)"(
      _regeneratorTax: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;
  };

  setRegeneratorTax(
    _regeneratorTax: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "setRegeneratorTax(uint256)"(
    _regeneratorTax: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  callStatic: {
    setRegeneratorTax(
      _regeneratorTax: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    "setRegeneratorTax(uint256)"(
      _regeneratorTax: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {};

  estimateGas: {
    setRegeneratorTax(
      _regeneratorTax: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "setRegeneratorTax(uint256)"(
      _regeneratorTax: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    setRegeneratorTax(
      _regeneratorTax: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "setRegeneratorTax(uint256)"(
      _regeneratorTax: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;
  };
}
