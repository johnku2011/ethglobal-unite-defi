import { Chain, Token } from './index';

// Supported Chains Configuration
export const SUPPORTED_CHAINS: Record<string, Chain> = {
  // Ethereum Mainnet
  ethereum: {
    id: '1',
    name: 'Ethereum',
    type: 'evm',
    rpcUrl: 'https://eth.llamarpc.com',
    blockExplorerUrl: 'https://etherscan.io',
    nativeCurrency: {
      address: '0x0000000000000000000000000000000000000000',
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      chainId: '1',
      isNative: true,
    },
    isTestnet: false,
  },
  
  // Polygon Mainnet
  polygon: {
    id: '137',
    name: 'Polygon',
    type: 'evm',
    rpcUrl: 'https://polygon.llamarpc.com',
    blockExplorerUrl: 'https://polygonscan.com',
    nativeCurrency: {
      address: '0x0000000000000000000000000000000000000000',
      symbol: 'MATIC',
      name: 'Polygon',
      decimals: 18,
      chainId: '137',
      isNative: true,
    },
    isTestnet: false,
  },

  // Sui Mainnet
  sui: {
    id: 'sui:mainnet',
    name: 'Sui',
    type: 'sui',
    rpcUrl: 'https://fullnode.mainnet.sui.io:443',
    blockExplorerUrl: 'https://explorer.sui.io',
    nativeCurrency: {
      address: '0x2::sui::SUI',
      symbol: 'SUI',
      name: 'Sui',
      decimals: 9,
      chainId: 'sui:mainnet',
      isNative: true,
    },
    isTestnet: false,
  },

  // Testnet chains
  sepolia: {
    id: '11155111',
    name: 'Sepolia',
    type: 'evm',
    rpcUrl: 'https://sepolia.drpc.org',
    blockExplorerUrl: 'https://sepolia.etherscan.io',
    nativeCurrency: {
      address: '0x0000000000000000000000000000000000000000',
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      chainId: '11155111',
      isNative: true,
    },
    isTestnet: true,
  },

  suiTestnet: {
    id: 'sui:testnet',
    name: 'Sui Testnet',
    type: 'sui',
    rpcUrl: 'https://fullnode.testnet.sui.io:443',
    blockExplorerUrl: 'https://explorer.sui.io/?network=testnet',
    nativeCurrency: {
      address: '0x2::sui::SUI',
      symbol: 'SUI',
      name: 'Sui',
      decimals: 9,
      chainId: 'sui:testnet',
      isNative: true,
    },
    isTestnet: true,
  },
};

// Popular Tokens Configuration
export const POPULAR_TOKENS: Record<string, Token[]> = {
  '1': [ // Ethereum
    {
      address: '0xA0b86a33E6441b53a0cbaE5eaB8C6e76C1c29cd1',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      chainId: '1',
      logoUrl: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png',
      coingeckoId: 'usd-coin',
    },
    {
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      chainId: '1',
      logoUrl: 'https://assets.coingecko.com/coins/images/325/small/Tether-logo.png',
      coingeckoId: 'tether',
    },
    {
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      decimals: 18,
      chainId: '1',
      logoUrl: 'https://assets.coingecko.com/coins/images/9956/small/4943.png',
      coingeckoId: 'dai',
    },
    {
      address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
      symbol: 'WBTC',
      name: 'Wrapped Bitcoin',
      decimals: 8,
      chainId: '1',
      logoUrl: 'https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png',
      coingeckoId: 'wrapped-bitcoin',
    },
  ],
  '137': [ // Polygon
    {
      address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      chainId: '137',
      logoUrl: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png',
      coingeckoId: 'usd-coin',
    },
    {
      address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      chainId: '137',
      logoUrl: 'https://assets.coingecko.com/coins/images/325/small/Tether-logo.png',
      coingeckoId: 'tether',
    },
    {
      address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      decimals: 18,
      chainId: '137',
      logoUrl: 'https://assets.coingecko.com/coins/images/9956/small/4943.png',
      coingeckoId: 'dai',
    },
  ],
};

// API Configuration
export const API_CONFIG = {
  ONEINCH_API_URL: 'https://api.1inch.dev',
  WORMHOLE_API_URL: 'https://api.wormhole.com',
  COINGECKO_API_URL: 'https://api.coingecko.com/api/v3',
  
  // Rate limiting
  MAX_REQUESTS_PER_MINUTE: 60,
  REQUEST_TIMEOUT: 10000, // 10 seconds
  
  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
  
  // Cache configuration
  PRICE_CACHE_TTL: 30000, // 30 seconds
  BALANCE_CACHE_TTL: 60000, // 1 minute
  QUOTE_CACHE_TTL: 15000, // 15 seconds
};

// Wallet Provider Configuration
export const WALLET_PROVIDERS = {
  EVM: {
    METAMASK: 'metamask',
    WALLET_CONNECT: 'walletconnect',
    COINBASE: 'coinbase',
    INJECTED: 'injected',
  },
  SUI: {
    SUI_WALLET: 'sui-wallet',
    SUIET: 'suiet',
    ETHOS: 'ethos',
  },
};

// Transaction Configuration
export const TRANSACTION_CONFIG = {
  // Default gas limits
  DEFAULT_GAS_LIMIT: {
    TRANSFER: 21000,
    ERC20_TRANSFER: 65000,
    SWAP: 200000,
    BRIDGE: 300000,
  },
  
  // Default slippage (in basis points, 100 = 1%)
  DEFAULT_SLIPPAGE: 100, // 1%
  MAX_SLIPPAGE: 5000, // 50%
  
  // Transaction timeouts
  TRANSACTION_TIMEOUT: 300000, // 5 minutes
  BRIDGE_TIMEOUT: 1800000, // 30 minutes
  
  // Confirmation requirements
  MIN_CONFIRMATIONS: {
    ethereum: 12,
    polygon: 20,
    sui: 1,
  },
};

// UI Configuration
export const UI_CONFIG = {
  // Refresh intervals
  PORTFOLIO_REFRESH_INTERVAL: 30000, // 30 seconds
  PRICE_REFRESH_INTERVAL: 15000, // 15 seconds
  TRANSACTION_POLLING_INTERVAL: 5000, // 5 seconds
  
  // Display configuration
  DECIMAL_PLACES: {
    USD: 2,
    TOKEN_BALANCE: 6,
    PERCENTAGE: 2,
  },
  
  // Animation durations
  ANIMATION_DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },
  
  // Toast notification durations
  TOAST_DURATION: {
    SUCCESS: 5000,
    ERROR: 8000,
    WARNING: 6000,
    INFO: 4000,
  },
};

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_TESTNET: process.env.REACT_APP_ENVIRONMENT === 'development',
  ENABLE_BRIDGE: true,
  ENABLE_ADVANCED_TRADING: false,
  ENABLE_ANALYTICS: true,
  ENABLE_NOTIFICATIONS: true,
};

// Error Messages
export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Please connect your wallet to continue',
  INSUFFICIENT_BALANCE: 'Insufficient balance for this transaction',
  NETWORK_ERROR: 'Network error occurred. Please try again.',
  TRANSACTION_FAILED: 'Transaction failed. Please check the details and try again.',
  INVALID_ADDRESS: 'Invalid wallet address format',
  SLIPPAGE_TOO_HIGH: 'Slippage tolerance is too high',
  AMOUNT_TOO_SMALL: 'Amount is too small for this transaction',
  UNKNOWN_ERROR: 'An unexpected error occurred',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  WALLET_CONNECTED: 'Wallet connected successfully',
  TRANSACTION_SUBMITTED: 'Transaction submitted successfully',
  TRANSACTION_CONFIRMED: 'Transaction confirmed',
  BRIDGE_INITIATED: 'Bridge transfer initiated successfully',
  BRIDGE_COMPLETED: 'Bridge transfer completed successfully',
}; 