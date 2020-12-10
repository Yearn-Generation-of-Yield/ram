pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol";
import "../StorageState.sol";

library UserHelper {
    using SafeMath for uint256;

    function effectiveAmount(YGYStorageV1.UserInfo memory self)
        internal
        view
        returns (uint256)
    {
        return self.amount.add(self.boostAmount);
    }

    function getUser(
        uint256 _poolId,
        address _user,
        YGYStorageV1 _storage
    ) internal view returns (YGYStorageV1.UserInfo memory) {
        (
            uint256 amount,
            uint256 rewardDebt,
            uint256 rewardDebtYGY,
            uint256 boostAmount,
            uint256 boostLevel,
            uint256 spentMultiplierTokens,
            bool hasNFTBoostApplied
        ) = _storage.userInfo(_poolId, _user);

        return
            YGYStorageV1.UserInfo({
                amount: amount,
                rewardDebt: rewardDebt,
                rewardDebtYGY: rewardDebtYGY,
                boostAmount: boostAmount,
                boostLevel: boostLevel,
                spentMultiplierTokens: spentMultiplierTokens,
                hasNFTBoostApplied: hasNFTBoostApplied
            });
    }

    function userRewards(
        YGYStorageV1.UserInfo memory self,
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
        YGYStorageV1.UserInfo memory self,
        uint256 _level,
        YGYStorageV1 _storage
    ) internal view returns (uint256) {
        return _storage.getBoostLevelMultiplier(_level);
    }

    function updateDebts(
        YGYStorageV1.UserInfo memory self,
        YGYStorageV1.PoolInfo memory _pool
    ) internal view {
        self.rewardDebt = effectiveAmount(self).mul(_pool.accRAMPerShare).div(
            1e12
        );
        self.rewardDebtYGY = effectiveAmount(self)
            .mul(_pool.accYGYPerShare)
            .div(1e12);
    }

    function adjustEffectiveStake(
        YGYStorageV1.UserInfo memory self,
        YGYStorageV1.PoolInfo memory _pool,
        uint256 _newLevel,
        bool _isWithdraw,
        uint256 _nftBoost,
        YGYStorageV1 _storage
    ) internal view {
        uint256 prevBalancesAccounting = self.boostAmount;
        // Calculate and set self's new accounting balance
        uint256 accTotalMultiplier = getTotalMultiplier(
            self,
            _newLevel > 0 ? _newLevel : self.boostLevel,
            _storage
        );

        if (_nftBoost > 0) {
            accTotalMultiplier = accTotalMultiplier.add(_nftBoost);
            self.hasNFTBoostApplied = true;
        }

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
