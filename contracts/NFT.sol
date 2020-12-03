// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./ERC721.sol";

contract NFT is ERC721, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant DELEGATOR_ROLE = keccak256("DELEGATOR_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    // Pauseble?
    bool paused;
    bool isPausableToken;

    // Capped?
    bool isCapped;
    uint256 tokenCap;

    // Delegations for users.
    struct Delegation {
        uint256 tokenId;
        bool exists;
    }

    // Delegate mapping for addresses and their count
    mapping(address => Delegation) public delegations;
    uint256 delegateCount;

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _tokenURI,
        address admin,
        bool _isPausableToken,
        bool _isCapped,
        uint256 _tokenCap
    ) public ERC721(_name, _symbol, _tokenURI) {
        isPausableToken = _isPausableToken;
        isCapped = _isCapped;
        tokenCap = _tokenCap;

        _setupRole(DEFAULT_ADMIN_ROLE, admin);
        _setupRole(MINTER_ROLE, _msgSender());
        _setupRole(DELEGATOR_ROLE, _msgSender());
        _setupRole(PAUSER_ROLE, admin);
    }

    /**
     * @dev Instead of minting tokens to users, some will only be delegated.
     * This will prevent misusing the system for example LINK NFT's.
     */
    function delegate(address _to) external {
        require(hasRole(DELEGATOR_ROLE, msg.sender), "Not allowed");
        uint256 tokenId = mint(_msgSender());
        // Mint the token to the delegatos
        Delegation memory delegation = Delegation({
            tokenId: tokenId,
            exists: true
        });
        delegations[_to] = delegation;
        delegateCount++;
    }

    /**
     * @dev Undelegation will burn the token from the delegator and clear the delegation entry.
     */
    function undelegate(address _who, uint256 _tokenId) public {
        require(hasRole(DELEGATOR_ROLE, _msgSender()), "Not allowed");
        Delegation memory delegation = delegations[_who];

        if (delegation.exists && delegation.tokenId == _tokenId) {
            delete delegations[_who];
            _burn(_tokenId);
            delegateCount--;
        }
    }

    /**
     * @dev Check if user has delegation for this particular token.
     */
    function hasDelegation(address _who) public view returns (bool) {
        Delegation memory delegation = delegations[_who];
        return delegation.exists;
    }

    /**
     * @dev Used for tokens that are transferrable and non-delegating.
     */
    function burn(uint256 _tokenId) external {
        require(
            ownerOf(_tokenId) == _msgSender() ||
                hasRole(MINTER_ROLE, _msgSender()),
            "Not allowed"
        );
        _burn(_tokenId);
    }

    /**
     * @dev Used for tokens that are transferrable and non-delegating.
     */
    function mint(address to) public override returns (uint256 tokenId) {
        require(
            hasRole(MINTER_ROLE, _msgSender()) ||
                hasRole(DELEGATOR_ROLE, _msgSender()),
            "Not allowed"
        );
        return super.mint(to);
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
            !paused ||
                (from == address(0) &&
                    (hasRole(MINTER_ROLE, msg.sender) ||
                        hasRole(DELEGATOR_ROLE, msg.sender))),
            "Token is not transferrable at the moment."
        );
    }

    /**
     * @dev Toggle the transfer sttatus of the NFT's.
     */
    function togglePause() external {
        require(isPausableToken, "This token cannot be paused");
        require(
            hasRole(PAUSER_ROLE, msg.sender) ||
                hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Not allowed"
        );
        paused = !paused;
    }
}
