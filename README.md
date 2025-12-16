# VeChain UFC Market

[![VeChainThor](https://img.shields.io/badge/Blockchain-VeChainThor-blue)](https://vechain.org) [![UFC Prediction Markets](https://img.shields.io/badge/Focus-UFC%20Fights-red)](https://www.ufc.com) [![VTHO Token](https://img.shields.io/badge/Token-VTHO-green)](https://vechain.org)

VeChain UFC Market is a decentralized prediction market platform built on the **VeChainThor blockchain**, specifically designed for betting on **UFC fight outcomes**. Inspired by Polymarket, this app lets fans put their VTHO where their predictions are — all powered by the energy-efficient VTHO gas token.

Place bets on who wins, how they win, or round-specific outcomes using real VeChainThor transactions. The platform combines fast blockchain interactions with a sleek, dark sports-themed UI perfect for fight night.

## 🚀 Features

- Predict UFC fight results (winner, method of victory, rounds, etc.)
- Fully integrated with **VeChainThor Testnet**
- Use **VTHO** tokens for all bets and gas fees
- Wallet connection via **VeWorld** and **Sync2**
- Real-time odds visualization with Recharts
- Mobile-first responsive design with dark, high-energy aesthetic
- Live market pools and betting tracking

## 🛠 Tech Stack

### Frontend
- **React 18 + TypeScript**
- **Vite** (fast builds & Replit-friendly)
- **Wouter** (lightweight routing)
- **TanStack React Query** (server state)
- **Tailwind CSS v4** + **shadcn/ui** (New York style components)
- **Framer Motion** (smooth animations)
- **Recharts** (odds & pool charts)

### Backend
- **Express.js + TypeScript**
- **Drizzle ORM** + **PostgreSQL** (fighters, markets, bets)
- RESTful API (`/api/*`)

### VeChain Integration
- **@vechain/dapp-kit-react** (wallet connect)
- **Connex** (direct blockchain interaction)
- **VTHO Token**: `0x0000000000000000000000000000456E65726779` (energy/gas)
- Network: VeChain Testnet (`https://testnet.vechain.org/`)

## 📊 Data Model

- **Fighters**: Profile, record, weight class, nationality
- **Markets**: Event, fight, odds (decimal format), liquidity pools, status
- **Bets**: Wallet address, selected outcome, VTHO amount, potential payout

## 🔑 Key Design Decisions

- **Identity = Wallet**: No traditional login — your VeChain wallet is your account
- **Mock to Real Transition**: Currently uses mock data; ready for smart contract replacement
- **Decimal Odds**: Simple math for calculations and payouts
- **Session-less API**: Fast and stateless
- **Mobile-First**: Built for checking odds on fight night from your phone

## 🗄 External Dependencies

- **VeChain Testnet Node**: `https://testnet.vechain.org/`
- **VTHO Token Contract**: `0x0000000000000000000000000000456E65726779`
- **PostgreSQL** (via `DATABASE_URL`)
- **Drizzle Kit** (migrations in `/migrations`)

## 🔮 Future Roadmap

- Full smart contract deployment for on-chain betting logic
- Integration with **Chainlink MMA Data Feeds** for trusted outcome resolution
- Mainnet launch on VeChainThor
- Advanced market types (prop bets, parlays)
- Leaderboards and betting history

## 🚧 Current Status

- Betting logic simulated off-chain
- Smart contracts in development
- Running on VeChain Testnet

Get ready to bet with VTHO on the biggest fights in the octagon — built for UFC fans, powered by VeChainThor.

> **Fight. Predict. Win.** 🥊

---

*This project is a Polymarket-inspired prediction market focused exclusively on UFC partnerships and events, deployed on VeChainThor blockchain with extensive use of the VTHO gas token.*
