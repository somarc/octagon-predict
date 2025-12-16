// Order Matching Engine for Octagon Predict
// Central Limit Order Book (CLOB) matching logic

import { Order, OrderBook, OrderBookLevel, Trade, Fill } from './types';

export class MatchingEngine {
  private orderBooks: Map<string, OrderBook> = new Map();
  private orders: Map<string, Order> = new Map();
  private trades: Trade[] = [];
  private pendingFills: Fill[] = [];

  // Get order book key
  private getBookKey(conditionId: string, outcomeIndex: number): string {
    return `${conditionId}-${outcomeIndex}`;
  }

  // Get or create order book (private method)
  private getOrCreateOrderBook(conditionId: string, outcomeIndex: number): OrderBook {
    const key = this.getBookKey(conditionId, outcomeIndex);
    let book = this.orderBooks.get(key);
    
    if (!book) {
      book = {
        conditionId,
        outcomeIndex,
        bids: [],
        asks: [],
      };
      this.orderBooks.set(key, book);
    }
    
    return book;
  }

  // Submit a new order
  submitOrder(order: Order): { trades: Trade[]; fills: Fill[] } {
    const book = this.getOrCreateOrderBook(order.conditionId, order.outcomeIndex);
    const trades: Trade[] = [];
    const fills: Fill[] = [];

    // Store order
    this.orders.set(order.id, order);

    // Match against opposite side
    let remainingAmount = BigInt(order.amount) - BigInt(order.filledAmount);
    const oppositeBook = order.isBuy ? book.asks : book.bids;
    const zero = BigInt(0);

    while (remainingAmount > zero && oppositeBook.length > 0) {
      const bestLevel = oppositeBook[0];
      const orderPrice = BigInt(order.price);
      const levelPrice = BigInt(bestLevel.price);

      // Check if prices cross
      const priceMatches = order.isBuy 
        ? orderPrice >= levelPrice  // Buyer willing to pay >= ask price
        : orderPrice <= levelPrice; // Seller willing to accept <= bid price

      if (!priceMatches) break;

      // Match orders at this level
      while (remainingAmount > zero && bestLevel.orders.length > 0) {
        const makerOrder = bestLevel.orders[0];
        const makerRemaining = BigInt(makerOrder.amount) - BigInt(makerOrder.filledAmount);
        const fillAmount = remainingAmount < makerRemaining ? remainingAmount : makerRemaining;

        // Create trade
        const trade: Trade = {
          id: `trade-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          makerOrderId: makerOrder.id,
          takerOrderId: order.id,
          conditionId: order.conditionId,
          outcomeIndex: order.outcomeIndex,
          price: makerOrder.price, // Execute at maker's price
          amount: fillAmount.toString(),
          makerAddress: makerOrder.maker,
          takerAddress: order.maker,
          timestamp: Date.now(),
          settled: false,
        };
        trades.push(trade);
        this.trades.push(trade);

        // Create fill for settlement
        fills.push({
          makerOrder,
          takerOrder: order,
          fillAmount: fillAmount.toString(),
        });

        // Update filled amounts
        makerOrder.filledAmount = (BigInt(makerOrder.filledAmount) + fillAmount).toString();
        order.filledAmount = (BigInt(order.filledAmount) + fillAmount).toString();
        remainingAmount -= fillAmount;

        // Update order status
        if (BigInt(makerOrder.filledAmount) >= BigInt(makerOrder.amount)) {
          makerOrder.status = 'filled';
          bestLevel.orders.shift();
        } else {
          makerOrder.status = 'partial';
        }

        // Update level amount
        bestLevel.amount = (BigInt(bestLevel.amount) - fillAmount).toString();
      }

      // Remove empty level
      if (BigInt(bestLevel.amount) <= zero || bestLevel.orders.length === 0) {
        oppositeBook.shift();
      }
    }

    // Update taker order status
    if (BigInt(order.filledAmount) >= BigInt(order.amount)) {
      order.status = 'filled';
    } else if (BigInt(order.filledAmount) > zero) {
      order.status = 'partial';
      this.addToBook(order, book);
    } else {
      order.status = 'open';
      this.addToBook(order, book);
    }

    // Store pending fills for batch settlement
    this.pendingFills.push(...fills);

    return { trades, fills };
  }

  // Add order to book
  private addToBook(order: Order, book: OrderBook): void {
    const side = order.isBuy ? book.bids : book.asks;
    const price = order.price;
    const remainingAmount = BigInt(order.amount) - BigInt(order.filledAmount);

    // Find or create price level
    let level = side.find(l => l.price === price);
    
    if (!level) {
      level = { price, amount: '0', orders: [] };
      
      // Insert in sorted order
      const insertIndex = side.findIndex(l => {
        const levelPrice = BigInt(l.price);
        const orderPrice = BigInt(price);
        return order.isBuy ? levelPrice < orderPrice : levelPrice > orderPrice;
      });
      
      if (insertIndex === -1) {
        side.push(level);
      } else {
        side.splice(insertIndex, 0, level);
      }
    }

    level.orders.push(order);
    level.amount = (BigInt(level.amount) + remainingAmount).toString();
  }

  // Cancel an order
  cancelOrder(orderId: string): boolean {
    const order = this.orders.get(orderId);
    if (!order || order.status === 'filled' || order.status === 'cancelled') {
      return false;
    }

    const book = this.getOrCreateOrderBook(order.conditionId, order.outcomeIndex);
    const side = order.isBuy ? book.bids : book.asks;

    // Find and remove from book
    for (const level of side) {
      const orderIndex = level.orders.findIndex(o => o.id === orderId);
      if (orderIndex !== -1) {
        const remainingAmount = BigInt(order.amount) - BigInt(order.filledAmount);
        level.amount = (BigInt(level.amount) - remainingAmount).toString();
        level.orders.splice(orderIndex, 1);
        break;
      }
    }

    // Remove empty levels
    const zero = BigInt(0);
    if (order.isBuy) {
      book.bids = side.filter(l => BigInt(l.amount) > zero);
    } else {
      book.asks = side.filter(l => BigInt(l.amount) > zero);
    }

    order.status = 'cancelled';
    return true;
  }

  // Get order book for display (public method)
  getOrderBookData(conditionId: string, outcomeIndex: number): OrderBook {
    return this.getOrCreateOrderBook(conditionId, outcomeIndex);
  }

  // Get aggregated order book (prices only, no order details)
  getAggregatedBook(conditionId: string, outcomeIndex: number, depth: number = 10): {
    bids: { price: string; amount: string }[];
    asks: { price: string; amount: string }[];
  } {
    const book = this.getOrCreateOrderBook(conditionId, outcomeIndex);
    
    return {
      bids: book.bids.slice(0, depth).map(l => ({ price: l.price, amount: l.amount })),
      asks: book.asks.slice(0, depth).map(l => ({ price: l.price, amount: l.amount })),
    };
  }

  // Get best bid/ask
  getBestPrices(conditionId: string, outcomeIndex: number): {
    bestBid: string | null;
    bestAsk: string | null;
    spread: string | null;
    midpoint: string | null;
  } {
    const book = this.getOrCreateOrderBook(conditionId, outcomeIndex);
    
    const bestBid = book.bids[0]?.price || null;
    const bestAsk = book.asks[0]?.price || null;
    
    let spread: string | null = null;
    let midpoint: string | null = null;
    
    if (bestBid && bestAsk) {
      const bid = BigInt(bestBid);
      const ask = BigInt(bestAsk);
      spread = (ask - bid).toString();
      midpoint = ((bid + ask) / BigInt(2)).toString();
    }
    
    return { bestBid, bestAsk, spread, midpoint };
  }

  // Get pending fills for batch settlement
  getPendingFills(): Fill[] {
    return [...this.pendingFills];
  }

  // Clear pending fills after settlement
  clearPendingFills(settledIds: string[]): void {
    // Mark trades as settled
    for (const trade of this.trades) {
      if (settledIds.includes(trade.id)) {
        trade.settled = true;
      }
    }
    
    // Clear pending fills
    this.pendingFills = this.pendingFills.filter(f => {
      const trade = this.trades.find(t => 
        t.makerOrderId === f.makerOrder.id && 
        t.takerOrderId === f.takerOrder.id
      );
      return trade && !trade.settled;
    });
  }

  // Get order by ID
  getOrder(orderId: string): Order | undefined {
    return this.orders.get(orderId);
  }

  // Get orders by maker
  getOrdersByMaker(maker: string): Order[] {
    const result: Order[] = [];
    this.orders.forEach(order => {
      if (order.maker.toLowerCase() === maker.toLowerCase() &&
          (order.status === 'open' || order.status === 'partial')) {
        result.push(order);
      }
    });
    return result;
  }

  // Get recent trades
  getRecentTrades(conditionId: string, outcomeIndex: number, limit: number = 50): Trade[] {
    return this.trades
      .filter(t => t.conditionId === conditionId && t.outcomeIndex === outcomeIndex)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  // Clean expired orders
  cleanExpiredOrders(): number {
    const now = Math.floor(Date.now() / 1000);
    let cleaned = 0;

    this.orders.forEach(order => {
      if (order.expiry < now && order.status !== 'filled' && order.status !== 'cancelled') {
        this.cancelOrder(order.id);
        order.status = 'expired';
        cleaned++;
      }
    });

    return cleaned;
  }
}

// Singleton instance
export const matchingEngine = new MatchingEngine();
