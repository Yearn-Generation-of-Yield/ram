// SPDX-License-Identifier: UNLICENSED;
pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;

import "../YGYStorageV1.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

library YGYGlobal {
    using SafeMath for uint256;

    function averageFeesPerBlockSinceStart(YGYStorageV1 _storage)
        external
        view
        returns (uint256 averagePerBlock)
    {
        return
            _storage
                .cumulativeRewardsSinceStart()
                .add(_storage.rewardsInThisEpoch())
                .div(block.number.sub(_storage.RAMVaultStartBlock()));
    }

    // Returns averge fees in this epoch
    function averageFeesPerBlockEpoch(YGYStorageV1 _storage)
        external
        view
        returns (uint256 averagePerBlock)
    {
        return
            _storage.rewardsInThisEpoch().div(
                block.number.sub(_storage.epochCalculationStartBlock())
            );
    }
}
