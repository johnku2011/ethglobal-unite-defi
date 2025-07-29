// Core chain and network types
export interface Chain {
  id: string;
  name: string;
  type: 'evm' | 'sui';
  rpcUrl: string;
  nativeCurrency: Token;
  blockExplorerUrl?: string;
  isTestnet?: boolean;
}

// Token and asset types
export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  chainId: string;
  logoUrl?: string;
  isNative?: boolean;
  coingeckoId?: string;
}

export interface AssetBalance {
  token: Token;
  balance: string;
  usdValue: number;
  chain: Chain;
}

export interface TokenPrice {
  token: Token;
  usdPrice: number;
  change24h: number;
  lastUpdated: Date;
}

// Wallet connection types
export type WalletType = 'evm' | 'sui';

export interface WalletProvider {
  name: string;
  icon?: string;
  isInstalled: boolean;
  isConnected: boolean;
}

export interface ConnectedWallet {
  address: string;
  chain: Chain;
  type: WalletType;
  provider: WalletProvider;
  shortAddress: string;
}

// Portfolio types
export interface PortfolioData {
  totalValue: number;
  assets: AssetBalance[];
  chainBreakdown: ChainAllocation[];
  priceChanges: PriceChange[];
  lastUpdated: Date;
}

export interface ChainAllocation {
  chain: Chain;
  value: number;
  percentage: number;
  assetCount: number;
}

export interface PriceChange {
  token: Token;
  change24h: number;
  changePercentage24h: number;
}

// Transaction types
export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface BaseTransaction {
  id: string;
  status: TransactionStatus;
  txHash?: string;
  timestamp: Date;
  gasUsed?: string;
  gasFee?: string;
}

// Swap related types
export interface SwapRoute {
  protocol: string;
  percentage: number;
  fromToken: Token;
  toToken: Token;
}

export interface SwapQuote {
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: string;
  slippage: number;
  gasEstimate: string;
  route: SwapRoute[];
  priceImpact: number;
  minimumReceived: string;
}

export interface SwapQuoteParams {
  fromToken: Token;
  toToken: Token;
  amount: string;
  slippage?: number;
  fromAddress: string;
}

export interface SwapTransaction extends BaseTransaction {
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: string;
  actualToAmount?: string;
  slippage: number;
  priceImpact: number;
}

// Bridge related types
export enum BridgeStatus {
  INITIATED = 'initiated',
  SOURCE_CONFIRMED = 'source_confirmed',
  BRIDGING = 'bridging',
  DESTINATION_PENDING = 'destination_pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export interface BridgeFees {
  networkFee: string;
  protocolFee: string;
  totalFee: string;
}

export interface BridgeQuote {
  sourceChain: Chain;
  destinationChain: Chain;
  asset: Token;
  amount: string;
  estimatedReceiveAmount: string;
  estimatedTime: number; // in seconds
  fees: BridgeFees;
  route?: string;
}

export interface BridgeQuoteParams {
  sourceChain: Chain;
  destinationChain: Chain;
  asset: Token;
  amount: string;
  sourceAddress: string;
  destinationAddress: string;
}

export interface BridgeTransaction extends BaseTransaction {
  sourceChain: Chain;
  destinationChain: Chain;
  asset: Token;
  amount: string;
  estimatedReceiveAmount: string;
  actualReceiveAmount?: string;
  bridgeStatus: BridgeStatus;
  sourceTxHash?: string;
  destinationTxHash?: string;
  estimatedTime: number;
  fees: BridgeFees;
}

export interface BridgeResult {
  transactionId: string;
  sourceTxHash: string;
  estimatedTime: number;
}

// Error types
export enum ErrorType {
  WALLET_CONNECTION = 'WALLET_CONNECTION',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  BRIDGE_ERROR = 'BRIDGE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface AppError {
  type: ErrorType;
  message: string;
  details?: any;
  recoverable: boolean;
  suggestedAction?: string;
  code?: string;
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: AppError;
  success: boolean;
}

// 1inch API specific types
export interface OneInchToken {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoURI: string;
}

export interface OneInchQuoteResponse {
  fromToken: OneInchToken;
  toToken: OneInchToken;
  toTokenAmount: string;
  fromTokenAmount: string;
  protocols: any[];
  estimatedGas: number;
}

export interface OneInchSwapResponse {
  fromToken: OneInchToken;
  toToken: OneInchToken;
  toTokenAmount: string;
  fromTokenAmount: string;
  protocols: any[];
  tx: {
    from: string;
    to: string;
    data: string;
    value: string;
    gasPrice: string;
    gas: number;
  };
}

// State management types
export interface WalletState {
  connectedWallets: ConnectedWallet[];
  isConnecting: boolean;
  connectionError?: AppError;
}

export interface PortfolioState {
  data?: PortfolioData;
  isLoading: boolean;
  error?: AppError;
  lastRefresh?: Date;
}

export interface SwapState {
  quote?: SwapQuote;
  isLoadingQuote: boolean;
  quoteError?: AppError;
  pendingTransactions: SwapTransaction[];
  history: SwapTransaction[];
}

export interface BridgeState {
  quote?: BridgeQuote;
  isLoadingQuote: boolean;
  quoteError?: AppError;
  pendingTransactions: BridgeTransaction[];
  history: BridgeTransaction[];
}

// Utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
