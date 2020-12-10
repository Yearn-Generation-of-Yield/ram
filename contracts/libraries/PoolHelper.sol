// SPDX-License-Identifier: UNLICENSED;
pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol";
import "../StorageState.sol";

library PoolHelper {
    using SafeMath for uint256;

    function getPool(uint256 _poolId, YGYStorageV1 _storage)
        internal
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

    function getWholeRewards(
        YGYStorageV1.PoolInfo memory self,
        YGYStorageV1 _storage
    ) internal view returns (uint256 ramRewardsWhole, uint256 ygyRewardsWhole) {
        uint256 ramRewardWhole = _storage
            .pendingRewards()
            .mul(self.allocPoint)
            .div(_storage.totalAllocPoint());

        uint256 ygyRewardWhole = _storage
            .pendingYGYRewards()
            .mul(self.allocPoint)
            .div(_storage.totalAllocPoint());
        return (ramRewardWhole, ygyRewardWhole);
    }

    // Calculate RAMPerShare, accYGYPerShare using effective pool staked supply (not just total supply)
    function updateShares(
        YGYStorageV1.PoolInfo memory self,
        uint256 _ygyFee,
        uint256 _ramFee,
        YGYStorageV1 _storage
    ) internal {
        uint256 tokenSupply = self.token.balanceOf(address(this));
        uint256 effectivePoolStakedSupply = tokenSupply.add(
            self.effectiveAdditionalTokensFromBoosts
        );
        (uint256 ramRewardsWhole, uint256 ygyRewardsWhole) = getWholeRewards(
            self,
            _storage
        );
        self.accYGYPerShare = self.accYGYPerShare.add(
            ygyRewardsWhole.sub(_ygyFee).mul(1e12).div(
                effectivePoolStakedSupply
            )
        );
        self.accRAMPerShare = self.accRAMPerShare.add(
            ramRewardsWhole.sub(_ramFee).mul(1e12).div(
                effectivePoolStakedSupply
            )
        );
    }
}
