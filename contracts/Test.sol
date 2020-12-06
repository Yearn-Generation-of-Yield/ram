pragma solidity 0.6.12;

import "@openzeppelin/contracts-ethereum-package/contracts/access/Ownable.sol";
import "./YGYStorageV1.sol";

contract Test is OwnableUpgradeSafe, YGYStorageV1 {
    function initialize(
        address _ram,
        address _ygy,
        address _teamaddr,
        address _regeneratoraddr
    ) public initializer {
        OwnableUpgradeSafe.__Ownable_init();
        ram = INBUNIERC20(_ram);
        ygy = IERC20(_ygy);
        teamaddr = _teamaddr;
        regeneratoraddr = _regeneratoraddr;
        RAMVaultStartBlock = block.number;

        // Initial boost multipliers and costs
        boostLevelCosts[1] = 5 * 1e18; // 5 RAM tokens
        boostLevelCosts[2] = 15 * 1e18; // 15 RAM tokens
        boostLevelCosts[3] = 30 * 1e18; // 30 RAM tokens
        boostLevelCosts[4] = 60 * 1e18; // 60 RAM tokens
        boostLevelMultipliers[1] = 5; // 5%
        boostLevelMultipliers[2] = 15; // 15%
        boostLevelMultipliers[3] = 30; // 30%
        boostLevelMultipliers[4] = 60; // 60%
    }
}
