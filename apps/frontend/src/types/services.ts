import {
  ConnectedWallet,
  PortfolioData,
  AssetBalance,
  TokenPrice,
  Token,
  SwapQuote,
  SwapQuoteParams,
  SwapTransaction,
  BridgeQuote,
  BridgeQuoteParams,
  BridgeTransaction,
  BridgeResult,
  TransactionStatus,
  BridgeStatus,
  ApiResponse,
} from './index';

// Portfolio Service Interface
export interface IPortfolioService {
  /**
   * Get comprehensive portfolio data for connected wallets
   */
  getPortfolioData(wallets: ConnectedWallet[]): Promise<PortfolioData>;

  /**
   * Get asset balances for a specific wallet
   */
  getAssetBalances(wallet: ConnectedWallet): Promise<AssetBalance[]>;

  /**
   * Get current prices for a list of tokens
   */
  getAssetPrices(tokens: Token[]): Promise<TokenPrice[]>;

  /**
   * Subscribe to real-time portfolio updates
   */
  subscribeToUpdates(
    wallets: ConnectedWallet[],
    callback: (data: PortfolioData) => void
  ): () => void;

  /**
   * Refresh portfolio data manually
   */
  refreshPortfolio(wallets: ConnectedWallet[]): Promise<PortfolioData>;
}

// Wallet Service Interface
export interface IWalletService {
  /**
   * Connect to a wallet provider
   */
  connect(
    walletType: 'evm' | 'sui',
    providerName?: string
  ): Promise<ConnectedWallet>;

  /**
   * Disconnect from a wallet
   */
  disconnect(wallet: ConnectedWallet): Promise<void>;

  /**
   * Get connection status
   */
  isConnected(walletType: 'evm' | 'sui'): boolean;

  /**
   * Get connected wallets
   */
  getConnectedWallets(): ConnectedWallet[];

  /**
   * Switch network for EVM wallets
   */
  switchNetwork(chainId: string): Promise<void>;

  /**
   * Sign a message
   */
  signMessage(wallet: ConnectedWallet, message: string): Promise<string>;
}

// Swap Service Interface
export interface ISwapService {
  /**
   * Get swap quote from 1inch API
   */
  getSwapQuote(params: SwapQuoteParams): Promise<SwapQuote>;

  /**
   * Execute a swap transaction
   */
  executeSwap(
    quote: SwapQuote,
    wallet: ConnectedWallet
  ): Promise<SwapTransaction>;

  /**
   * Get swap transaction history
   */
  getSwapHistory(wallet: ConnectedWallet): Promise<SwapTransaction[]>;

  /**
   * Track swap transaction status
   */
  trackSwapStatus(transactionId: string): Promise<TransactionStatus>;

  /**
   * Cancel pending swap (if possible)
   */
  cancelSwap(transactionId: string): Promise<boolean>;

  // Note: getSupportedTokens() moved to OneInchBalanceService to avoid duplication
}

// Bridge Service Interface
export interface IBridgeService {
  /**
   * Get bridge quote for cross-chain transfer
   */
  getBridgeQuote(params: BridgeQuoteParams): Promise<BridgeQuote>;

  /**
   * Initiate cross-chain bridge transfer
   */
  initiateBridge(
    quote: BridgeQuote,
    sourceWallet: ConnectedWallet,
    destinationWallet: ConnectedWallet
  ): Promise<BridgeResult>;

  /**
   * Track bridge transaction status
   */
  trackBridgeStatus(transactionId: string): Promise<BridgeStatus>;

  /**
   * Get bridge transaction history
   */
  getBridgeHistory(wallet: ConnectedWallet): Promise<BridgeTransaction[]>;

  /**
   * Get supported chains for bridging
   */
  getSupportedChains(): Promise<{ source: string[]; destination: string[] }>;

  /**
   * Get supported assets for bridging between chains
   */
  getSupportedAssets(
    sourceChain: string,
    destinationChain: string
  ): Promise<Token[]>;
}

// Price Service Interface
export interface IPriceService {
  /**
   * Get real-time price for a token
   */
  getTokenPrice(token: Token): Promise<TokenPrice>;

  /**
   * Get prices for multiple tokens
   */
  getTokenPrices(tokens: Token[]): Promise<TokenPrice[]>;

  /**
   * Subscribe to price updates
   */
  subscribeToPriceUpdates(
    tokens: Token[],
    callback: (prices: TokenPrice[]) => void
  ): () => void;

  /**
   * Get historical price data
   */
  getHistoricalPrices(
    token: Token,
    timeframe: '1h' | '24h' | '7d' | '30d'
  ): Promise<{ timestamp: Date; price: number }[]>;
}

// Blockchain Client Interface
export interface IBlockchainClient {
  /**
   * Get token balance for an address
   */
  getTokenBalance(tokenAddress: string, walletAddress: string): Promise<string>;

  /**
   * Get native token balance
   */
  getNativeBalance(walletAddress: string): Promise<string>;

  /**
   * Send transaction
   */
  sendTransaction(transaction: any): Promise<string>;

  /**
   * Get transaction status
   */
  getTransactionStatus(txHash: string): Promise<TransactionStatus>;

  /**
   * Get transaction receipt
   */
  getTransactionReceipt(txHash: string): Promise<any>;

  /**
   * Estimate gas for transaction
   */
  estimateGas(transaction: any): Promise<string>;

  /**
   * Get current gas price
   */
  getGasPrice(): Promise<string>;
}

// API Client Interfaces
export interface IOneInchApiClient {
  /**
   * Get swap quote
   */
  getQuote(params: any): Promise<ApiResponse<any>>;

  /**
   * Get swap transaction data
   */
  getSwap(params: any): Promise<ApiResponse<any>>;

  /**
   * Get supported tokens
   */
  getTokens(chainId: number): Promise<ApiResponse<any>>;

  /**
   * Get token prices
   */
  getPrices(
    chainId: number,
    tokenAddresses?: string[]
  ): Promise<ApiResponse<any>>;
}

export interface IWormholeApiClient {
  /**
   * Get bridge quote
   */
  getQuote(params: any): Promise<ApiResponse<any>>;

  /**
   * Submit bridge transaction
   */
  submitTransaction(params: any): Promise<ApiResponse<any>>;

  /**
   * Track bridge status
   */
  getStatus(transactionId: string): Promise<ApiResponse<any>>;

  /**
   * Get supported routes
   */
  getRoutes(): Promise<ApiResponse<any>>;
}
