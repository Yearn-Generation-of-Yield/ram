pragma solidity ^0.6.0;

import "../StorageState.sol";

library StorageLibrary {
    function poolLength(YGYStorageV1 _storage) external view returns (uint256) {
        return _storage.getPoolLength();
    }
}
