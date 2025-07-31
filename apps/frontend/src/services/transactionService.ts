/**
 * Transaction history service
 * Uses 1inch Transaction API v2.0 to fetch and process transaction history data
 */

import {
  Transaction,
  TransactionHistory,
  TransactionQueryParams,
} from '../types/transaction';
import { historyApiClient } from './api/axiosClient';

/**
 * Transaction history service class
 */
export class TransactionService {
  /**
   * Fetches transaction history for a wallet address
   * @param address Wallet address
   * @param options Query parameters
   * @returns Transaction history data
   */
  static async fetchTransactions(
    address: string,
    options?: TransactionQueryParams
  ): Promise<TransactionHistory> {
    try {
      // Build query parameters according to 1inch History API requirements
      const params: Record<string, any> = {};

      if (options?.limit) {
        params.limit = options.limit;
      }

      if (options?.chainIds && options.chainIds.length > 0) {
        // History API expects chainId as a single value or comma-separated list
        params.chainId = options.chainIds.join(',');
      }

      if (options?.fromTimestampMs) {
        params.fromTimestampMs = options.fromTimestampMs;
      }

      if (options?.toTimestampMs) {
        params.toTimestampMs = options.toTimestampMs;
      }

      if (options?.types && options.types.length > 0) {
        // History API expects types as a parameter
        params.types = options.types.join(',');
      }

      // Use GET request with the Next.js API route for History API
      const response = await historyApiClient.get<TransactionHistory>(
        `/${address.toLowerCase()}/events`,
        { params }
      );

      console.log(
        '📊 1inch History API response:',
        response.status,
        response.statusText
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      throw error;
    }
  }

  /**
   * Filters transactions by type
   * @param transactions Transaction list
   * @param type Transaction type
   * @returns Filtered transaction list
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
   * Filters transactions by date range
   * @param transactions Transaction list
   * @param fromDate Start date
   * @param toDate End date
   * @returns Filtered transaction list
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
   * Calculates total transaction volume
   * @param transactions Transaction list
   * @returns Total transaction volume (USD)
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
   * Gets transaction details
   * @param chainId Blockchain ID
   * @param txHash Transaction hash
   * @returns Transaction details
   */
  static async getTransactionDetails(
    chainId: number,
    txHash: string
  ): Promise<Transaction | null> {
    try {
      // Using History API through Next.js API route
      const response = await historyApiClient.get<Transaction>(
        `/transaction/${chainId}/${txHash}`
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      return null;
    }
  }

  /**
   * Groups transactions by date
   * @param transactions Transaction list
   * @returns Transactions grouped by date
   */
  static groupTransactionsByDate(
    transactions: Transaction[]
  ): Record<string, Transaction[]> {
    return transactions.reduce(
      (groups, transaction) => {
        // Group by date (YYYY-MM-DD)
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
   * Counts transactions by type
   * @param transactions Transaction list
   * @returns Transactions count by type
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

  /**
   * Gets swap transactions for a wallet address
   * @param address Wallet address
   * @param options Query parameters
   * @returns Swap transactions
   */
  static async fetchSwapTransactions(
    address: string,
    options?: TransactionQueryParams
  ): Promise<TransactionHistory> {
    try {
      // Build query parameters
      const params: Record<string, any> = {};

      if (options?.limit) {
        params.limit = options.limit;
      }

      if (options?.chainIds && options.chainIds.length > 0) {
        // History API expects chainId as a single value or comma-separated list
        params.chainId = options.chainIds.join(',');
      }

      if (options?.fromTimestampMs) {
        params.fromTimestampMs = options.fromTimestampMs;
      }

      if (options?.toTimestampMs) {
        params.toTimestampMs = options.toTimestampMs;
      }

      // Use dedicated swaps endpoint through Next.js API route
      const response = await historyApiClient.get<TransactionHistory>(
        `/${address.toLowerCase()}/events/swaps`,
        { params }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching swap transactions:', error);
      throw error;
    }
  }

  /**
   * Searches transactions by parameters
   * @param address Wallet address
   * @param searchParams Search parameters
   * @returns Matching transactions
   */
  static async searchTransactions(
    address: string,
    searchParams: Record<string, any>
  ): Promise<TransactionHistory> {
    try {
      // Using post with search endpoint through Next.js API route
      // Note: This specific endpoint actually uses POST according to 1inch docs
      const response = await historyApiClient.post<TransactionHistory>(
        `/${address.toLowerCase()}/search/events`,
        searchParams
      );

      return response.data;
    } catch (error) {
      console.error('Error searching transactions:', error);
      throw error;
    }
  }
}
