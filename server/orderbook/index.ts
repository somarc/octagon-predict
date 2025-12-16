// Order Book Module Exports
export { orderBookRouter } from './api';
export { matchingEngine, MatchingEngine } from './engine';
export { 
  setExchangeAddress, 
  getExchangeAddress,
  verifyOrderSignature,
  validateOrder,
  priceToPercentage,
  percentageToPrice,
  createSigningMessage,
  computeOrderHash,
  buildDomain,
  VECHAIN_TESTNET_CONFIG 
} from './signature';
export * from './types';
