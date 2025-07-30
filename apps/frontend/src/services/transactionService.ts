/**
 * 交易歷史服務
 * 使用1inch Portfolio API v5.0獲取和處理交易歷史數據
 */

import {
  Transaction,
  TransactionHistory,
  TransactionQueryParams,
} from '../types/transaction';
import { axiosClient } from './api/axiosClient';

/**
 * 交易歷史服務類
 */
export class TransactionService {
  /**
   * 獲取錢包地址的交易歷史
   * @param address 錢包地址
   * @param options 查詢選項
   * @returns 交易歷史數據
   */
  static async fetchTransactions(
    address: string,
    options?: TransactionQueryParams
  ): Promise<TransactionHistory> {
    try {
      // 構建查詢參數
      const params: Record<string, any> = {};

      if (options?.limit) {
        params.limit = options.limit;
      }

      if (options?.chainIds && options.chainIds.length > 0) {
        params.chains = options.chainIds.join(',');
      }

      if (options?.fromTimestampMs) {
        params.fromTimestampMs = options.fromTimestampMs;
      }

      if (options?.toTimestampMs) {
        params.toTimestampMs = options.toTimestampMs;
      }

      if (options?.types && options.types.length > 0) {
        params.types = options.types.join(',');
      }

      // 調用API獲取交易歷史
      const response = await axiosClient.get<TransactionHistory>(
        `/portfolio/${address.toLowerCase()}/history`,
        { params }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      throw error;
    }
  }

  /**
   * 過濾交易按類型
   * @param transactions 交易列表
   * @param type 交易類型
   * @returns 過濾後的交易列表
   */
  static filterTransactionsByType(
    transactions: Transaction[],
    type: string
  ): Transaction[] {
    return transactions.filter(
      (tx) => tx.details.type.toLowerCase() === type.toLowerCase()
    );
  }

  /**
   * 按日期範圍過濾交易
   * @param transactions 交易列表
   * @param fromDate 開始日期
   * @param toDate 結束日期
   * @returns 過濾後的交易列表
   */
  static filterTransactionsByDateRange(
    transactions: Transaction[],
    fromDate?: Date,
    toDate?: Date
  ): Transaction[] {
    return transactions.filter((tx) => {
      const txDate = new Date(tx.timeMs);

      if (fromDate && txDate < fromDate) {
        return false;
      }

      if (toDate && txDate > toDate) {
        return false;
      }

      return true;
    });
  }

  /**
   * 計算交易總額
   * @param transactions 交易列表
   * @returns 交易總額（美元）
   */
  static calculateTransactionVolume(transactions: Transaction[]): number {
    return transactions.reduce((total, tx) => {
      const txVolume = tx.details.tokenActions.reduce(
        (sum, action) => sum + (action.priceToUsd || 0),
        0
      );
      return total + txVolume;
    }, 0);
  }

  /**
   * 獲取交易詳情
   * @param chainId 區塊鏈ID
   * @param txHash 交易哈希
   * @returns 交易詳情
   */
  static async getTransactionDetails(
    chainId: number,
    txHash: string
  ): Promise<Transaction | null> {
    try {
      const response = await axiosClient.get<Transaction>(
        `/portfolio/transaction/${chainId}/${txHash}`
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      return null;
    }
  }

  /**
   * 將交易數據分組按日期
   * @param transactions 交易列表
   * @returns 按日期分組的交易數據
   */
  static groupTransactionsByDate(
    transactions: Transaction[]
  ): Record<string, Transaction[]> {
    return transactions.reduce(
      (groups, transaction) => {
        // 按日期分組（YYYY-MM-DD）
        const date = new Date(transaction.timeMs).toISOString().split('T')[0];

        if (!groups[date]) {
          groups[date] = [];
        }

        groups[date].push(transaction);
        return groups;
      },
      {} as Record<string, Transaction[]>
    );
  }

  /**
   * 按類型統計交易數量
   * @param transactions 交易列表
   * @returns 按類型統計的交易數量
   */
  static countTransactionsByType(
    transactions: Transaction[]
  ): Record<string, number> {
    return transactions.reduce(
      (counts, tx) => {
        const type = tx.details.type.toLowerCase();
        counts[type] = (counts[type] || 0) + 1;
        return counts;
      },
      {} as Record<string, number>
    );
  }
}
