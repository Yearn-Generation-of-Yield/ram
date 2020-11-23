// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

import "./NFT.sol";
import "./INFT.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTFactory is Ownable {

    address[] public contracts;
    address public lastContractAddress;
    address public bondedContract;

    mapping(address => bool) public ownedContracts;

    function deployNFT(
        string memory name,
        string memory symbol,
        string memory tokenURI
    )
        public
        returns(NFT newContract)
    {
      require(msg.sender == owner() || msg.sender == bondedContract, "Invalid caller: can't deploy NFT");

      // Deploy new NFT
      NFT nft = new NFT(name, symbol, tokenURI);
      address addressNFT = address(nft);

      // Add to owned NFTs
      contracts.push(addressNFT);
      lastContractAddress = addressNFT;
      ownedContracts[addressNFT] = true;

      return nft;
    }

    function mint(INFT _nft, address recipient) public {
      require(msg.sender == bondedContract, "Invalid caller: can't mint NFT");
      _nft.mint(recipient);
    }

    function bondContract(address addr) public onlyOwner returns(bool) {
        bondedContract = addr;
        return true;
    }

    function getContractCount() public view returns(uint contractCount) {
      return contracts.length;
    }
}
