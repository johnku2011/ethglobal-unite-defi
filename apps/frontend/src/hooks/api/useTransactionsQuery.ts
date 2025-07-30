/**
 * 交易歷史查詢Hook
 */

import { useQuery } from '@tanstack/react-query';
import {
  TransactionHistory,
  TransactionQueryParams,
} from '../../types/transaction';
import { TransactionService } from '../../services/transactionService';

/**
 * 交易歷史查詢Hook選項
 */
export interface UseTransactionsOptions extends TransactionQueryParams {
  enabled?: boolean; // 是否啟用查詢
  refetchInterval?: number; // 重新獲取數據的間隔
  staleTime?: number; // 數據過期時間
}

/**
 * 交易歷史查詢Hook
 * @param address 錢包地址
 * @param options 查詢選項
 * @returns 查詢結果
 */
export function useTransactionsQuery(
  address: string | undefined,
  options: UseTransactionsOptions = {}
) {
  const {
    enabled = true,
    refetchInterval,
    staleTime = 5 * 60 * 1000, // 默認5分鐘
    ...queryParams
  } = options;

  return useQuery<TransactionHistory, Error>({
    queryKey: ['transactions', address, queryParams],
    queryFn: async () => {
      if (!address) {
        throw new Error('Address is required for fetching transactions');
      }

      return TransactionService.fetchTransactions(address, queryParams);
    },
    enabled: !!address && enabled,
    refetchInterval,
    staleTime,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // 指數回退，最多30秒
  });
}

/**
 * 按日期範圍查詢交易歷史
 * @param address 錢包地址
 * @param startDate 開始日期
 * @param endDate 結束日期
 * @param options 查詢選項
 * @returns 查詢結果
 */
export function useTransactionsByDateRange(
  address: string | undefined,
  startDate?: Date,
  endDate?: Date,
  options: Omit<
    UseTransactionsOptions,
    'fromTimestampMs' | 'toTimestampMs'
  > = {}
) {
  const fromTimestampMs = startDate?.getTime();
  const toTimestampMs = endDate?.getTime();

  return useTransactionsQuery(address, {
    ...options,
    fromTimestampMs,
    toTimestampMs,
  });
}

/**
 * 按區塊鏈ID查詢交易歷史
 * @param address 錢包地址
 * @param chainId 區塊鏈ID
 * @param options 查詢選項
 * @returns 查詢結果
 */
export function useTransactionsByChain(
  address: string | undefined,
  chainId: number,
  options: Omit<UseTransactionsOptions, 'chainIds'> = {}
) {
  return useTransactionsQuery(address, {
    ...options,
    chainIds: [chainId],
  });
}

/**
 * 獲取交易詳情
 * @param chainId 區塊鏈ID
 * @param txHash 交易哈希
 * @param options 查詢選項
 * @returns 查詢結果
 */
export function useTransactionDetails(
  chainId: number | undefined,
  txHash: string | undefined,
  options: { enabled?: boolean } = {}
) {
  return useQuery({
    queryKey: ['transaction', chainId, txHash],
    queryFn: async () => {
      if (!chainId || !txHash) {
        throw new Error('Chain ID and transaction hash are required');
      }

      const details = await TransactionService.getTransactionDetails(
        chainId,
        txHash
      );
      if (!details) {
        throw new Error('Transaction details not found');
      }

      return details;
    },
    enabled: !!chainId && !!txHash && (options.enabled ?? true),
    staleTime: 30 * 60 * 1000, // 30分鐘
  });
}
