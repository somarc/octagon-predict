# Octagon Predict Smart Contracts

VeChainThor smart contracts for the UFC prediction market platform.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        MarketFactory                             │
│   Creates UFC-specific markets with metadata                     │
│   (event name, fighters, market type, date)                      │
└─────────────────────┬───────────────────────────────────────────┘
                      │ creates markets
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                     ConditionalTokens                            │
│   Core ERC1155 token contract for outcome shares                 │
│   - splitPosition: Deposit collateral → mint outcome tokens      │
│   - mergePositions: Burn all outcomes → withdraw collateral      │
│   - resolveMarket: Set winning outcome (oracle only)             │
│   - redeemPayout: Burn winning tokens → claim collateral         │
└──────────────┬────────────────────────────────┬─────────────────┘
               │                                │
               │ trading                        │ resolution
               ▼                                ▼
┌──────────────────────────┐    ┌─────────────────────────────────┐
│        Exchange          │    │         AdminOracle              │
│ Off-chain order matching │    │ Proposes & finalizes resolutions │
│ On-chain settlement      │    │ Based on official UFC results    │
│ EIP-712 signed orders    │    │ Future: decentralized oracle     │
└──────────────────────────┘    └─────────────────────────────────┘
```

## Contracts

### ConditionalTokens.sol
Core conditional token framework adapted from Gnosis/Polymarket CTF.
- ERC1155 tokens representing outcome shares
- Collateral management (VET native or ERC20 stablecoins)
- Binary and multi-outcome markets
- Resolution and payout logic

### MarketFactory.sol
Factory for creating UFC-specific prediction markets.
- Creates winner markets (Fighter A vs Fighter B)
- Creates method of victory markets (KO/TKO, Submission, Decision)
- Creates "goes the distance" prop markets
- Stores UFC event metadata

### Exchange.sol
Order settlement contract for off-chain order book.
- EIP-712 typed data signing for orders
- Batch settlement of matched trades
- Operator-controlled fills (off-chain matching engine)
- Order cancellation and nonce management

### AdminOracle.sol
Oracle contract for market resolution.
- Admin-controlled initially (fast MVP)
- Optional challenge period for disputes
- Sources results from official UFC announcements
- Role-based access for resolvers

## Market Types

1. **WINNER** - Binary: Fighter A wins vs Fighter B wins
2. **METHOD_OF_VICTORY** - 6 outcomes: KO/TKO A, Sub A, Dec A, KO/TKO B, Sub B, Dec B
3. **GOES_DISTANCE** - Binary: Fight goes to decision vs finish
4. **ROUND_PROP** - Over/under round totals (future)
5. **EVENT_PROP** - Event-level predictions (future)

## Trading Flow

1. User connects VeChain wallet (Sync2/VeWorld)
2. User deposits collateral via `splitPosition` → receives outcome tokens
3. User signs EIP-712 order off-chain (buy/sell shares at price)
4. Off-chain matching engine pairs orders
5. Operator submits matched trades to `Exchange.settleBatch()`
6. After fight: oracle resolves market
7. Winners call `redeemPayout` to claim collateral

## Deployment (VeChain Testnet)

```bash
# Using Hardhat with VeChain plugin
npx hardhat run scripts/deploy.ts --network vechain_testnet
```

## Gas Optimization (VTHO)

- All transactions consume VTHO for gas
- VeChain multi-clause transactions batch multiple operations
- Fee delegation available for improved UX
- Batch settlement reduces per-trade gas costs

## Security Considerations

- ReentrancyGuard on all token transfers
- Owner/Admin role separation
- Order signature verification (EIP-712)
- Nonce-based replay protection
- Challenge period for disputed resolutions (future)

## Future Improvements

1. Decentralized oracle (UMA-style optimistic oracle)
2. DAO governance for market creation
3. Liquidity mining incentives
4. Cross-chain bridges (if needed)
5. Automated market makers for low-liquidity markets
