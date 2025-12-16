# Octagon Predict - VeChain Testnet Deployment Guide

## Prerequisites

1. **VeChain Wallet** - Sync2 or VeWorld wallet with testnet VET/VTHO
2. **Testnet Faucet** - Get free VET/VTHO from https://faucet.vecha.in/
3. **Private Key** - Export from your testnet wallet

## Environment Setup

Create a `.env` file with your deployer private key:

```bash
DEPLOYER_PRIVATE_KEY=your_private_key_here_without_0x_prefix
```

## Compile Contracts

```bash
yes n | npx hardhat compile
```

## Deploy to VeChain Testnet

```bash
npx hardhat run scripts/deploy.cjs --network vechain_testnet
```

**Expected Output:**
```
Deploying Octagon Predict contracts with account: 0x...
Account balance: ...

1. Deploying ConditionalTokens...
   ConditionalTokens deployed to: 0x...

2. Deploying MarketFactory...
   MarketFactory deployed to: 0x...

3. Deploying Exchange...
   Exchange deployed to: 0x...

4. Deploying AdminOracle...
   AdminOracle deployed to: 0x...

========================================
DEPLOYMENT COMPLETE - Octagon Predict
========================================

Contract Addresses (save these!):
ConditionalTokens: 0x...
MarketFactory:     0x...
Exchange:          0x...
AdminOracle:       0x...
```

## Save Contract Addresses

After deployment, save these addresses to your `.env` file:

```bash
CONDITIONAL_TOKENS_ADDRESS=0x...
MARKET_FACTORY_ADDRESS=0x...
EXCHANGE_ADDRESS=0x...
ADMIN_ORACLE_ADDRESS=0x...
```

## Create UFC 324 Test Markets

```bash
MARKET_FACTORY_ADDRESS=0x... npx hardhat run scripts/createUFC324Market.cjs --network vechain_testnet
```

This creates:
- **Winner Market**: Gaethje vs Pimblett (binary)
- **Method of Victory Market**: 6 outcomes (KO/TKO, Sub, Decision for each)
- **Goes the Distance**: Yes/No

## Contract Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        MarketFactory                             │
│   Creates UFC-specific markets with metadata                     │
│   OWNS: ConditionalTokens (can create markets)                   │
└─────────────────────┬───────────────────────────────────────────┘
                      │ creates markets
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                     ConditionalTokens                            │
│   Core ERC1155 token contract for outcome shares                 │
│   ORACLE: AdminOracle (can resolve markets)                      │
└──────────────┬────────────────────────────────┬─────────────────┘
               │                                │
               │ trading                        │ resolution
               ▼                                ▼
┌──────────────────────────┐    ┌─────────────────────────────────┐
│        Exchange          │    │         AdminOracle              │
│ Off-chain order matching │    │ Proposes & finalizes resolutions │
│ On-chain settlement      │    │ Based on official UFC results    │
└──────────────────────────┘    └─────────────────────────────────┘
```

## Trading Flow

1. **User deposits VET** → Calls `conditionalTokens.splitPosition(conditionId, amount, {value: amount})`
2. **Receives outcome tokens** → Equal amounts of all outcome tokens (ERC1155)
3. **Signs EIP-712 order** → Off-chain order book
4. **Matching engine pairs orders** → Submits to Exchange
5. **Exchange settles** → Transfers outcome tokens between traders
6. **Fight concludes** → AdminOracle resolves with payout array
7. **Winners redeem** → Burn winning tokens for collateral payout

## Verify on VeChainStats

After deployment, verify contracts on https://explore-testnet.vechain.org/

1. Navigate to each contract address
2. Upload source code from `/contracts/` directory
3. Verify compilation settings match `hardhat.config.cjs`

## Security Considerations

- **Never commit private keys** to version control
- **Test thoroughly** on testnet before mainnet
- **Multisig ownership** recommended for mainnet AdminOracle
- **Rate limit** operator submissions to Exchange
- **Monitor** for unusual trading patterns

## Next Steps After Deployment

1. ✅ Deploy contracts to testnet
2. ⬜ Create UFC 324 test markets
3. ⬜ Build off-chain order book service
4. ⬜ Integrate frontend with deployed contracts
5. ⬜ Test full trading flow
6. ⬜ Security audit
7. ⬜ Mainnet deployment
