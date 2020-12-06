// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./ERC721.sol";
import "hardhat/console.sol";
import "./YGYStorageV1.sol";

contract NFT is ERC721, AccessControl {
    bytes32 public constant SYSTEM_ROLE = keccak256("SYSTEM_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    uint256 contractId;
    // Tradeable?
    bool allowTrade;

    // Capped?
    bool isCapped;
    uint256 tokenCap;

    // Props for unique token
    mapping(uint256 => YGYStorageV1.NFTProperty) public properties;
    uint256 propertyChoices;

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _tokenURI,
        uint256 _contractId,
        uint256 _propertyChoices,
        address _superAdmin,
        bool _allowTrade,
        bool _isCapped,
        uint256 _tokenCap
    ) public ERC721(_name, _symbol, _tokenURI) {
        allowTrade = _allowTrade;
        isCapped = _isCapped;
        tokenCap = _tokenCap;
        contractId = _contractId;
        propertyChoices = _propertyChoices;

        _setupRole(DEFAULT_ADMIN_ROLE, _superAdmin);
        _setupRole(SYSTEM_ROLE, _msgSender());
        _setupRole(SYSTEM_ROLE, _superAdmin);
    }

    /**
     * @dev Used for tokens that are transferrable and non-delegating.
     */
    function burn(uint256 _tokenId) external {
        require(
            ownerOf(_tokenId) == _msgSender() ||
                hasRole(SYSTEM_ROLE, _msgSender()),
            "Not allowed"
        );
        _burn(_tokenId);
    }

    /**
     * @dev Mint a token and set it's property
     */
    function mint(
        address to,
        uint256 _randomness,
        YGYStorageV1 _storage
    ) public returns (uint256 _tokenId) {
        require(
            !isCapped || (isCapped && totalSupply() <= tokenCap),
            "NFT Limit reached"
        );
        require(hasRole(SYSTEM_ROLE, _msgSender()), "Not allowed");

        // Mint the token, get the unique id.
        uint256 tokenId = super.mint(to);

        // Get a random index for property selection
        uint256 propIndex;
        if (propertyChoices > 1) {
            propIndex = _randomness.mod(propertyChoices);
        }
        // Random properties gotten
        (string memory pType, uint256 pValue, bytes32 extra) = _storage
            .getNFTProperty(contractId, propIndex);

        // Finally, set the property.
        properties[tokenId] = YGYStorageV1.NFTProperty(pType, pValue, extra);
        return tokenId;
    }

    /**
     * @dev Used to halt transfers while maintaining minting ability for the delegator / minter.
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override {
        require(
            (allowTrade || hasRole(SYSTEM_ROLE, _msgSender())) ||
                (!allowTrade && hasRole(SYSTEM_ROLE, to)),
            "External trades not allowed"
        );
    }
}
