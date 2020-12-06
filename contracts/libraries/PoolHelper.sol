// SPDX-License-Identifier: UNLICENSED;
pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;

import "../YGYStorageV1.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

library PoolHelper {
    using SafeMath for uint256;

    function getWholeRewards(
        YGYStorageV1.PoolInfo storage self,
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
        YGYStorageV1.PoolInfo storage self,
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
