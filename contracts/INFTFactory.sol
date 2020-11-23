// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "./NFT.sol";
import "./INFT.sol";

interface INFTFactory {
    function deployNFT(string memory name, string memory symbol, string memory tokenURI) external returns(NFT newContract);
    function mint(INFT _nft, address recipient) external;
    function bondContract(address addr) external returns(bool);
}
