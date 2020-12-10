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

interface INFTFactoryInterface extends ethers.utils.Interface {
  functions: {
    "balanceOf(address,address)": FunctionFragment;
    "bondContract(address)": FunctionFragment;
    "burn(address,uint256)": FunctionFragment;
    "deployNFT(string,string,string)": FunctionFragment;
    "mint(address,address)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "balanceOf",
    values: [string, string]
  ): string;
  encodeFunctionData(
    functionFragment: "bondContract",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "burn",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "deployNFT",
    values: [string, string, string]
  ): string;
  encodeFunctionData(
    functionFragment: "mint",
    values: [string, string]
  ): string;

  decodeFunctionResult(functionFragment: "balanceOf", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "bondContract",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "burn", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "deployNFT", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "mint", data: BytesLike): Result;

  events: {};
}

export class INFTFactory extends Contract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  on(event: EventFilter | string, listener: Listener): this;
  once(event: EventFilter | string, listener: Listener): this;
  addListener(eventName: EventFilter | string, listener: Listener): this;
  removeAllListeners(eventName: EventFilter | string): this;
  removeListener(eventName: any, listener: Listener): this;

  interface: INFTFactoryInterface;

  functions: {
    balanceOf(
      _nft: string,
      _of: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "balanceOf(address,address)"(
      _nft: string,
      _of: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    bondContract(
      addr: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "bondContract(address)"(
      addr: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    burn(
      _nft: string,
      _tokenId: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "burn(address,uint256)"(
      _nft: string,
      _tokenId: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    deployNFT(
      name: string,
      symbol: string,
      tokenURI: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "deployNFT(string,string,string)"(
      name: string,
      symbol: string,
      tokenURI: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    mint(
      _nft: string,
      recipient: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "mint(address,address)"(
      _nft: string,
      recipient: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;
  };

  balanceOf(
    _nft: string,
    _of: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "balanceOf(address,address)"(
    _nft: string,
    _of: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  bondContract(
    addr: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "bondContract(address)"(
    addr: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  burn(
    _nft: string,
    _tokenId: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "burn(address,uint256)"(
    _nft: string,
    _tokenId: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  deployNFT(
    name: string,
    symbol: string,
    tokenURI: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "deployNFT(string,string,string)"(
    name: string,
    symbol: string,
    tokenURI: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  mint(
    _nft: string,
    recipient: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "mint(address,address)"(
    _nft: string,
    recipient: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  callStatic: {
    balanceOf(
      _nft: string,
      _of: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "balanceOf(address,address)"(
      _nft: string,
      _of: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    bondContract(addr: string, overrides?: CallOverrides): Promise<boolean>;

    "bondContract(address)"(
      addr: string,
      overrides?: CallOverrides
    ): Promise<boolean>;

    burn(
      _nft: string,
      _tokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    "burn(address,uint256)"(
      _nft: string,
      _tokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    deployNFT(
      name: string,
      symbol: string,
      tokenURI: string,
      overrides?: CallOverrides
    ): Promise<string>;

    "deployNFT(string,string,string)"(
      name: string,
      symbol: string,
      tokenURI: string,
      overrides?: CallOverrides
    ): Promise<string>;

    mint(
      _nft: string,
      recipient: string,
      overrides?: CallOverrides
    ): Promise<void>;

    "mint(address,address)"(
      _nft: string,
      recipient: string,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {};

  estimateGas: {
    balanceOf(
      _nft: string,
      _of: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "balanceOf(address,address)"(
      _nft: string,
      _of: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    bondContract(addr: string, overrides?: Overrides): Promise<BigNumber>;

    "bondContract(address)"(
      addr: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    burn(
      _nft: string,
      _tokenId: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "burn(address,uint256)"(
      _nft: string,
      _tokenId: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    deployNFT(
      name: string,
      symbol: string,
      tokenURI: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "deployNFT(string,string,string)"(
      name: string,
      symbol: string,
      tokenURI: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    mint(
      _nft: string,
      recipient: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "mint(address,address)"(
      _nft: string,
      recipient: string,
      overrides?: Overrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    balanceOf(
      _nft: string,
      _of: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "balanceOf(address,address)"(
      _nft: string,
      _of: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    bondContract(
      addr: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "bondContract(address)"(
      addr: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    burn(
      _nft: string,
      _tokenId: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "burn(address,uint256)"(
      _nft: string,
      _tokenId: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    deployNFT(
      name: string,
      symbol: string,
      tokenURI: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "deployNFT(string,string,string)"(
      name: string,
      symbol: string,
      tokenURI: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    mint(
      _nft: string,
      recipient: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "mint(address,address)"(
      _nft: string,
      recipient: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;
  };
}
