// EIP-712 Signature Verification for Octagon Predict
// Compatible with VeChain Connex/VeWorld wallet signing

import { ethers } from 'ethers';
import { Order, EIP712Domain, ORDER_TYPES, CANCEL_ORDER_TYPES, CancelOrderRequest } from './types';

// VeChain Testnet configuration
export const VECHAIN_TESTNET_CONFIG = {
  chainId: 100010,
  name: 'OctagonPredict',
  version: '1',
};

// Exchange contract address (set after deployment)
let exchangeAddress: string = '';

export function setExchangeAddress(address: string): void {
  exchangeAddress = address;
}

export function getExchangeAddress(): string {
  return exchangeAddress;
}

// Build EIP-712 domain
export function buildDomain(): EIP712Domain {
  if (!exchangeAddress) {
    throw new Error('Exchange address not set. Call setExchangeAddress() first.');
  }
  
  return {
    name: VECHAIN_TESTNET_CONFIG.name,
    version: VECHAIN_TESTNET_CONFIG.version,
    chainId: VECHAIN_TESTNET_CONFIG.chainId,
    verifyingContract: exchangeAddress,
  };
}

// Build order data for signing
export function buildOrderData(order: Omit<Order, 'id' | 'signature' | 'createdAt' | 'filledAmount' | 'status'>): {
  domain: EIP712Domain;
  types: typeof ORDER_TYPES;
  value: {
    maker: string;
    conditionId: string;
    outcomeIndex: bigint;
    isBuy: boolean;
    price: bigint;
    amount: bigint;
    nonce: bigint;
    expiry: bigint;
  };
} {
  return {
    domain: buildDomain(),
    types: ORDER_TYPES,
    value: {
      maker: order.maker,
      conditionId: order.conditionId,
      outcomeIndex: BigInt(order.outcomeIndex),
      isBuy: order.isBuy,
      price: BigInt(order.price),
      amount: BigInt(order.amount),
      nonce: BigInt(order.nonce),
      expiry: BigInt(order.expiry),
    },
  };
}

// Compute order hash (for verification and storage)
export function computeOrderHash(order: Omit<Order, 'id' | 'signature' | 'createdAt' | 'filledAmount' | 'status'>): string {
  const { domain, types, value } = buildOrderData(order);
  return ethers.TypedDataEncoder.hash(domain, types, value);
}

// Verify EIP-712 signature
export function verifyOrderSignature(order: Order): boolean {
  try {
    const { domain, types, value } = buildOrderData(order);
    
    // Recover signer address from signature
    const recoveredAddress = ethers.verifyTypedData(
      domain,
      types,
      value,
      order.signature
    );
    
    // Compare with order maker (case-insensitive)
    return recoveredAddress.toLowerCase() === order.maker.toLowerCase();
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
}

// Create signing message for frontend (VeChain Connex format)
export function createSigningMessage(order: Omit<Order, 'id' | 'signature' | 'createdAt' | 'filledAmount' | 'status'>): {
  domain: EIP712Domain;
  primaryType: string;
  types: { EIP712Domain: { name: string; type: string }[]; Order: { name: string; type: string }[] };
  message: Record<string, string | boolean>;
} {
  const { domain, types, value } = buildOrderData(order);
  
  return {
    domain,
    primaryType: 'Order',
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
      ],
      Order: types.Order,
    },
    message: {
      maker: value.maker,
      conditionId: value.conditionId,
      outcomeIndex: value.outcomeIndex.toString(),
      isBuy: value.isBuy,
      price: value.price.toString(),
      amount: value.amount.toString(),
      nonce: value.nonce.toString(),
      expiry: value.expiry.toString(),
    },
  };
}

// Helper: Convert price to probability percentage
export function priceToPercentage(price: string): number {
  const priceWei = BigInt(price);
  const precision = BigInt('1000000000000000000'); // 1e18
  return Number((priceWei * BigInt(10000)) / precision) / 100; // Returns 0.00 to 100.00
}

// Helper: Convert probability percentage to price
export function percentageToPrice(percentage: number): string {
  const precision = BigInt('1000000000000000000'); // 1e18
  const priceWei = (BigInt(Math.round(percentage * 100)) * precision) / BigInt(10000);
  return priceWei.toString();
}

// Validate order parameters
export function validateOrder(order: Omit<Order, 'id' | 'signature' | 'createdAt' | 'filledAmount' | 'status'>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Check address format
  if (!ethers.isAddress(order.maker)) {
    errors.push('Invalid maker address');
  }
  
  // Check condition ID format (should be bytes32)
  if (!/^0x[a-fA-F0-9]{64}$/.test(order.conditionId)) {
    errors.push('Invalid conditionId format (must be bytes32)');
  }
  
  // Check outcome index
  if (order.outcomeIndex < 0 || order.outcomeIndex > 255) {
    errors.push('Invalid outcomeIndex (must be 0-255)');
  }
  
  // Check price (0 < price < 1e18)
  const price = BigInt(order.price);
  const maxPrice = BigInt('1000000000000000000');
  const zero = BigInt(0);
  if (price <= zero || price >= maxPrice) {
    errors.push('Invalid price (must be 0 < price < 1e18)');
  }
  
  // Check amount
  if (BigInt(order.amount) <= zero) {
    errors.push('Invalid amount (must be positive)');
  }
  
  // Check expiry
  const now = Math.floor(Date.now() / 1000);
  if (order.expiry <= now) {
    errors.push('Order already expired');
  }
  
  return { valid: errors.length === 0, errors };
}

// Verify cancel order signature
export function verifyCancelSignature(cancelRequest: CancelOrderRequest): boolean {
  try {
    const domain = buildDomain();
    
    const value = {
      orderId: cancelRequest.orderId,
      maker: cancelRequest.maker,
      nonce: BigInt(cancelRequest.nonce),
    };
    
    const recoveredAddress = ethers.verifyTypedData(
      domain,
      CANCEL_ORDER_TYPES,
      value,
      cancelRequest.signature
    );
    
    return recoveredAddress.toLowerCase() === cancelRequest.maker.toLowerCase();
  } catch (error) {
    console.error('Cancel signature verification failed:', error);
    return false;
  }
}
