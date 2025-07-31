/**
 * 加密貨幣價格相關類型定義
 */

// 基本代幣信息
export interface CryptoToken {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  chainId: string;
  logoUrl?: string;
}

// 加密貨幣價格數據
export interface CryptoPriceData {
  token: CryptoToken;
  price: number; // 當前USD價格
  change24h: number; // 24小時變化百分比
  lastUpdated: Date; // 最後更新時間
}

// 1inch Spot Price API 原始響應類型
export interface SpotPriceApiResponse {
  [tokenAddress: string]: {
    // 以太幣計價
    eth: string;
    // 美元計價
    usd: string;
    // 24小時變化百分比
    usd_24h_change?: number;
    // 24小時交易量
    usd_24h_vol?: number;
    // 最後更新時間（Unix時間戳，毫秒）
    last_updated_at: number;
  };
}

// API請求參數
export interface CryptoPriceParams {
  symbols?: string[]; // 代幣符號列表
  addresses?: string[]; // 代幣地址列表
  chainId?: string; // 區塊鏈ID
  includeChange?: boolean; // 是否包含24小時變化數據
}

// API錯誤類型
export interface CryptoPriceError extends Error {
  code: string;
  retryable: boolean;
  details?: any;
}

// 代幣地址映射表
export interface TokenAddressMap {
  [symbol: string]: string;
}

// 常用代幣地址列表
export const COMMON_TOKEN_ADDRESSES: TokenAddressMap = {
  // 以太坊原生代幣 (ETH)
  ETH: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  // 主要穩定幣
  USDT: '0xdac17f958d2ee523a2206206994597c13d831ec7',
  USDC: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  DAI: '0x6b175474e89094c44da98b954eedeac495271d0f',
  // 熱門加密貨幣
  WBTC: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
  BNB: '0xB8c77482e45F1F44dE1745F52C74426C631bDD52',
  XRP: '0x1d2f0da169ceb9fc7b3144628db156f3f6c60dbe',
  ADA: '0x3ee2200efb3400fabb9aacf31297cbdd1d435d47',
  SOL: '0xd31a59c85ae9d8edefec411d448f90841571b89c',
  DOGE: '0xba2ae424d960c26247dd6c32edc70b295c744c43',
  AVAX: '0x1ce0c2827e2ef14d5c4f29a091d735a204794041',
  MATIC: '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
  LINK: '0x514910771af9ca656af840dff83e8264ecf986ca',
  UNI: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
  // 可根據需要添加更多代幣
};

// 常用代幣信息
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
    address: COMMON_TOKEN_ADDRESSES.WBTC,
    symbol: 'BTC',
    name: 'Bitcoin (Wrapped)',
    decimals: 8,
    chainId: '1',
    logoUrl: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
  },
  // 可根據需要擴展更多代幣信息
};
