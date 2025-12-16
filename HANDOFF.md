# Frontend Handoff Guide: VeChain UFC Market

This frontend prototype is built with React, Vite, and Tailwind CSS v4. It is designed to be connected to the VeChainThor blockchain.

## Key Integration Points

### 1. Data Source (`client/src/lib/mockData.ts`)
Currently, all market data is mocked in this file.
**Next Step:** Replace `mockMarkets` with a hook that fetches data from your smart contract or indexing service (e.g., The Graph / VeChain Subgraph).

### 2. Betting Logic (`client/src/components/BettingModal.tsx`)
The betting logic is currently simulated in the `handleQuickBet` and `handleInputChange` functions.
**Next Step:**
- Integrate `connex.js` or `wagmi` (if using VeChain's EVM adapter).
- Replace the mock "Place Bet" button action with a real transaction signing request.
- Ensure the user has approved the VTHO contract for the prediction market contract.

### 3. Wallet Connection (`client/src/components/Navbar.tsx`)
The mock wallet button (`0x7A...4B2C`) and balances are static.
**Next Step:**
- Implement a real wallet connection (VeWorld / Sync2).
- Fetch real VET and VTHO balances for the connected user.

### 4. Market Resolution
The `MarketDetail` page mentions "Chainlink MMA Data Feed".
**Next Step:** ensure your smart contract has a function to ingest this oracle data to resolve markets.

## Styling System
- **Tailwind v4**: Configuration is in `client/src/index.css` using `@theme` blocks.
- **Fonts**: Rajdhani (Headers) and Inter (Body).
- **Theme**: Dark sports aesthetic (VeChain Blue + Gold).

## Project Structure
- `client/src/pages/Home.tsx` - Main landing and market list.
- `client/src/pages/MarketDetail.tsx` - Individual market trading view.
- `client/src/components/MarketCard.tsx` - Card component for market list.
- `client/src/components/BettingModal.tsx` - The core interaction component.
