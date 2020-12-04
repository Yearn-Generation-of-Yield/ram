// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;

import "./INFT.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./NFT.sol";
import "@nomiclabs/buidler/console.sol";

contract NFTFactory is Ownable {
    address[] public contracts;
    address public lastContractAddress;
    address public bondedContract;

    mapping(address => bool) public ownedContracts;

    struct NFTProperty {
        string pType;
        uint256 pValue;
    }

    mapping(address => NFTProperty[]) public nftProperties;

    event NFTMinted(string tokenName, address to, uint256 tokenId);
    event NFTBurned(string tokenName, address from, uint256 tokenId);

    function deployNFT(
        string memory name,
        string memory symbol,
        string memory tokenURI,
        address admin,
        bool allowTrade,
        bool isCapped,
        uint256 capAmount
    ) public returns (NFT newContract) {
        require(
            _msgSender() == owner() || _msgSender() == bondedContract,
            "Invalid caller: can't deploy NFT"
        );

        // Deploy new NFT
        NFT nft = new NFT(
            name,
            symbol,
            tokenURI,
            admin,
            allowTrade,
            isCapped,
            capAmount
        );

        address addressNFT = address(nft);

        // Add to owned NFTs
        contracts.push(addressNFT);
        lastContractAddress = addressNFT;
        ownedContracts[addressNFT] = true;

        return nft;
    }

    function isOwner(
        INFT _nft,
        address _who,
        uint256 tokenId
    ) external view returns (bool) {
        return _nft.ownerOf(tokenId) == _who;
    }

    function tokenURI(INFT _nft) external view returns (string memory) {
        return _nft._tokenURI();
    }

    function balanceOf(INFT _nft, address _who)
        external
        view
        returns (uint256)
    {
        console.log("Querying balance", _who);
        return _nft.balanceOf(_who);
    }

    function mint(INFT _nft, address _to) external returns (uint256) {
        require(
            _msgSender() == bondedContract || _msgSender() == owner(),
            "INVCALLER"
        );
        uint256 tokenId = _nft.mint(_to);
        emit NFTMinted(_nft.name(), _to, tokenId);
        return tokenId;
    }

    function burn(INFT _nft, uint256 _tokenId) external {
        require(
            _nft.ownerOf(_tokenId) == _msgSender() ||
                _msgSender() == bondedContract,
            "INVCALLER"
        );
        _nft.burn(_tokenId);
        emit NFTBurned(_nft.name(), _msgSender(), _tokenId);
    }

    function setNFTProperties(address _nft, NFTProperty[] memory _properties)
        external
        onlyOwner
    {
        NFTProperty[] storage properties;
        for (uint256 i; i < _properties.length; i++) {
            properties.push(_properties[i]);
        }
        nftProperties[_nft] = properties;
    }

    function bondContract(address _addr) external onlyOwner returns (bool) {
        bondedContract = _addr;
        return true;
    }

    function getContractCount() external view returns (uint256 contractCount) {
        return contracts.length;
    }
}
