// SPDX-License-Identifier: UNLICENSED;
pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol";
import "hardhat/console.sol";
import "../YGYStorageV1.sol";

library PoolHelper {
    using SafeMath for uint256;

    function getPool(uint256 _poolId, YGYStorageV1 _storage)
        internal
        view
        returns (YGYStorageV1.PoolInfo memory)
    {
        (
            IERC20 token,
            uint256 allocPoint,
            uint256 accRAMPerShare,
            uint256 accYGYPerShare,
            bool withdrawable,
            uint256 effectiveAdditionalTokensFromBoosts
        ) = _storage.poolInfo(_poolId);
        return
            YGYStorageV1.PoolInfo({
                token: token,
                allocPoint: allocPoint,
                accRAMPerShare: accRAMPerShare,
                accYGYPerShare: accYGYPerShare,
                withdrawable: withdrawable,
                effectiveAdditionalTokensFromBoosts: effectiveAdditionalTokensFromBoosts
            });
    }

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
