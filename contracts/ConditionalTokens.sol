// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ConditionalTokens
 * @notice Core conditional token framework for Octagon Predict
 * @dev Adapted from Gnosis Conditional Tokens for VeChainThor
 * 
 * Binary outcome markets: Each market has N outcome tokens
 * Users deposit collateral to mint full sets of outcome tokens
 * After resolution, winning tokens can be redeemed for collateral
 * 
 * Key design: 1 unit of collateral = 1 unit of EACH outcome token
 * After resolution, 1 winning token = 1 unit of collateral (minus fees from losers)
 */
contract ConditionalTokens is ERC1155, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct Market {
        bytes32 conditionId;
        address collateralToken;    // address(0) for native VET
        uint256 outcomeSlotCount;
        uint256 totalCollateral;    // Total collateral in escrow
        uint256[] payoutNumerators; // Payout per outcome (set on resolution)
        uint256 payoutDenominator;  // Sum of numerators (for proportional payouts)
        bool resolved;
        string eventUri;
    }

    mapping(bytes32 => Market) public markets;
    
    // Track redemptions: conditionId => user => outcomeIndex => redeemed amount
    mapping(bytes32 => mapping(address => mapping(uint256 => uint256))) public redemptions;
    
    address public oracle;
    
    event MarketCreated(
        bytes32 indexed conditionId,
        address indexed collateralToken,
        uint256 outcomeSlotCount,
        string eventUri
    );
    
    event PositionSplit(
        bytes32 indexed conditionId,
        address indexed stakeholder,
        uint256 amount
    );
    
    event PositionMerged(
        bytes32 indexed conditionId,
        address indexed stakeholder,
        uint256 amount
    );
    
    event MarketResolved(
        bytes32 indexed conditionId,
        uint256[] payoutNumerators
    );
    
    event PayoutRedeemed(
        bytes32 indexed conditionId,
        address indexed redeemer,
        uint256[] amounts,
        uint256 payout
    );

    constructor(address _oracle) ERC1155("") Ownable(msg.sender) {
        oracle = _oracle;
    }

    modifier onlyOracle() {
        require(msg.sender == oracle, "Only oracle can call");
        _;
    }

    function createMarket(
        bytes32 conditionId,
        address collateralToken,
        uint256 outcomeSlotCount,
        string calldata eventUri
    ) external onlyOwner {
        require(markets[conditionId].outcomeSlotCount == 0, "Market already exists");
        require(outcomeSlotCount >= 2 && outcomeSlotCount <= 256, "Invalid outcome count");

        markets[conditionId] = Market({
            conditionId: conditionId,
            collateralToken: collateralToken,
            outcomeSlotCount: outcomeSlotCount,
            totalCollateral: 0,
            payoutNumerators: new uint256[](outcomeSlotCount),
            payoutDenominator: 0,
            resolved: false,
            eventUri: eventUri
        });

        emit MarketCreated(conditionId, collateralToken, outcomeSlotCount, eventUri);
    }

    /**
     * @notice Split collateral into complete sets of outcome tokens
     * @dev 1 collateral = 1 of each outcome token (complete set)
     */
    function splitPosition(
        bytes32 conditionId,
        uint256 amount
    ) external payable nonReentrant {
        Market storage market = markets[conditionId];
        require(market.outcomeSlotCount > 0, "Market does not exist");
        require(!market.resolved, "Market already resolved");
        require(amount > 0, "Amount must be positive");

        // Handle collateral deposit
        if (market.collateralToken == address(0)) {
            require(msg.value == amount, "Incorrect VET amount");
        } else {
            require(msg.value == 0, "Do not send VET with ERC20");
            IERC20(market.collateralToken).safeTransferFrom(msg.sender, address(this), amount);
        }

        market.totalCollateral += amount;

        // Mint one of each outcome token
        uint256[] memory ids = new uint256[](market.outcomeSlotCount);
        uint256[] memory amounts = new uint256[](market.outcomeSlotCount);
        
        for (uint256 i = 0; i < market.outcomeSlotCount; i++) {
            ids[i] = getTokenId(conditionId, i);
            amounts[i] = amount;
        }
        
        _mintBatch(msg.sender, ids, amounts, "");

        emit PositionSplit(conditionId, msg.sender, amount);
    }

    /**
     * @notice Merge complete sets back into collateral (before resolution)
     * @dev Must burn equal amounts of ALL outcome tokens
     */
    function mergePositions(
        bytes32 conditionId,
        uint256 amount
    ) external nonReentrant {
        Market storage market = markets[conditionId];
        require(market.outcomeSlotCount > 0, "Market does not exist");
        require(!market.resolved, "Market already resolved");
        require(amount > 0, "Amount must be positive");

        // Verify and burn all outcome tokens
        uint256[] memory ids = new uint256[](market.outcomeSlotCount);
        uint256[] memory amounts = new uint256[](market.outcomeSlotCount);
        
        for (uint256 i = 0; i < market.outcomeSlotCount; i++) {
            ids[i] = getTokenId(conditionId, i);
            amounts[i] = amount;
            require(balanceOf(msg.sender, ids[i]) >= amount, "Insufficient balance");
        }
        
        _burnBatch(msg.sender, ids, amounts);
        market.totalCollateral -= amount;

        // Return collateral using call for VeChain compatibility
        if (market.collateralToken == address(0)) {
            (bool success, ) = payable(msg.sender).call{value: amount}("");
            require(success, "VET transfer failed");
        } else {
            IERC20(market.collateralToken).safeTransfer(msg.sender, amount);
        }

        emit PositionMerged(conditionId, msg.sender, amount);
    }

    /**
     * @notice Resolve market with payout distribution
     * @param conditionId The market to resolve
     * @param payoutNumerators Payout weight per outcome (e.g., [1,0] for binary, outcome 0 wins)
     */
    function resolveMarket(
        bytes32 conditionId,
        uint256[] calldata payoutNumerators
    ) external onlyOracle {
        Market storage market = markets[conditionId];
        require(market.outcomeSlotCount > 0, "Market does not exist");
        require(!market.resolved, "Market already resolved");
        require(payoutNumerators.length == market.outcomeSlotCount, "Invalid payout length");

        uint256 denominator = 0;
        for (uint256 i = 0; i < payoutNumerators.length; i++) {
            market.payoutNumerators[i] = payoutNumerators[i];
            denominator += payoutNumerators[i];
        }
        
        require(denominator > 0, "Invalid payout - no winner");
        market.payoutDenominator = denominator;
        market.resolved = true;

        emit MarketResolved(conditionId, payoutNumerators);
    }

    /**
     * @notice Redeem outcome tokens for collateral payout
     * @dev Can redeem any tokens with non-zero payout numerator
     */
    function redeemPositions(
        bytes32 conditionId,
        uint256[] calldata amounts
    ) external nonReentrant {
        Market storage market = markets[conditionId];
        require(market.resolved, "Market not resolved");
        require(amounts.length == market.outcomeSlotCount, "Invalid amounts length");

        uint256 totalPayout = 0;

        for (uint256 i = 0; i < market.outcomeSlotCount; i++) {
            if (amounts[i] == 0) continue;
            
            uint256 tokenId = getTokenId(conditionId, i);
            uint256 balance = balanceOf(msg.sender, tokenId);
            require(balance >= amounts[i], "Insufficient balance");

            // Calculate payout for this outcome
            if (market.payoutNumerators[i] > 0) {
                uint256 payout = (amounts[i] * market.payoutNumerators[i]) / market.payoutDenominator;
                totalPayout += payout;
            }

            // Burn tokens (even losing tokens can be burned)
            _burn(msg.sender, tokenId, amounts[i]);
            redemptions[conditionId][msg.sender][i] += amounts[i];
        }

        require(totalPayout > 0, "No payout available");
        require(totalPayout <= market.totalCollateral, "Insufficient collateral");
        
        market.totalCollateral -= totalPayout;

        // Transfer payout using call for VeChain compatibility
        if (market.collateralToken == address(0)) {
            (bool success, ) = payable(msg.sender).call{value: totalPayout}("");
            require(success, "VET transfer failed");
        } else {
            IERC20(market.collateralToken).safeTransfer(msg.sender, totalPayout);
        }

        emit PayoutRedeemed(conditionId, msg.sender, amounts, totalPayout);
    }

    function getTokenId(bytes32 conditionId, uint256 outcomeIndex) public pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(conditionId, outcomeIndex)));
    }

    function getMarket(bytes32 conditionId) external view returns (Market memory) {
        return markets[conditionId];
    }

    function getPayoutNumerators(bytes32 conditionId) external view returns (uint256[] memory) {
        return markets[conditionId].payoutNumerators;
    }

    function setOracle(address _oracle) external onlyOwner {
        oracle = _oracle;
    }

    receive() external payable {}
}
