/**
 * 交易歷史數據類型定義
 * 基於1inch Portfolio API v5.0
 */

export interface TokenAction {
  chainId: string; // 代幣所在鏈ID
  address: string; // 代幣合約地址
  standard: string; // 代幣標準（ERC20等）
  fromAddress: string; // 發送地址
  toAddress: string; // 接收地址
  amount: string; // 代幣數量
  direction: string; // 操作方向
  priceToUsd?: number; // 美元價值
}

export interface TransactionDetails {
  txHash: string; // 交易哈希
  chainId: number; // 區塊鏈ID
  blockNumber: number; // 區塊號
  blockTimeSec: number; // 區塊時間戳（秒）
  status: string; // 交易狀態
  type: string; // 交易類型名稱
  tokenActions: TokenAction[]; // 代幣操作列表
  fromAddress: string; // 發送地址
  toAddress: string; // 接收地址
  nonce: number; // 交易nonce
  orderInBlock: number; // 交易在區塊中的順序
  feeInSmallestNative: string; // 交易費用
  nativeTokenPriceToUsd: number | null; // 原生代幣價格
}

export interface Transaction {
  timeMs: number; // 交易時間戳（毫秒）
  address: string; // 錢包地址
  type: number; // 交易類型編號
  rating: string; // 交易評級
  direction: 'in' | 'out'; // 交易方向
  details: TransactionDetails;
  id: string; // 交易唯一ID
  eventOrderInTransaction: number; // 事件在交易中的順序
}

export interface TransactionHistory {
  items: Transaction[]; // 交易列表
  total: number; // 交易總數
  cache_counter?: number; // 緩存計數器
}

/**
 * 交易查詢參數
 */
export interface TransactionQueryParams {
  chainIds?: number[]; // 區塊鏈ID列表
  limit?: number; // 結果數量限制
  fromTimestampMs?: number; // 開始時間戳（毫秒）
  toTimestampMs?: number; // 結束時間戳（毫秒）
  types?: string[]; // 交易類型篩選
}

/**
 * 交易類型枚舉
 */
export enum TransactionType {
  SWAP = 'swap',
  TRANSFER = 'transfer',
  RECEIVE = 'receive',
  APPROVE = 'approve',
  CANCEL = 'cancel',
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  CLAIM = 'claim',
  STAKE = 'stake',
  UNSTAKE = 'unstake',
  BORROW = 'borrow',
  REPAY = 'repay',
  MINT = 'mint',
  BURN = 'burn',
  UNKNOWN = 'unknown',
}

/**
 * 交易狀態枚舉
 */
export enum TransactionStatus {
  SUCCESS = 'success',
  PENDING = 'pending',
  FAILED = 'failed',
}
