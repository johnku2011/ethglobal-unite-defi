/**
 * Cryptocurrency price related type definitions
 */

// Basic token information
export interface CryptoToken {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  chainId: string;
  logoUrl?: string;
}

// Cryptocurrency price data
export interface CryptoPriceData {
  token: CryptoToken;
  price: number; // Current USD price
  change24h: number; // 24-hour change percentage
  lastUpdated: Date; // Last update time
}

// 1inch Spot Price API raw response type
export interface SpotPriceApiResponse {
  [tokenAddress: string]: {
    // ETH price
    eth: string;
    // USD price
    usd: string;
    // 24-hour change percentage
    usd_24h_change?: number;
    // 24-hour trading volume
    usd_24h_vol?: number;
    // Last update time (Unix timestamp, milliseconds)
    last_updated_at: number;
  };
}

// API request parameters
export interface CryptoPriceParams {
  symbols?: string[]; // Token symbol list
  addresses?: string[]; // Token address list
  chainId?: string; // Blockchain ID
  includeChange?: boolean; // Whether to include 24-hour change data
}

// API error type
export interface CryptoPriceError extends Error {
  code: string;
  retryable: boolean;
  details?: any;
}

// Token address mapping table
export interface TokenAddressMap {
  [symbol: string]: string;
}

// Common token addresses list
export const COMMON_TOKEN_ADDRESSES: TokenAddressMap = {
  // Ethereum native token (ETH)
  ETH: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  // Major stablecoins
  USDT: '0xdac17f958d2ee523a2206206994597c13d831ec7',
  USDC: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  DAI: '0x6b175474e89094c44da98b954eedeac495271d0f',
  // Popular cryptocurrencies
  BTC: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', // WBTC (Wrapped Bitcoin)
  BNB: '0xB8c77482e45F1F44dE1745F52C74426C631bDD52',
  XRP: '0x1d2f0da169ceb9fc7b3144628db156f3f6c60dbe',
  ADA: '0x3ee2200efb3400fabb9aacf31297cbdd1d435d47',
  SOL: '0xd31a59c85ae9d8edefec411d448f90841571b89c',
  DOGE: '0xba2ae424d960c26247dd6c32edc70b295c744c43',
  AVAX: '0x1ce0c2827e2ef14d5c4f29a091d735a204794041',
  MATIC: '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
  LINK: '0x514910771af9ca656af840dff83e8264ecf986ca',
  UNI: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
  // More tokens can be added as needed
};

// Common token information
export const COMMON_TOKENS: Record<string, CryptoToken> = {
  ETH: {
    address: COMMON_TOKEN_ADDRESSES.ETH,
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    chainId: '1',
    logoUrl: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
  },
  USDT: {
    address: COMMON_TOKEN_ADDRESSES.USDT,
    symbol: 'USDT',
    name: 'Tether',
    decimals: 6,
    chainId: '1',
    logoUrl: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
  },
  USDC: {
    address: COMMON_TOKEN_ADDRESSES.USDC,
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    chainId: '1',
    logoUrl: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
  },
  BTC: {
    address: COMMON_TOKEN_ADDRESSES.BTC,
    symbol: 'BTC',
    name: 'Bitcoin (Wrapped)',
    decimals: 8,
    chainId: '1',
    logoUrl: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
  },
  // More token information can be expanded as needed
};
