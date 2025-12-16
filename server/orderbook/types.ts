// Order Book Types for Octagon Predict
// EIP-712 compatible order structure matching Exchange.sol

export interface Order {
  id: string;                    // Unique order ID
  maker: string;                 // Wallet address
  conditionId: string;           // Market condition ID (bytes32)
  outcomeIndex: number;          // Which outcome (0-based)
  isBuy: boolean;                // true = buying, false = selling
  price: string;                 // Price in wei (1e18 = 100%)
  amount: string;                // Amount of outcome tokens
  nonce: number;                 // User nonce for replay protection
  expiry: number;                // Unix timestamp
  signature: string;             // EIP-712 signature
  createdAt: number;             // Order creation timestamp
  filledAmount: string;          // Amount already filled
  status: OrderStatus;
}

export type OrderStatus = 'open' | 'partial' | 'filled' | 'cancelled' | 'expired';

export interface OrderBookLevel {
  price: string;                 // Price level
  amount: string;                // Total amount at this price
  orders: Order[];               // Orders at this level
}

export interface OrderBook {
  conditionId: string;
  outcomeIndex: number;
  bids: OrderBookLevel[];        // Buy orders (highest price first)
  asks: OrderBookLevel[];        // Sell orders (lowest price first)
}

export interface Trade {
  id: string;
  makerOrderId: string;
  takerOrderId: string;
  conditionId: string;
  outcomeIndex: number;
  price: string;
  amount: string;
  makerAddress: string;
  takerAddress: string;
  timestamp: number;
  settled: boolean;
  settlementTxHash?: string;
}

export interface Fill {
  makerOrder: Order;
  takerOrder: Order;
  fillAmount: string;
}

// EIP-712 domain for VeChain
export interface EIP712Domain {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: string;
}

export const ORDER_TYPES = {
  Order: [
    { name: 'maker', type: 'address' },
    { name: 'conditionId', type: 'bytes32' },
    { name: 'outcomeIndex', type: 'uint256' },
    { name: 'isBuy', type: 'bool' },
    { name: 'price', type: 'uint256' },
    { name: 'amount', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'expiry', type: 'uint256' },
  ],
};

// Market summary for frontend
export interface MarketSummary {
  conditionId: string;
  outcomes: OutcomeSummary[];
  totalVolume: string;
  lastTradePrice: string[];
}

export interface OutcomeSummary {
  outcomeIndex: number;
  bestBid: string | null;
  bestAsk: string | null;
  bidDepth: string;
  askDepth: string;
  lastPrice: string | null;
  volume24h: string;
}

// API request/response types
export interface SubmitOrderRequest {
  maker: string;
  conditionId: string;
  outcomeIndex: number;
  isBuy: boolean;
  price: string;
  amount: string;
  nonce: number;
  expiry: number;
  signature: string;
}

export interface CancelOrderRequest {
  orderId: string;
  maker: string;
  nonce: number;
  signature: string;
}

export const CANCEL_ORDER_TYPES = {
  CancelOrder: [
    { name: 'orderId', type: 'string' },
    { name: 'maker', type: 'address' },
    { name: 'nonce', type: 'uint256' },
  ],
};

export interface OrderBookResponse {
  conditionId: string;
  outcomeIndex: number;
  bids: { price: string; amount: string }[];
  asks: { price: string; amount: string }[];
  spread: string | null;
  midpoint: string | null;
}
