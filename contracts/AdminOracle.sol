// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./ConditionalTokens.sol";

/**
 * @title AdminOracle
 * @notice Oracle for resolving UFC markets with payout arrays
 * @dev Supports corrections, challenge periods, and role-based access
 */
contract AdminOracle is Ownable, AccessControl {
    
    bytes32 public constant RESOLVER_ROLE = keccak256("RESOLVER_ROLE");
    
    ConditionalTokens public conditionalTokens;
    
    struct ResolutionProposal {
        bytes32 conditionId;
        uint256[] payoutNumerators;  // Payout weights per outcome
        uint256 proposedAt;
        bool finalized;
        string resultSource;
    }
    
    uint256 public challengePeriod = 0; // 0 for instant resolution
    
    mapping(bytes32 => ResolutionProposal) public proposals;
    
    event ResolutionProposed(
        bytes32 indexed conditionId,
        uint256[] payoutNumerators,
        string resultSource
    );
    
    event ResolutionFinalized(bytes32 indexed conditionId);
    event ResolutionOverwritten(bytes32 indexed conditionId, string reason);
    event ChallengePeriodUpdated(uint256 newPeriod);

    constructor(address _conditionalTokens) Ownable(msg.sender) {
        conditionalTokens = ConditionalTokens(payable(_conditionalTokens));
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(RESOLVER_ROLE, msg.sender);
    }

    /**
     * @notice Propose resolution with payout array
     * @param conditionId Market to resolve
     * @param payoutNumerators Payout weights (e.g., [1,0] for binary outcome 0 wins)
     * @param resultSource Official UFC result URL
     */
    function proposeResolution(
        bytes32 conditionId,
        uint256[] calldata payoutNumerators,
        string calldata resultSource
    ) external onlyRole(RESOLVER_ROLE) {
        ConditionalTokens.Market memory market = conditionalTokens.getMarket(conditionId);
        require(market.outcomeSlotCount > 0, "Market does not exist");
        require(!market.resolved, "Already resolved on chain");
        require(payoutNumerators.length == market.outcomeSlotCount, "Invalid payout length");
        
        // Validate at least one non-zero payout
        uint256 sum = 0;
        for (uint256 i = 0; i < payoutNumerators.length; i++) {
            sum += payoutNumerators[i];
        }
        require(sum > 0, "Must have winning outcome");

        // Allow overwrite if not finalized
        if (proposals[conditionId].proposedAt > 0 && !proposals[conditionId].finalized) {
            emit ResolutionOverwritten(conditionId, "New proposal");
        }

        proposals[conditionId] = ResolutionProposal({
            conditionId: conditionId,
            payoutNumerators: payoutNumerators,
            proposedAt: block.timestamp,
            finalized: false,
            resultSource: resultSource
        });

        emit ResolutionProposed(conditionId, payoutNumerators, resultSource);

        if (challengePeriod == 0) {
            _finalizeResolution(conditionId);
        }
    }

    /**
     * @notice Finalize after challenge period
     */
    function finalizeResolution(bytes32 conditionId) external {
        ResolutionProposal storage proposal = proposals[conditionId];
        require(proposal.proposedAt > 0, "No proposal");
        require(!proposal.finalized, "Already finalized");
        require(block.timestamp >= proposal.proposedAt + challengePeriod, "Challenge period active");

        _finalizeResolution(conditionId);
    }

    function _finalizeResolution(bytes32 conditionId) internal {
        ResolutionProposal storage proposal = proposals[conditionId];
        proposal.finalized = true;

        conditionalTokens.resolveMarket(conditionId, proposal.payoutNumerators);

        emit ResolutionFinalized(conditionId);
    }

    /**
     * @notice Emergency resolution by owner
     */
    function emergencyResolve(
        bytes32 conditionId,
        uint256[] calldata payoutNumerators,
        string calldata resultSource
    ) external onlyOwner {
        ConditionalTokens.Market memory market = conditionalTokens.getMarket(conditionId);
        require(!market.resolved, "Already resolved");
        require(payoutNumerators.length == market.outcomeSlotCount, "Invalid payout length");

        proposals[conditionId] = ResolutionProposal({
            conditionId: conditionId,
            payoutNumerators: payoutNumerators,
            proposedAt: block.timestamp,
            finalized: true,
            resultSource: resultSource
        });

        conditionalTokens.resolveMarket(conditionId, payoutNumerators);

        emit ResolutionProposed(conditionId, payoutNumerators, resultSource);
        emit ResolutionFinalized(conditionId);
    }

    function setChallengePeriod(uint256 _period) external onlyOwner {
        challengePeriod = _period;
        emit ChallengePeriodUpdated(_period);
    }

    function addResolver(address resolver) external onlyOwner {
        grantRole(RESOLVER_ROLE, resolver);
    }

    function removeResolver(address resolver) external onlyOwner {
        revokeRole(RESOLVER_ROLE, resolver);
    }

    function getProposal(bytes32 conditionId) external view returns (ResolutionProposal memory) {
        return proposals[conditionId];
    }

    function getPayoutNumerators(bytes32 conditionId) external view returns (uint256[] memory) {
        return proposals[conditionId].payoutNumerators;
    }
}
