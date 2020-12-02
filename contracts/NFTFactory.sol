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

    event NFTMinted(string tokenName, address to, uint256 tokenId);
    event NFTDelegated(string tokenName, address to, uint256 tokenId);
    event NFTUndelegated(string tokenName, address from, uint256 tokenId);
    event NFTBurned(string tokenName, address from, uint256 tokenId);

    function deployNFT(
        string memory name,
        string memory symbol,
        string memory tokenURI,
        address admin,
        bool isPausableToken,
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
            isPausableToken,
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
    ) external returns (bool) {
        return _nft.ownerOf(tokenId) == _who;
    }

    function balanceOf(INFT _nft, address _owner)
        public
        view
        returns (uint256)
    {
        return _nft.balanceOf(_owner);
    }

    function hasDelegation(INFT _nft, address _who)
        external
        view
        returns (bool)
    {
        _nft.hasDelegation(_who);
    }

    function delegate(INFT _nft, address _to) external {
        require(
            _msgSender() == bondedContract,
            "Invalid caller: can't delegate NFT"
        );
        uint256 tokenId = _nft.delegate(_to);
        emit NFTDelegated(_nft.name(), _to, tokenId);
    }

    function undelegate(
        INFT _nft,
        address _who,
        uint256 _tokenId
    ) external {
        require(
            _msgSender() == bondedContract,
            "Invalid caller: can't delegate NFT"
        );
        _nft.undelegate(_who, _tokenId);
        emit NFTUndelegated(_nft.name(), _who, _tokenId);
    }

    function mint(INFT _nft, address _to) external {
        require(
            _msgSender() == bondedContract,
            "Invalid caller: can't mint NFT"
        );
        uint256 tokenId = _nft.mint(_to);
        emit NFTMinted(_nft.name(), _to, tokenId);
    }

    function burn(INFT _nft, uint256 _tokenId) external {
        require(
            _nft.ownerOf(_tokenId) == _msgSender() ||
                _msgSender() == bondedContract,
            "Invalid caller: cannot burn"
        );
        _nft.burn(_tokenId);
        emit NFTBurned(_nft.name(), _msgSender(), _tokenId);
    }

    function bondContract(address addr) public onlyOwner returns (bool) {
        bondedContract = addr;
        return true;
    }

    function getContractCount() public view returns (uint256 contractCount) {
        return contracts.length;
    }
}
