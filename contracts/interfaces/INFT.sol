// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;
import "../YGYStorageV1.sol";

interface INFT {
    function mint(
        address _to,
        uint256 _randomness,
        YGYStorageV1 _storage
    ) external returns (uint256);

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external;

    function totalSupply() external view returns (uint256);

    function _tokenURI() external view returns (string memory);

    function burn(uint256 tokenId) external;

    function ownerOf(uint256 tokenId) external view returns (address);

    function name() external view returns (string memory);

    function balanceOf(address owner) external view returns (uint256);

}
