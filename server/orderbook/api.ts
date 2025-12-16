// Order Book API Routes for Octagon Predict
// RESTful + WebSocket endpoints for trading

import { Router, Request, Response } from 'express';
import { matchingEngine } from './engine';
import { 
  verifyOrderSignature, 
  verifyCancelSignature,
  validateOrder, 
  setExchangeAddress,
  getExchangeAddress,
  priceToPercentage,
  computeOrderHash 
} from './signature';
import { Order, SubmitOrderRequest, OrderBookResponse } from './types';

export const orderBookRouter = Router();

// Set Exchange contract address (call after deployment)
orderBookRouter.post('/config/exchange', (req: Request, res: Response) => {
  const { exchangeAddress } = req.body;
  
  if (!exchangeAddress || !/^0x[a-fA-F0-9]{40}$/.test(exchangeAddress)) {
    res.status(400).json({ error: 'Invalid exchange address' });
    return;
  }
  
  setExchangeAddress(exchangeAddress);
  res.json({ success: true, exchangeAddress });
});

// Get order book for a market outcome
orderBookRouter.get('/book/:conditionId/:outcomeIndex', (req: Request, res: Response) => {
  const { conditionId, outcomeIndex } = req.params;
  const depth = parseInt(req.query.depth as string) || 10;
  
  const book = matchingEngine.getAggregatedBook(conditionId, parseInt(outcomeIndex), depth);
  const prices = matchingEngine.getBestPrices(conditionId, parseInt(outcomeIndex));
  
  const response: OrderBookResponse = {
    conditionId,
    outcomeIndex: parseInt(outcomeIndex),
    bids: book.bids.map(b => ({
      price: b.price,
      amount: b.amount,
    })),
    asks: book.asks.map(a => ({
      price: a.price,
      amount: a.amount,
    })),
    spread: prices.spread,
    midpoint: prices.midpoint,
  };
  
  res.json(response);
});

// Get best prices (for quick market view)
orderBookRouter.get('/prices/:conditionId/:outcomeIndex', (req: Request, res: Response) => {
  const { conditionId, outcomeIndex } = req.params;
  const prices = matchingEngine.getBestPrices(conditionId, parseInt(outcomeIndex));
  
  res.json({
    conditionId,
    outcomeIndex: parseInt(outcomeIndex),
    ...prices,
    bidPercentage: prices.bestBid ? priceToPercentage(prices.bestBid) : null,
    askPercentage: prices.bestAsk ? priceToPercentage(prices.bestAsk) : null,
  });
});

// Submit a new order
orderBookRouter.post('/order', (req: Request, res: Response) => {
  // Check exchange address is configured
  const exchangeAddr = getExchangeAddress();
  if (!exchangeAddr) {
    res.status(503).json({ error: 'Exchange not configured. Call /config/exchange first.' });
    return;
  }
  
  const orderRequest: SubmitOrderRequest = req.body;
  
  // Validate order parameters
  const validation = validateOrder(orderRequest);
  if (!validation.valid) {
    res.status(400).json({ error: 'Invalid order', details: validation.errors });
    return;
  }
  
  // Build full order
  const order: Order = {
    id: `order-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    maker: orderRequest.maker,
    conditionId: orderRequest.conditionId,
    outcomeIndex: orderRequest.outcomeIndex,
    isBuy: orderRequest.isBuy,
    price: orderRequest.price,
    amount: orderRequest.amount,
    nonce: orderRequest.nonce,
    expiry: orderRequest.expiry,
    signature: orderRequest.signature,
    createdAt: Date.now(),
    filledAmount: '0',
    status: 'open',
  };
  
  // Verify signature
  if (!verifyOrderSignature(order)) {
    res.status(401).json({ error: 'Invalid signature' });
    return;
  }
  
  // Submit to matching engine
  const result = matchingEngine.submitOrder(order);
  
  res.json({
    orderId: order.id,
    status: order.status,
    filledAmount: order.filledAmount,
    trades: result.trades.map(t => ({
      id: t.id,
      price: t.price,
      amount: t.amount,
      timestamp: t.timestamp,
    })),
  });
});

// Cancel an order
orderBookRouter.delete('/order/:orderId', (req: Request, res: Response) => {
  // Check exchange address is configured
  const exchangeAddr = getExchangeAddress();
  if (!exchangeAddr) {
    res.status(503).json({ error: 'Exchange not configured.' });
    return;
  }
  
  const { orderId } = req.params;
  const { maker, nonce, signature } = req.body;
  
  if (!maker || !signature || nonce === undefined) {
    res.status(400).json({ error: 'Missing maker, nonce, or signature' });
    return;
  }
  
  // Get order
  const order = matchingEngine.getOrder(orderId);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  
  // Verify maker owns order
  if (order.maker.toLowerCase() !== maker?.toLowerCase()) {
    res.status(403).json({ error: 'Not order owner' });
    return;
  }
  
  // Verify EIP-712 cancel signature
  const cancelRequest = { orderId, maker, nonce, signature };
  if (!verifyCancelSignature(cancelRequest)) {
    res.status(401).json({ error: 'Invalid cancel signature' });
    return;
  }
  
  // Cancel order
  const success = matchingEngine.cancelOrder(orderId);
  
  if (success) {
    res.json({ success: true, orderId });
  } else {
    res.status(400).json({ error: 'Cannot cancel order' });
  }
});

// Get user's open orders
orderBookRouter.get('/orders/:maker', (req: Request, res: Response) => {
  const { maker } = req.params;
  const orders = matchingEngine.getOrdersByMaker(maker);
  
  res.json({
    maker,
    orders: orders.map(o => ({
      id: o.id,
      conditionId: o.conditionId,
      outcomeIndex: o.outcomeIndex,
      isBuy: o.isBuy,
      price: o.price,
      pricePercentage: priceToPercentage(o.price),
      amount: o.amount,
      filledAmount: o.filledAmount,
      status: o.status,
      expiry: o.expiry,
      createdAt: o.createdAt,
    })),
  });
});

// Get order by ID
orderBookRouter.get('/order/:orderId', (req: Request, res: Response) => {
  const { orderId } = req.params;
  const order = matchingEngine.getOrder(orderId);
  
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  
  res.json({
    ...order,
    pricePercentage: priceToPercentage(order.price),
  });
});

// Get recent trades
orderBookRouter.get('/trades/:conditionId/:outcomeIndex', (req: Request, res: Response) => {
  const { conditionId, outcomeIndex } = req.params;
  const limit = parseInt(req.query.limit as string) || 50;
  
  const trades = matchingEngine.getRecentTrades(conditionId, parseInt(outcomeIndex), limit);
  
  res.json({
    conditionId,
    outcomeIndex: parseInt(outcomeIndex),
    trades: trades.map(t => ({
      id: t.id,
      price: t.price,
      pricePercentage: priceToPercentage(t.price),
      amount: t.amount,
      timestamp: t.timestamp,
      settled: t.settled,
    })),
  });
});

// Get pending fills for batch settlement (operator only)
orderBookRouter.get('/settlement/pending', (req: Request, res: Response) => {
  // TODO: Add operator authentication
  const fills = matchingEngine.getPendingFills();
  
  res.json({
    count: fills.length,
    fills: fills.map(f => ({
      makerOrder: {
        id: f.makerOrder.id,
        maker: f.makerOrder.maker,
        conditionId: f.makerOrder.conditionId,
        outcomeIndex: f.makerOrder.outcomeIndex,
        isBuy: f.makerOrder.isBuy,
        price: f.makerOrder.price,
        amount: f.makerOrder.amount,
        nonce: f.makerOrder.nonce,
        expiry: f.makerOrder.expiry,
        signature: f.makerOrder.signature,
      },
      takerOrder: {
        id: f.takerOrder.id,
        maker: f.takerOrder.maker,
        conditionId: f.takerOrder.conditionId,
        outcomeIndex: f.takerOrder.outcomeIndex,
        isBuy: f.takerOrder.isBuy,
        price: f.takerOrder.price,
        amount: f.takerOrder.amount,
        nonce: f.takerOrder.nonce,
        expiry: f.takerOrder.expiry,
        signature: f.takerOrder.signature,
      },
      fillAmount: f.fillAmount,
    })),
  });
});

// Mark fills as settled (operator only)
orderBookRouter.post('/settlement/confirm', (req: Request, res: Response) => {
  // TODO: Add operator authentication
  const { tradeIds, txHash } = req.body;
  
  if (!Array.isArray(tradeIds) || tradeIds.length === 0) {
    res.status(400).json({ error: 'Invalid trade IDs' });
    return;
  }
  
  matchingEngine.clearPendingFills(tradeIds);
  
  res.json({
    success: true,
    settledCount: tradeIds.length,
    txHash,
  });
});

// Health check
orderBookRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
  });
});
