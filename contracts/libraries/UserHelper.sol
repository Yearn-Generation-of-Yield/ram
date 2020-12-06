pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;

import "../YGYStorageV1.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

library UserHelper {
    using SafeMath for uint256;

    function effectiveAmount(YGYStorageV1.UserInfo storage self)
        internal
        view
        returns (uint256)
    {
        return self.amount.add(self.boostAmount);
    }

    function userRewards(
        YGYStorageV1.UserInfo storage self,
        uint256 _poolId,
        YGYStorageV1 _storage
    ) internal view returns (uint256 RAMRewards, uint256 YGYRewards) {
        (, , uint256 accRAMPerShare, uint256 accYGYPerShare, , ) = YGYStorageV1(
            _storage
        )
            .getPoolInfo(_poolId);
        return (
            effectiveAmount(self).mul(accRAMPerShare).div(1e12).sub(
                self.rewardDebt
            ),
            effectiveAmount(self).mul(accYGYPerShare).div(1e12).sub(
                self.rewardDebtYGY
            )
        );
    }

    // Returns the multiplier for user.
    function getTotalMultiplier(
        YGYStorageV1.UserInfo storage self,
        uint256 _level,
        YGYStorageV1 _storage
    ) internal view returns (uint256) {
        return _storage.getBoostLevelMultiplier(_level);
    }

    function updateDebts(
        YGYStorageV1.UserInfo storage self,
        YGYStorageV1.PoolInfo storage _pool
    ) internal {
        self.rewardDebt = effectiveAmount(self).mul(_pool.accRAMPerShare).div(
            1e12
        );
        self.rewardDebtYGY = effectiveAmount(self)
            .mul(_pool.accYGYPerShare)
            .div(1e12);
    }

    function adjustEffectiveStake(
        YGYStorageV1.UserInfo storage self,
        YGYStorageV1.PoolInfo storage _pool,
        uint256 _newLevel,
        bool _isWithdraw,
        YGYStorageV1 _storage
    ) internal {
        uint256 prevBalancesAccounting = self.boostAmount;
        // Calculate and set self's new accounting balance
        uint256 accTotalMultiplier = getTotalMultiplier(
            self,
            _newLevel > 0 ? _newLevel : self.boostLevel,
            _storage
        );
        uint256 newBalancesAccounting = self.amount.mul(accTotalMultiplier).div(
            100
        );

        self.boostAmount = newBalancesAccounting;

        // Adjust total accounting supply accordingly
        if (_isWithdraw) {
            _pool.effectiveAdditionalTokensFromBoosts = _pool
                .effectiveAdditionalTokensFromBoosts
                .sub(prevBalancesAccounting.sub(newBalancesAccounting));
        } else {
            _pool.effectiveAdditionalTokensFromBoosts = _pool
                .effectiveAdditionalTokensFromBoosts
                .add(newBalancesAccounting.sub(prevBalancesAccounting));
        }
    }
}
