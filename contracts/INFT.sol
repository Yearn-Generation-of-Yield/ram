// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

interface INFT {
    function mint(address _to) external returns (uint256);

    // function undelegate(address _who, uint256 _tokenId) external;

    // function delegate(address _to) external returns (uint256);

    // function hasDelegation(address _who) external view returns (bool);
    function _tokenURI() external view returns (string memory);

    function burn(uint256 tokenId) external;

    function ownerOf(uint256 tokenId) external view returns (address);

    function name() external view returns (string memory);

    function balanceOf(address owner) external view returns (uint256);
}
