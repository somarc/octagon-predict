**Octagon Predict: UFC-Focused Prediction Market on VeChainThor**

Octagon Predict is a specialized prediction market platform inspired by Polymarket's robust architecture and functionality, but hyper-focused on UFC fights and outcomes. Deployed on the VeChainThor blockchain for enterprise-grade scalability, low costs, and EVM compatibility, the app leverages **VTHO** as the primary gas token for all transactions — from creating markets and placing bets to providing liquidity and claiming winnings. This ensures seamless, eco-friendly interactions while keeping fees minimal for UFC fans worldwide.

We mirror Polymarket's core mechanics (binary outcome shares, order book trading, oracle-resolved markets) but tailor everything to the Octagon: fighter vs. fighter markets, method of victory, round props, event winners, and more.

### Feature Roadmap

Phased rollout to build a full-fledged UFC prediction ecosystem on VeChain.

#### **Phase 1: MVP Core**
- **Smart Contract Foundation on VeChainThor**
  - Deploy Conditional Tokens Framework (adapted from Gnosis/Polymarket) for binary/multiple outcome shares (e.g., "Fighter A wins" vs. "Fighter B wins").
  - Collateral in VET or stablecoins (e.g., VVUSDC if available); all gas paid in **VTHO**.
  - Basic market creation: Admin-only initially for official UFC events.
- **Market Types (UFC-Specific)**
  - Main: Winner of fight (Yes/No shares priced $0-$1 = probability).
  - Props: Method (KO/TKO, Submission, Decision), Rounds (Over/Under), Fight goes the distance.
  - Event-level: Card winner counts, bonus award predictions.
- **Trading Mechanics**
  - Hybrid order book (off-chain matching + on-chain settlement) mirroring Polymarket CLOB.
  - Buy/sell shares with limit/market orders; **VTHO** for gas on every tx.
- **Frontend (Vite + TypeScript)**
  - Clean UI: Browse upcoming UFC events (integrate UFC API or scraped schedule).
  - Wallet connect: Sync2 / VeChain wallet support.
  - Real-time odds, volume charts, user portfolios.
- **Resolution**
  - Admin oracle initially; transition to decentralized (e.g., VeChain community voting or integrated UFC result feeds).

Launch with early 2026 events like UFC 324 (Gaethje vs Pimblett) and Volkanovski vs Lopes rematch.

#### **Phase 2: Liquidity & Engagement (Q2-Q3 2026)**
- **Liquidity Incentives**
  - LP pools for popular markets; rewards in platform tokens or **VTHO** burns/fees.
  - Mirror Polymarket's fee structure: Low trading fees, directed to LPs.
- **User-Generated Markets**
  - Allow community to propose UFC-related markets (e.g., "Will Jones fight in 2026?").
  - Approval/voting mechanism using **VTHO**-weighted stakes.
- **Advanced UFC Features**
  - Fighter profiles with historical odds, win streaks, head-to-head prediction history.
  - Parlay-style multi-outcome bundles.
  - Live in-fight markets (if regulatory feasible; phased).
- **Social & Analytics**
  - Leaderboards: Top predictors, profitable traders.
  - Shareable bet slips, integration with X for UFC hype.
  - Charts: Probability shifts over time (like Polymarket's resolution curves).

#### **Phase 3: Decentralization & Ecosystem (Q4 2026+)**
- **Full DAO Governance**
  - Token launch (e.g., $OCTAGON) for voting on fees, market rules, partnerships.
  - **VTHO** holders get boosted governance weight.
- **Oracle Integration**
  - Decentralized resolution via VeChain tools or partnerships (e.g., UMA-like optimistic oracle adapted).
- **Partnerships**
  - Explore official UFC data feeds or influencer collaborations.
  - Cross-chain bridges if needed, but stay native to VeChainThor.
- **Mobile & Advanced Tools**
  - Native apps with push notifications for fight nights.
  - API/SDK for third-party bots/traders (mirror Polymarket's clob-client).

This roadmap turns Octagon Predict into the go-to platform for UFC predictions — accurate crowd wisdom on VeChainThor, powered extensively by **VTHO** for every interaction. Let's build the Octagon's prediction layer together! 🚀

**Octagon Predict: Launching Strong in 2026 on VeChainThor**

We're accelerating to hit the ground running in the first week of January 2026 – perfect timing to capture the hype around the explosive start to UFC's year on Paramount+. Octagon Predict, our Polymarket-inspired prediction market platform, will go live with core markets focused on the earliest events, mirroring Polymarket's intuitive binary shares and trading while hyper-specializing in UFC outcomes. Everything runs natively on VeChainThor blockchain, with **VTHO** powering every gas-intensive action: market creation, buying/selling shares, adding liquidity, and resolutions.

To build maximum credibility and aim straight for Dana White's radar, we'll exclusively source event data from official UFC channels (ufc.com/events) and link directly to them in the app. No scraping shady sites – clean, official integration via public APIs where possible, or manual admin setup initially for accuracy.

### Confirmed Upcoming UFC Events for Early 2026 Markets (Sourced from ufc.com)

We'll prioritize creating markets for these right at launch:

- **UFC 324: Gaethje vs Pimblett**  
  **Date:** Saturday, January 24, 2026 (some sources note Jan 25; confirm via official)  
  **Venue:** T-Mobile Arena, Las Vegas, NV  
  **Type:** Numbered PPV (First UFC event streaming on Paramount+)  
  **Key Highlights:** Stacked card with two title fights; main focus on Justin Gaethje vs Paddy Pimblett (interim lightweight title implications).  
  **Launch Markets:** Fighter A/B wins, Method of Victory (KO/TKO/Sub/Decision), Round props, Goes the distance, plus event parlays.

- **UFC 325: Volkanovski vs Lopes 2**  
  **Date:** February 1, 2026 (or Jan 31 in some announcements)  
  **Venue:** Qudos Bank Arena, Sydney, Australia  
  **Type:** Numbered PPV  
  **Key Highlights:** Featherweight title rematch – Alexander Volkanovski defends against Diego Lopes.  
  **Markets:** Title outcome, method/rounds, performance bonuses predictions.

- **UFC Fight Night: Bautista vs Oliveira**  
  **Date:** February 8, 2026  
  **Venue:** UFC APEX, Las Vegas  
  **Markets:** Main event winner + select prelim props.

- **UFC Fight Night: Strickland vs Hernandez**  
  **Date:** February 22, 2026  
  **Venue:** Toyota Center, Houston, TX  

- **UFC Fight Night: Moreno vs Almabayev**  
  **Date:** March 1, 2026  
  **Venue:** Arena CDMX, Mexico City  

- **UFC 326: Holloway vs Oliveira 2**  
  **Date:** March 8, 2026  
  **Venue:** T-Mobile Arena, Las Vegas  

Additional Fight Nights in March will roll in as cards finalize.

### Accelerated Phase 1: MVP Launch by First Week Jan 2026

- **Smart Contracts (VeChainThor):** Deploy conditional tokens for binary/multiple outcomes. Collateral in VET/stablecoins; **VTHO** for all gas (trading, liquidity provision).
- **Initial Markets:** Admin-created for UFC 324 & 325 (winner shares at $0-$1 probabilities, props).
- **Frontend Polish:** Event pages linking directly to https://www.ufc.com/events and https://www.ufc.com/event/[event-slug] for tickets/fight cards. Sync2 wallet integration for seamless **VTHO** payments.
- **Resolution:** Admin oracle tied to official UFC results announcements.
- **Marketing Push:** Share on X tagging @ufc @danawhite – "Crowd wisdom on UFC outcomes, powered by VeChainThor and VTHO. Official sources only."

This positions Octagon Predict as the premier, UFC-respecting prediction layer – low-fee, eco-friendly trades fueled by **VTHO**, ready for the 2026 boom.

