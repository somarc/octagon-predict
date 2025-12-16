# Octagon Predict Order Book API

Off-chain order book for trading UFC prediction market outcome tokens.

## Architecture

```
Frontend (React)
    │
    │ 1. Sign EIP-712 order with VeWorld/Sync2
    │
    ▼
Order Book API (Node.js)
    │
    │ 2. Validate & match orders
    │
    ├──────────────────────────────────────┐
    │                                      │
    ▼                                      ▼
Matching Engine (in-memory)      VeChain Testnet
    │                                      │
    │ 3. Queue fills                       │
    │                                      │
    └──────────────────────────────────────┘
              │
              │ 4. Batch settlement
              ▼
    Exchange.sol (on-chain)
```

## Base URL

```
/api/orderbook
```

## Endpoints

### Health Check

```
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": 1703001234567
}
```

### Configure Exchange Address

Set the deployed Exchange contract address (required before trading).

```
POST /config/exchange
```

**Request:**
```json
{
  "exchangeAddress": "0x1234...abcd"
}
```

### Get Order Book

Get aggregated order book for a market outcome.

```
GET /book/:conditionId/:outcomeIndex?depth=10
```

**Response:**
```json
{
  "conditionId": "0xabc123...",
  "outcomeIndex": 0,
  "bids": [
    { "price": "550000000000000000", "amount": "1000000000000000000" }
  ],
  "asks": [
    { "price": "600000000000000000", "amount": "2000000000000000000" }
  ],
  "spread": "50000000000000000",
  "midpoint": "575000000000000000"
}
```

### Get Best Prices

Quick market summary with probability percentages.

```
GET /prices/:conditionId/:outcomeIndex
```

**Response:**
```json
{
  "conditionId": "0xabc123...",
  "outcomeIndex": 0,
  "bestBid": "550000000000000000",
  "bestAsk": "600000000000000000",
  "spread": "50000000000000000",
  "midpoint": "575000000000000000",
  "bidPercentage": 55.0,
  "askPercentage": 60.0
}
```

### Submit Order

Submit a signed order to the order book.

```
POST /order
```

**Request:**
```json
{
  "maker": "0xYourWalletAddress",
  "conditionId": "0x...",
  "outcomeIndex": 0,
  "isBuy": true,
  "price": "550000000000000000",
  "amount": "1000000000000000000",
  "nonce": 1,
  "expiry": 1703100000,
  "signature": "0x..."
}
```

**Response:**
```json
{
  "orderId": "order-1703001234567-abc123",
  "status": "open",
  "filledAmount": "0",
  "trades": []
}
```

If matched immediately:
```json
{
  "orderId": "order-1703001234567-abc123",
  "status": "filled",
  "filledAmount": "1000000000000000000",
  "trades": [
    {
      "id": "trade-1703001234567-xyz789",
      "price": "550000000000000000",
      "amount": "1000000000000000000",
      "timestamp": 1703001234567
    }
  ]
}
```

### Cancel Order

Cancel an open order. Requires EIP-712 signed CancelOrder message.

```
DELETE /order/:orderId
```

**Request Body:**
```json
{
  "maker": "0xYourWalletAddress",
  "nonce": 1,
  "signature": "0x..."
}
```

**CancelOrder EIP-712 Type:**
```javascript
{
  CancelOrder: [
    { name: 'orderId', type: 'string' },
    { name: 'maker', type: 'address' },
    { name: 'nonce', type: 'uint256' }
  ]
}
```

### Get User Orders

Get all open orders for a wallet address.

```
GET /orders/:maker
```

### Get Order Details

Get details of a specific order.

```
GET /order/:orderId
```

### Get Recent Trades

Get recent trades for a market outcome.

```
GET /trades/:conditionId/:outcomeIndex?limit=50
```

### Get Pending Fills (Operator)

Get fills waiting for on-chain settlement.

```
GET /settlement/pending
```

### Confirm Settlement (Operator)

Mark fills as settled after batch transaction.

```
POST /settlement/confirm
```

**Request:**
```json
{
  "tradeIds": ["trade-123", "trade-456"],
  "txHash": "0x..."
}
```

## Price Format

Prices are stored as 18-decimal fixed point (wei format):
- `1e18` (1000000000000000000) = 100% probability
- `5e17` (500000000000000000) = 50% probability
- `1e17` (100000000000000000) = 10% probability

### Conversion Helpers

```typescript
// Price to percentage
function priceToPercentage(price: string): number {
  return Number(BigInt(price) * 10000n / 1e18n) / 100;
}

// Percentage to price
function percentageToPrice(pct: number): string {
  return (BigInt(Math.round(pct * 100)) * 1e18n / 10000n).toString();
}
```

## EIP-712 Order Signing

Orders must be signed using EIP-712 typed data.

### Domain

```javascript
{
  name: "OctagonPredict",
  version: "1",
  chainId: 100010,  // VeChain Testnet
  verifyingContract: "0x..."  // Exchange contract address
}
```

### Order Type

```javascript
{
  Order: [
    { name: 'maker', type: 'address' },
    { name: 'conditionId', type: 'bytes32' },
    { name: 'outcomeIndex', type: 'uint256' },
    { name: 'isBuy', type: 'bool' },
    { name: 'price', type: 'uint256' },
    { name: 'amount', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'expiry', type: 'uint256' }
  ]
}
```

### VeChain Connex Signing Example

```javascript
const connex = new Connex({ node: 'https://testnet.vechain.org' });

const order = {
  maker: wallet.address,
  conditionId: '0x...',
  outcomeIndex: 0,
  isBuy: true,
  price: '550000000000000000',  // 55%
  amount: '1000000000000000000', // 1 token
  nonce: 1,
  expiry: Math.floor(Date.now() / 1000) + 86400  // 24h
};

// Sign with VeWorld
const signature = await connex.vendor.sign('typed-data', {
  domain: { name: 'OctagonPredict', version: '1', chainId: 100010, verifyingContract: exchangeAddress },
  primaryType: 'Order',
  types: { Order: [...] },
  message: order
});
```

## Settlement Flow

1. **Orders matched** → Trade recorded in matching engine
2. **Fills queued** → Added to pending settlement batch
3. **Operator batches** → Calls `Exchange.settleBatch()` on-chain
4. **Confirmation** → API marks trades as settled

Batch settlement is more gas-efficient than individual trades.

## Error Responses

```json
{
  "error": "Invalid signature"
}
```

```json
{
  "error": "Invalid order",
  "details": ["Invalid price (must be 0 < price < 1e18)"]
}
```

## Rate Limits

- Order submission: 10 per second per wallet
- Order book queries: 100 per second

## WebSocket (Future)

Real-time order book updates will be available via WebSocket:

```
WS /api/orderbook/ws
```

Subscribe to:
- `book:${conditionId}:${outcomeIndex}` - Order book updates
- `trades:${conditionId}:${outcomeIndex}` - Trade stream
- `orders:${maker}` - User order updates
