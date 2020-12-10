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

interface VRFCoordinatorInterface extends ethers.utils.Interface {
  functions: {
    "PRESEED_OFFSET()": FunctionFragment;
    "PROOF_LENGTH()": FunctionFragment;
    "PUBLIC_KEY_OFFSET()": FunctionFragment;
    "callbacks(bytes32)": FunctionFragment;
    "fulfillRandomnessRequest(bytes32,uint256)": FunctionFragment;
    "hashOfKey(uint256[2])": FunctionFragment;
    "onTokenTransfer(address,uint256,bytes)": FunctionFragment;
    "registerProvingKey(uint256,address,uint256[2],bytes32)": FunctionFragment;
    "serviceAgreements(bytes32)": FunctionFragment;
    "withdraw(address,uint256)": FunctionFragment;
    "withdrawableTokens(address)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "PRESEED_OFFSET",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "PROOF_LENGTH",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "PUBLIC_KEY_OFFSET",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "callbacks",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "fulfillRandomnessRequest",
    values: [BytesLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "hashOfKey",
    values: [[BigNumberish, BigNumberish]]
  ): string;
  encodeFunctionData(
    functionFragment: "onTokenTransfer",
    values: [string, BigNumberish, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "registerProvingKey",
    values: [BigNumberish, string, [BigNumberish, BigNumberish], BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "serviceAgreements",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "withdraw",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "withdrawableTokens",
    values: [string]
  ): string;

  decodeFunctionResult(
    functionFragment: "PRESEED_OFFSET",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "PROOF_LENGTH",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "PUBLIC_KEY_OFFSET",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "callbacks", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "fulfillRandomnessRequest",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "hashOfKey", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "onTokenTransfer",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "registerProvingKey",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "serviceAgreements",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "withdraw", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "withdrawableTokens",
    data: BytesLike
  ): Result;

  events: {
    "NewServiceAgreement(bytes32,uint256)": EventFragment;
    "RandomnessRequest(bytes32,uint256,bytes32,address,uint256,bytes32)": EventFragment;
    "RandomnessRequestFulfilled(bytes32,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "NewServiceAgreement"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "RandomnessRequest"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "RandomnessRequestFulfilled"): EventFragment;
}

export class VRFCoordinator extends Contract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  on(event: EventFilter | string, listener: Listener): this;
  once(event: EventFilter | string, listener: Listener): this;
  addListener(eventName: EventFilter | string, listener: Listener): this;
  removeAllListeners(eventName: EventFilter | string): this;
  removeListener(eventName: any, listener: Listener): this;

  interface: VRFCoordinatorInterface;

  functions: {
    PRESEED_OFFSET(overrides?: CallOverrides): Promise<[BigNumber]>;

    "PRESEED_OFFSET()"(overrides?: CallOverrides): Promise<[BigNumber]>;

    PROOF_LENGTH(overrides?: CallOverrides): Promise<[BigNumber]>;

    "PROOF_LENGTH()"(overrides?: CallOverrides): Promise<[BigNumber]>;

    PUBLIC_KEY_OFFSET(overrides?: CallOverrides): Promise<[BigNumber]>;

    "PUBLIC_KEY_OFFSET()"(overrides?: CallOverrides): Promise<[BigNumber]>;

    callbacks(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<
      [string, BigNumber, string] & {
        callbackContract: string;
        randomnessFee: BigNumber;
        seedAndBlockNum: string;
      }
    >;

    "callbacks(bytes32)"(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<
      [string, BigNumber, string] & {
        callbackContract: string;
        randomnessFee: BigNumber;
        seedAndBlockNum: string;
      }
    >;

    fulfillRandomnessRequest(
      requestId: BytesLike,
      randomness: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "fulfillRandomnessRequest(bytes32,uint256)"(
      requestId: BytesLike,
      randomness: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    hashOfKey(
      _publicKey: [BigNumberish, BigNumberish],
      overrides?: CallOverrides
    ): Promise<[string]>;

    "hashOfKey(uint256[2])"(
      _publicKey: [BigNumberish, BigNumberish],
      overrides?: CallOverrides
    ): Promise<[string]>;

    onTokenTransfer(
      _sender: string,
      _fee: BigNumberish,
      _data: BytesLike,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "onTokenTransfer(address,uint256,bytes)"(
      _sender: string,
      _fee: BigNumberish,
      _data: BytesLike,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    registerProvingKey(
      _fee: BigNumberish,
      _oracle: string,
      _publicProvingKey: [BigNumberish, BigNumberish],
      _jobID: BytesLike,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "registerProvingKey(uint256,address,uint256[2],bytes32)"(
      _fee: BigNumberish,
      _oracle: string,
      _publicProvingKey: [BigNumberish, BigNumberish],
      _jobID: BytesLike,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    serviceAgreements(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<
      [string, BigNumber, string] & {
        vRFOracle: string;
        fee: BigNumber;
        jobID: string;
      }
    >;

    "serviceAgreements(bytes32)"(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<
      [string, BigNumber, string] & {
        vRFOracle: string;
        fee: BigNumber;
        jobID: string;
      }
    >;

    withdraw(
      _recipient: string,
      _amount: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "withdraw(address,uint256)"(
      _recipient: string,
      _amount: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    withdrawableTokens(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    "withdrawableTokens(address)"(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;
  };

  PRESEED_OFFSET(overrides?: CallOverrides): Promise<BigNumber>;

  "PRESEED_OFFSET()"(overrides?: CallOverrides): Promise<BigNumber>;

  PROOF_LENGTH(overrides?: CallOverrides): Promise<BigNumber>;

  "PROOF_LENGTH()"(overrides?: CallOverrides): Promise<BigNumber>;

  PUBLIC_KEY_OFFSET(overrides?: CallOverrides): Promise<BigNumber>;

  "PUBLIC_KEY_OFFSET()"(overrides?: CallOverrides): Promise<BigNumber>;

  callbacks(
    arg0: BytesLike,
    overrides?: CallOverrides
  ): Promise<
    [string, BigNumber, string] & {
      callbackContract: string;
      randomnessFee: BigNumber;
      seedAndBlockNum: string;
    }
  >;

  "callbacks(bytes32)"(
    arg0: BytesLike,
    overrides?: CallOverrides
  ): Promise<
    [string, BigNumber, string] & {
      callbackContract: string;
      randomnessFee: BigNumber;
      seedAndBlockNum: string;
    }
  >;

  fulfillRandomnessRequest(
    requestId: BytesLike,
    randomness: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "fulfillRandomnessRequest(bytes32,uint256)"(
    requestId: BytesLike,
    randomness: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  hashOfKey(
    _publicKey: [BigNumberish, BigNumberish],
    overrides?: CallOverrides
  ): Promise<string>;

  "hashOfKey(uint256[2])"(
    _publicKey: [BigNumberish, BigNumberish],
    overrides?: CallOverrides
  ): Promise<string>;

  onTokenTransfer(
    _sender: string,
    _fee: BigNumberish,
    _data: BytesLike,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "onTokenTransfer(address,uint256,bytes)"(
    _sender: string,
    _fee: BigNumberish,
    _data: BytesLike,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  registerProvingKey(
    _fee: BigNumberish,
    _oracle: string,
    _publicProvingKey: [BigNumberish, BigNumberish],
    _jobID: BytesLike,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "registerProvingKey(uint256,address,uint256[2],bytes32)"(
    _fee: BigNumberish,
    _oracle: string,
    _publicProvingKey: [BigNumberish, BigNumberish],
    _jobID: BytesLike,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  serviceAgreements(
    arg0: BytesLike,
    overrides?: CallOverrides
  ): Promise<
    [string, BigNumber, string] & {
      vRFOracle: string;
      fee: BigNumber;
      jobID: string;
    }
  >;

  "serviceAgreements(bytes32)"(
    arg0: BytesLike,
    overrides?: CallOverrides
  ): Promise<
    [string, BigNumber, string] & {
      vRFOracle: string;
      fee: BigNumber;
      jobID: string;
    }
  >;

  withdraw(
    _recipient: string,
    _amount: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "withdraw(address,uint256)"(
    _recipient: string,
    _amount: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  withdrawableTokens(
    arg0: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  "withdrawableTokens(address)"(
    arg0: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  callStatic: {
    PRESEED_OFFSET(overrides?: CallOverrides): Promise<BigNumber>;

    "PRESEED_OFFSET()"(overrides?: CallOverrides): Promise<BigNumber>;

    PROOF_LENGTH(overrides?: CallOverrides): Promise<BigNumber>;

    "PROOF_LENGTH()"(overrides?: CallOverrides): Promise<BigNumber>;

    PUBLIC_KEY_OFFSET(overrides?: CallOverrides): Promise<BigNumber>;

    "PUBLIC_KEY_OFFSET()"(overrides?: CallOverrides): Promise<BigNumber>;

    callbacks(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<
      [string, BigNumber, string] & {
        callbackContract: string;
        randomnessFee: BigNumber;
        seedAndBlockNum: string;
      }
    >;

    "callbacks(bytes32)"(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<
      [string, BigNumber, string] & {
        callbackContract: string;
        randomnessFee: BigNumber;
        seedAndBlockNum: string;
      }
    >;

    fulfillRandomnessRequest(
      requestId: BytesLike,
      randomness: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    "fulfillRandomnessRequest(bytes32,uint256)"(
      requestId: BytesLike,
      randomness: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    hashOfKey(
      _publicKey: [BigNumberish, BigNumberish],
      overrides?: CallOverrides
    ): Promise<string>;

    "hashOfKey(uint256[2])"(
      _publicKey: [BigNumberish, BigNumberish],
      overrides?: CallOverrides
    ): Promise<string>;

    onTokenTransfer(
      _sender: string,
      _fee: BigNumberish,
      _data: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;

    "onTokenTransfer(address,uint256,bytes)"(
      _sender: string,
      _fee: BigNumberish,
      _data: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;

    registerProvingKey(
      _fee: BigNumberish,
      _oracle: string,
      _publicProvingKey: [BigNumberish, BigNumberish],
      _jobID: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;

    "registerProvingKey(uint256,address,uint256[2],bytes32)"(
      _fee: BigNumberish,
      _oracle: string,
      _publicProvingKey: [BigNumberish, BigNumberish],
      _jobID: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;

    serviceAgreements(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<
      [string, BigNumber, string] & {
        vRFOracle: string;
        fee: BigNumber;
        jobID: string;
      }
    >;

    "serviceAgreements(bytes32)"(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<
      [string, BigNumber, string] & {
        vRFOracle: string;
        fee: BigNumber;
        jobID: string;
      }
    >;

    withdraw(
      _recipient: string,
      _amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    "withdraw(address,uint256)"(
      _recipient: string,
      _amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    withdrawableTokens(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "withdrawableTokens(address)"(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  filters: {
    NewServiceAgreement(keyHash: null, fee: null): EventFilter;

    RandomnessRequest(
      keyHash: null,
      seed: null,
      jobID: BytesLike | null,
      sender: null,
      fee: null,
      requestID: null
    ): EventFilter;

    RandomnessRequestFulfilled(requestId: null, output: null): EventFilter;
  };

  estimateGas: {
    PRESEED_OFFSET(overrides?: CallOverrides): Promise<BigNumber>;

    "PRESEED_OFFSET()"(overrides?: CallOverrides): Promise<BigNumber>;

    PROOF_LENGTH(overrides?: CallOverrides): Promise<BigNumber>;

    "PROOF_LENGTH()"(overrides?: CallOverrides): Promise<BigNumber>;

    PUBLIC_KEY_OFFSET(overrides?: CallOverrides): Promise<BigNumber>;

    "PUBLIC_KEY_OFFSET()"(overrides?: CallOverrides): Promise<BigNumber>;

    callbacks(arg0: BytesLike, overrides?: CallOverrides): Promise<BigNumber>;

    "callbacks(bytes32)"(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    fulfillRandomnessRequest(
      requestId: BytesLike,
      randomness: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "fulfillRandomnessRequest(bytes32,uint256)"(
      requestId: BytesLike,
      randomness: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    hashOfKey(
      _publicKey: [BigNumberish, BigNumberish],
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "hashOfKey(uint256[2])"(
      _publicKey: [BigNumberish, BigNumberish],
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    onTokenTransfer(
      _sender: string,
      _fee: BigNumberish,
      _data: BytesLike,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "onTokenTransfer(address,uint256,bytes)"(
      _sender: string,
      _fee: BigNumberish,
      _data: BytesLike,
      overrides?: Overrides
    ): Promise<BigNumber>;

    registerProvingKey(
      _fee: BigNumberish,
      _oracle: string,
      _publicProvingKey: [BigNumberish, BigNumberish],
      _jobID: BytesLike,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "registerProvingKey(uint256,address,uint256[2],bytes32)"(
      _fee: BigNumberish,
      _oracle: string,
      _publicProvingKey: [BigNumberish, BigNumberish],
      _jobID: BytesLike,
      overrides?: Overrides
    ): Promise<BigNumber>;

    serviceAgreements(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "serviceAgreements(bytes32)"(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    withdraw(
      _recipient: string,
      _amount: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "withdraw(address,uint256)"(
      _recipient: string,
      _amount: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    withdrawableTokens(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "withdrawableTokens(address)"(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    PRESEED_OFFSET(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "PRESEED_OFFSET()"(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    PROOF_LENGTH(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "PROOF_LENGTH()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    PUBLIC_KEY_OFFSET(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "PUBLIC_KEY_OFFSET()"(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    callbacks(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "callbacks(bytes32)"(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    fulfillRandomnessRequest(
      requestId: BytesLike,
      randomness: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "fulfillRandomnessRequest(bytes32,uint256)"(
      requestId: BytesLike,
      randomness: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    hashOfKey(
      _publicKey: [BigNumberish, BigNumberish],
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "hashOfKey(uint256[2])"(
      _publicKey: [BigNumberish, BigNumberish],
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    onTokenTransfer(
      _sender: string,
      _fee: BigNumberish,
      _data: BytesLike,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "onTokenTransfer(address,uint256,bytes)"(
      _sender: string,
      _fee: BigNumberish,
      _data: BytesLike,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    registerProvingKey(
      _fee: BigNumberish,
      _oracle: string,
      _publicProvingKey: [BigNumberish, BigNumberish],
      _jobID: BytesLike,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "registerProvingKey(uint256,address,uint256[2],bytes32)"(
      _fee: BigNumberish,
      _oracle: string,
      _publicProvingKey: [BigNumberish, BigNumberish],
      _jobID: BytesLike,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    serviceAgreements(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "serviceAgreements(bytes32)"(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    withdraw(
      _recipient: string,
      _amount: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "withdraw(address,uint256)"(
      _recipient: string,
      _amount: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    withdrawableTokens(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "withdrawableTokens(address)"(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}
