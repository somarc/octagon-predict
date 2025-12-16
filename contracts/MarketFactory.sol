// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ConditionalTokens.sol";

/**
 * @title MarketFactory
 * @notice Factory for creating UFC prediction markets on Octagon Predict
 * @dev Deterministic condition IDs, outcome metadata storage
 */
contract MarketFactory is Ownable {
    
    ConditionalTokens public conditionalTokens;
    
    enum MarketType {
        WINNER,
        METHOD_OF_VICTORY,
        GOES_DISTANCE,
        ROUND_PROP,
        EVENT_PROP
    }
    
    struct UFCMarket {
        bytes32 conditionId;
        string eventName;
        string fighterA;
        string fighterB;
        MarketType marketType;
        uint256 eventDate;
        bool active;
        string[] outcomeLabels;     // Human-readable outcome names
        address collateralToken;
    }
    
    bytes32[] public allMarkets;
    mapping(bytes32 => UFCMarket) public ufcMarkets;
    mapping(address => bool) public approvedCollateral;
    
    // Nonce for deterministic but unique IDs
    uint256 private marketNonce;
    
    event UFCMarketCreated(
        bytes32 indexed conditionId,
        string eventName,
        string fighterA,
        string fighterB,
        MarketType marketType,
        string[] outcomeLabels
    );
    
    event CollateralApproved(address indexed token, bool approved);
    event MarketDeactivated(bytes32 indexed conditionId);

    constructor(address _conditionalTokens) Ownable(msg.sender) {
        conditionalTokens = ConditionalTokens(payable(_conditionalTokens));
        approvedCollateral[address(0)] = true; // Native VET
    }

    /**
     * @notice Generate deterministic condition ID
     */
    function generateConditionId(
        string calldata eventName,
        string calldata fighterA,
        string calldata fighterB,
        MarketType marketType
    ) public view returns (bytes32) {
        return keccak256(abi.encodePacked(
            eventName,
            fighterA,
            fighterB,
            uint8(marketType),
            marketNonce
        ));
    }

    /**
     * @notice Create a winner market (binary: Fighter A vs Fighter B)
     */
    function createWinnerMarket(
        string calldata eventName,
        string calldata fighterA,
        string calldata fighterB,
        uint256 eventDate,
        address collateralToken,
        string calldata eventUri
    ) external onlyOwner returns (bytes32) {
        require(approvedCollateral[collateralToken], "Collateral not approved");
        require(eventDate > block.timestamp, "Event must be in future");

        bytes32 conditionId = generateConditionId(eventName, fighterA, fighterB, MarketType.WINNER);
        require(ufcMarkets[conditionId].conditionId == bytes32(0), "Market already exists");
        
        marketNonce++;

        string[] memory labels = new string[](2);
        labels[0] = string(abi.encodePacked(fighterA, " wins"));
        labels[1] = string(abi.encodePacked(fighterB, " wins"));

        conditionalTokens.createMarket(conditionId, collateralToken, 2, eventUri);

        ufcMarkets[conditionId] = UFCMarket({
            conditionId: conditionId,
            eventName: eventName,
            fighterA: fighterA,
            fighterB: fighterB,
            marketType: MarketType.WINNER,
            eventDate: eventDate,
            active: true,
            outcomeLabels: labels,
            collateralToken: collateralToken
        });

        allMarkets.push(conditionId);

        emit UFCMarketCreated(conditionId, eventName, fighterA, fighterB, MarketType.WINNER, labels);

        return conditionId;
    }

    /**
     * @notice Create a method of victory market
     * Outcomes: [A by KO/TKO, A by Sub, A by Dec, B by KO/TKO, B by Sub, B by Dec]
     */
    function createMethodMarket(
        string calldata eventName,
        string calldata fighterA,
        string calldata fighterB,
        uint256 eventDate,
        address collateralToken,
        string calldata eventUri
    ) external onlyOwner returns (bytes32) {
        require(approvedCollateral[collateralToken], "Collateral not approved");
        require(eventDate > block.timestamp, "Event must be in future");

        bytes32 conditionId = generateConditionId(eventName, fighterA, fighterB, MarketType.METHOD_OF_VICTORY);
        require(ufcMarkets[conditionId].conditionId == bytes32(0), "Market already exists");
        
        marketNonce++;

        string[] memory labels = new string[](6);
        labels[0] = string(abi.encodePacked(fighterA, " by KO/TKO"));
        labels[1] = string(abi.encodePacked(fighterA, " by Submission"));
        labels[2] = string(abi.encodePacked(fighterA, " by Decision"));
        labels[3] = string(abi.encodePacked(fighterB, " by KO/TKO"));
        labels[4] = string(abi.encodePacked(fighterB, " by Submission"));
        labels[5] = string(abi.encodePacked(fighterB, " by Decision"));

        conditionalTokens.createMarket(conditionId, collateralToken, 6, eventUri);

        ufcMarkets[conditionId] = UFCMarket({
            conditionId: conditionId,
            eventName: eventName,
            fighterA: fighterA,
            fighterB: fighterB,
            marketType: MarketType.METHOD_OF_VICTORY,
            eventDate: eventDate,
            active: true,
            outcomeLabels: labels,
            collateralToken: collateralToken
        });

        allMarkets.push(conditionId);

        emit UFCMarketCreated(conditionId, eventName, fighterA, fighterB, MarketType.METHOD_OF_VICTORY, labels);

        return conditionId;
    }

    /**
     * @notice Create a "goes the distance" market
     * Outcomes: [Yes (decision), No (finish)]
     */
    function createGoesDistanceMarket(
        string calldata eventName,
        string calldata fighterA,
        string calldata fighterB,
        uint256 eventDate,
        address collateralToken,
        string calldata eventUri
    ) external onlyOwner returns (bytes32) {
        require(approvedCollateral[collateralToken], "Collateral not approved");
        require(eventDate > block.timestamp, "Event must be in future");

        bytes32 conditionId = generateConditionId(eventName, fighterA, fighterB, MarketType.GOES_DISTANCE);
        require(ufcMarkets[conditionId].conditionId == bytes32(0), "Market already exists");
        
        marketNonce++;

        string[] memory labels = new string[](2);
        labels[0] = "Yes - Goes to Decision";
        labels[1] = "No - Finish";

        conditionalTokens.createMarket(conditionId, collateralToken, 2, eventUri);

        ufcMarkets[conditionId] = UFCMarket({
            conditionId: conditionId,
            eventName: eventName,
            fighterA: fighterA,
            fighterB: fighterB,
            marketType: MarketType.GOES_DISTANCE,
            eventDate: eventDate,
            active: true,
            outcomeLabels: labels,
            collateralToken: collateralToken
        });

        allMarkets.push(conditionId);

        emit UFCMarketCreated(conditionId, eventName, fighterA, fighterB, MarketType.GOES_DISTANCE, labels);

        return conditionId;
    }

    function setCollateralApproval(address token, bool approved) external onlyOwner {
        approvedCollateral[token] = approved;
        emit CollateralApproved(token, approved);
    }

    function deactivateMarket(bytes32 conditionId) external onlyOwner {
        require(ufcMarkets[conditionId].conditionId != bytes32(0), "Market does not exist");
        ufcMarkets[conditionId].active = false;
        emit MarketDeactivated(conditionId);
    }

    function getOutcomeLabels(bytes32 conditionId) external view returns (string[] memory) {
        return ufcMarkets[conditionId].outcomeLabels;
    }

    function getAllMarkets() external view returns (bytes32[] memory) {
        return allMarkets;
    }

    function getActiveMarketsCount() external view returns (uint256 count) {
        for (uint256 i = 0; i < allMarkets.length; i++) {
            if (ufcMarkets[allMarkets[i]].active) count++;
        }
    }
}
