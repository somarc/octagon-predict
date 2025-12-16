# VeChain UFC Market

## Overview

VeChain UFC Market is a decentralized prediction market platform for UFC fights built on the VeChainThor blockchain. Users can bet on fight outcomes using VTHO tokens. The application features a React frontend with a dark sports aesthetic, an Express backend API, and PostgreSQL database for storing markets, fighters, and betting data.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with custom plugins for Replit integration
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS v4 with custom theme configuration in `@theme` blocks
- **UI Components**: shadcn/ui component library (New York style)
- **Animations**: Framer Motion for page transitions and interactions
- **Charts**: Recharts for price/odds visualization

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL
- **API Pattern**: RESTful endpoints under `/api/*`
- **Development**: Vite middleware integration for HMR during development
- **Production**: Static file serving from built assets

### VeChain Integration
- **DApp Kit**: `@vechain/dapp-kit-react` for wallet connectivity
- **Network**: Configured for VeChain Testnet (`https://testnet.vechain.org/`)
- **Connex**: Direct blockchain interaction for balance queries
- **Wallet Support**: VeWorld and Sync2 wallet integration

### Data Model
- **Fighters**: Store fighter profiles with records, weight class, nationality
- **Markets**: Prediction markets with odds, pool totals, and live status
- **Bets**: User positions tracking wallet address, side, amount, and status

### Key Design Decisions
1. **Mock Data Transition**: Frontend uses mock data that can be replaced with smart contract data
2. **Decimal Odds**: Odds stored as decimals for calculation simplicity
3. **Session-less API**: Currently no user authentication - wallet address is the identity
4. **Responsive Design**: Mobile-first approach with custom breakpoint hooks

## External Dependencies

### Blockchain Services
- **VeChain Testnet Node**: `https://testnet.vechain.org/` for blockchain queries
- **VTHO Token Contract**: `0x0000000000000000000000000000456E65726779` for token balances

### Database
- **PostgreSQL**: Primary data store configured via `DATABASE_URL` environment variable
- **Drizzle Kit**: Database migrations managed in `/migrations` directory

### Third-Party Libraries
- **Radix UI**: Accessible primitive components for dialogs, popovers, etc.
- **Lucide React**: Icon library
- **date-fns**: Date formatting utilities
- **Zod**: Schema validation for API requests and database inserts

### Future Integration Points
- **Chainlink MMA Data Feed**: Referenced for market resolution (not yet implemented)
- **Smart Contracts**: Betting logic currently simulated, needs blockchain integration