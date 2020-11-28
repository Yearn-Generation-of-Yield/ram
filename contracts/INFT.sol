// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

interface INFT {
    function mint(address recipient) external;
    function balanceOf(address owner) external view returns (uint256);
}
