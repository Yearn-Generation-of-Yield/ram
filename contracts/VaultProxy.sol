pragma solidity ^0.6.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/access/Ownable.sol";
import "./YGYStorageV1.sol";

contract VaultProxy is OwnableUpgradeSafe, YGYStorageV1 {
    address implementation;

    function initialize(address _implementation, address) external onlyOwner {
        implementation = _implementation;
    }

    receive() external payable {}

    fallback() external payable {
        address addr = implementation;

        assembly {
            calldatacopy(0, 0, calldatasize())
            let result := delegatecall(gas(), addr, 0, calldatasize(), 0, 0)
            returndatacopy(0, 0, returndatasize())
            switch result
                case 0 {
                    revert(0, returndatasize())
                }
                default {
                    return(0, returndatasize())
                }
        }
    }
}
