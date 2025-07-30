/**
 * 1inch Portfolio API 專用類型定義
 * 基於業界最佳實踐和API規範
 */

// 重新導出通用類型，避免衝突
export type {
  PortfolioData,
  ChainAllocation,
  PriceChange,
  PortfolioState,
  AssetBalance,
  Token,
  AppError,
} from './index';

/**
 * 1inch Portfolio API 基礎類型
 */
export interface OneInchChain {
  id: number;
  name: string;
  status: 'completed' | 'in_progress' | 'failed';
  data: {
    result: OneInchProtocol[];
  };
}

export interface OneInchProtocol {
  chain_id: number;
  contract_address: string;
  protocol: string;
  name: string;
  value_usd: number;
  underlying_tokens: OneInchUnderlyingToken[];
  profit_abs_usd: number | null;
  roi: number | null;
}

export interface OneInchUnderlyingToken {
  chain_id: number;
  address: string;
  name: string;
  symbol: string;
  amount: number;
  price_to_usd: number;
  value_usd: number;
}

/**
 * 1inch Portfolio API 響應類型
 */
export interface OneInchPortfolioResponse {
  chains: OneInchChain[];
  positions: OneInchProtocol[];
  totalValueUsd: number;
}

export interface OneInchBalanceHistoryResponse {
  message: string;
  address: string;
  timerange: string;
  useCache: boolean;
  result: { [chainId: string]: OneInchHistoryPoint[] };
}

export interface OneInchHistoryPoint {
  timestamp: number;
  value_usd: number;
}

export interface OneInchTransaction {
  timeMs: number;
  address: string;
  type: number;
  rating: string;
  direction: 'in' | 'out';
  details: {
    txHash: string;
    chainId: number;
    blockNumber: number;
    tokenActions: OneInchTokenAction[];
  };
}

export interface OneInchTokenAction {
  chainId: string;
  address: string;
  standard: string;
  amount: string;
  direction: string;
  priceToUsd?: number;
}

/**
 * 轉換後的Portfolio數據類型
 * 適配本項目的數據結構
 */
export interface ProcessedPortfolioData {
  totalValue: number;
  totalChange24h: number;
  totalChangePercentage24h: number;
  chains: ProcessedChainData[];
  protocols: ProcessedProtocolData[];
  lastUpdated: Date;
  address: string;
}

export interface ProcessedChainData {
  chainId: number;
  chainName: string;
  totalValue: number;
  totalChange24h: number;
  percentage: number;
  protocolCount: number;
  status: 'completed' | 'in_progress' | 'failed';
  protocols: ProcessedProtocolData[];
}

export interface ProcessedProtocolData {
  name: string;
  protocol: string;
  contractAddress: string;
  chainId: number;
  value: number;
  tokens: ProcessedTokenData[];
  profitLoss?: {
    absolute: number;
    percentage: number;
  };
}

export interface ProcessedTokenData {
  address: string;
  name: string;
  symbol: string;
  amount: number;
  value: number;
  price: number;
  chainId: number;
}

/**
 * 圖表數據類型
 */
export interface ChartDataPoint {
  timestamp: number;
  date: string;
  totalValue: number;
  chains: { [chainId: string]: number };
}

export interface ProcessedChartData {
  timerange: string;
  address: string;
  data: ChartDataPoint[];
  summary: {
    currentValue: number;
    startValue: number;
    change: number;
    changePercentage: number;
    highestValue: number;
    lowestValue: number;
  };
}

/**
 * 交易歷史處理後的類型
 */
export interface ProcessedTransaction {
  id: string;
  hash: string;
  timestamp: Date;
  type: 'receive' | 'send' | 'swap' | 'bridge' | 'farm' | 'stake' | 'other';
  direction: 'in' | 'out';
  chainId: number;
  chainName: string;
  value: number;
  tokens: {
    symbol: string;
    amount: string;
    value: number;
    direction: 'in' | 'out';
  }[];
  rating: string;
  status: 'confirmed' | 'pending' | 'failed';
}

/**
 * Portfolio統計類型
 */
export interface PortfolioStats {
  totalValue: number;
  change24h: number;
  changePercentage24h: number;
  chainCount: number;
  protocolCount: number;
  tokenCount: number;
  topChain: {
    name: string;
    value: number;
    percentage: number;
  };
  topProtocol: {
    name: string;
    value: number;
    percentage: number;
  };
  lastUpdated: Date;
}

/**
 * API錯誤類型
 */
export interface PortfolioAPIError {
  code:
    | 'NETWORK_ERROR'
    | 'API_ERROR'
    | 'TIMEOUT'
    | 'INVALID_ADDRESS'
    | 'RATE_LIMITED'
    | 'UNKNOWN_ERROR';
  message: string;
  details?: any;
  retryable: boolean;
  timestamp: Date;
}

/**
 * 緩存相關類型
 */
export interface PortfolioCacheInfo {
  address: string;
  lastFetch: Date;
  isStale: boolean;
  nextUpdate: Date;
  version: string;
}

/**
 * API請求參數類型
 */
export interface PortfolioFetchParams {
  address: string;
  maxRetries?: number;
  retryDelay?: number;
  forceRefresh?: boolean;
}

export interface ValueChartParams {
  address: string;
  timerange: '1day' | '1week' | '1month' | '3months' | '1year' | '3years';
  useCache?: boolean;
}

export interface TransactionHistoryParams {
  address: string;
  limit?: number;
  offset?: number;
  chainId?: number;
}

/**
 * 響應狀態類型
 */
export interface PortfolioQueryState<T = any> {
  data?: T;
  isLoading: boolean;
  isError: boolean;
  error?: PortfolioAPIError;
  isFetching: boolean;
  isRefetching: boolean;
  lastUpdated?: Date;
}

/**
 * 服務配置類型
 */
export interface PortfolioServiceConfig {
  apiBaseUrl: string;
  apiKey?: string;
  timeout: number;
  maxRetries: number;
  retryDelay: number;
  cacheTimeout: number;
  enableDevLogs: boolean;
}

/**
 * 查詢鍵工廠類型
 */
export interface PortfolioQueryKeys {
  portfolio: {
    all: readonly string[];
    byAddress: (address: string) => readonly string[];
    valueChart: (address: string, timerange: string) => readonly string[];
    transactions: (address: string, limit?: number) => readonly string[];
    chainData: (address: string, chainId: number) => readonly string[];
  };
  system: {
    supportedChains: readonly string[];
    health: readonly string[];
  };
}

/**
 * Hook返回類型
 */
export interface UsePortfolioReturn {
  // 數據
  data?: ProcessedPortfolioData;
  stats?: PortfolioStats;

  // 狀態
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  isRefetching: boolean;

  // 錯誤
  error?: PortfolioAPIError;

  // 操作
  refetch: () => Promise<any>;
  refresh: () => Promise<void>;
}

export interface UseValueChartReturn {
  data?: ProcessedChartData;
  isLoading: boolean;
  isError: boolean;
  error?: PortfolioAPIError;
  refetch: () => Promise<any>;
}

export interface UseTransactionHistoryReturn {
  data?: ProcessedTransaction[];
  isLoading: boolean;
  isError: boolean;
  error?: PortfolioAPIError;
  refetch: () => Promise<any>;
  hasNextPage: boolean;
  fetchNextPage: () => Promise<any>;
}

/**
 * 工具類型
 */
export type TimeRange =
  | '1day'
  | '1week'
  | '1month'
  | '3months'
  | '1year'
  | '3years';
export type ChainStatus = 'completed' | 'in_progress' | 'failed';
export type TransactionType =
  | 'receive'
  | 'send'
  | 'swap'
  | 'bridge'
  | 'farm'
  | 'stake'
  | 'other';
export type TransactionDirection = 'in' | 'out';

/**
 * 條件類型工具
 */
export type PortfolioDataWithStatus<T extends ChainStatus> =
  T extends 'completed'
    ? ProcessedPortfolioData
    : T extends 'in_progress'
      ? Partial<ProcessedPortfolioData>
      : null;

/**
 * 導出所有相關類型的聯合類型
 */
export type PortfolioAPITypes =
  | OneInchPortfolioResponse
  | OneInchBalanceHistoryResponse
  | OneInchTransaction
  | ProcessedPortfolioData
  | ProcessedChartData
  | ProcessedTransaction
  | PortfolioStats;

// 預設導出主要類型
export type {
  OneInchPortfolioResponse as PortfolioResponse,
  OneInchBalanceHistoryResponse as BalanceHistoryResponse,
  OneInchTransaction as Transaction,
  ProcessedPortfolioData as Portfolio,
  ProcessedChartData as ChartData,
  ProcessedTransaction as TransactionRecord,
} from './portfolio';
