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
   * 將1inch History API的數據轉換為應用需要的格式
   * @param rawData 1inch History API返回的原始數據
   * @param walletAddress 錢包地址
   * @returns 轉換後的交易歷史數據
   */
  static formatTransactionData(
    rawData: any,
    walletAddress: string
  ): TransactionHistory {
    // 如果原始數據已符合預期結構，直接返回
    if (
      rawData?.items &&
      Array.isArray(rawData.items) &&
      'timeMs' in (rawData.items[0] || {})
    ) {
      console.log('✅ 數據結構已匹配，無需轉換');
      return rawData as TransactionHistory;
    }

    console.log('⚙️ 開始轉換數據結構');

    // 預設值
    const result: TransactionHistory = {
      items: [],
      total: 0,
    };

    try {
      // 檢查API返回的不同可能的數據格式
      if (rawData?.result && Array.isArray(rawData.result)) {
        // 情況1: API返回的是 { result: [...交易列表] } 格式
        const transactions = rawData.result;
        result.total = transactions.length;
        result.items = transactions.map((tx: any, index: number) =>
          this.formatTransaction(tx, walletAddress, index)
        );
      } else if (rawData?.items && Array.isArray(rawData.items)) {
        // 情況2: API返回的是 { items: [...交易列表] } 格式，但缺少必要的字段
        const transactions = rawData.items;
        result.total = rawData.total || transactions.length;
        result.items = transactions.map((tx: any, index: number) =>
          this.formatTransaction(tx, walletAddress, index)
        );
      } else if (Array.isArray(rawData)) {
        // 情況3: API直接返回交易陣列
        const transactions = rawData;
        result.total = transactions.length;
        result.items = transactions.map((tx: any, index: number) =>
          this.formatTransaction(tx, walletAddress, index)
        );
      } else {
        console.error('❌ 無法識別的API數據格式:', rawData);
        return {
          items: [],
          total: 0,
        };
      }

      console.log(`✅ 數據轉換完成: ${result.items.length} 筆交易`);
      return result;
    } catch (error) {
      console.error('❌ 數據轉換錯誤:', error);
      return {
        items: [],
        total: 0,
      };
    }
  }

  /**
   * 格式化單個交易數據
   * @param tx 原始交易數據
   * @param walletAddress 錢包地址
   * @param index 交易索引(用於生成ID)
   * @returns 格式化後的交易數據
   */
  static formatTransaction(
    tx: any,
    walletAddress: string,
    index: number
  ): Transaction {
    try {
      // 獲取時間戳 (優先使用已有的timeMs，或從blockTimeSec轉換，或使用當前時間)
      let timeMs =
        tx.timeMs || (tx.blockTimeSec ? tx.blockTimeSec * 1000 : Date.now());
      if (tx.details?.blockTimeSec) {
        timeMs = tx.details.blockTimeSec * 1000;
      } else if (tx.blockTimeSec) {
        timeMs = tx.blockTimeSec * 1000;
      }

      // 如果時間戳格式不正確(非數字或太小)，假設它是秒級時間戳，轉換為毫秒級
      if (typeof timeMs !== 'number' || timeMs < 1000000000000) {
        // 2001年的毫秒時間戳約為1000000000000
        timeMs =
          (typeof timeMs === 'number' ? timeMs : parseInt(timeMs)) * 1000;
      }

      // 提取或構建交易詳情
      const details: TransactionDetails = tx.details || {
        txHash: tx.txHash || tx.hash || `unknown-${Date.now()}-${index}`,
        chainId: tx.chainId || tx.chain_id || tx.chain || 1,
        blockNumber: tx.blockNumber || tx.block_number || 0,
        blockTimeSec: Math.floor(timeMs / 1000),
        status: tx.status || 'success',
        type: tx.type || tx.transaction_type || 'unknown',
        tokenActions: tx.tokenActions || tx.token_actions || [],
        fromAddress:
          tx.fromAddress || tx.from_address || tx.from || walletAddress,
        toAddress: tx.toAddress || tx.to_address || tx.to || '',
        nonce: tx.nonce || 0,
        orderInBlock: tx.orderInBlock || tx.order_in_block || 0,
        feeInSmallestNative: tx.feeInSmallestNative || tx.fee || '0',
        nativeTokenPriceToUsd: tx.nativeTokenPriceToUsd || null,
      };

      // 如果tokenActions不存在或不是陣列，初始化為空陣列
      if (!details.tokenActions || !Array.isArray(details.tokenActions)) {
        details.tokenActions = [];
      }

      // 構建標準化的交易對象
      return {
        timeMs,
        address: walletAddress,
        type: typeof tx.type === 'number' ? tx.type : 0,
        rating: tx.rating || 'normal',
        direction: tx.direction || 'out',
        details,
        id: tx.id || `tx-${details.txHash}-${index}`,
        eventOrderInTransaction: tx.eventOrderInTransaction || 0,
      };
    } catch (error) {
      console.error('❌ 格式化交易數據錯誤:', error);

      // 返回一個最小化的交易對象以避免渲染錯誤
      return {
        timeMs: Date.now(),
        address: walletAddress,
        type: 0,
        rating: 'unknown',
        direction: 'out',
        details: {
          txHash: `error-${Date.now()}-${index}`,
          chainId: 1,
          blockNumber: 0,
          blockTimeSec: Math.floor(Date.now() / 1000),
          status: 'failed',
          type: 'unknown',
          tokenActions: [],
          fromAddress: walletAddress,
          toAddress: '',
          nonce: 0,
          orderInBlock: 0,
          feeInSmallestNative: '0',
          nativeTokenPriceToUsd: null,
        },
        id: `error-${Date.now()}-${index}`,
        eventOrderInTransaction: 0,
      };
    }
  }
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

      // 詳細檢查API返回的原始數據結構
      console.log('📊 原始數據結構:', JSON.stringify(response.data));

      // 數據結構轉換
      const rawData = response.data;
      const formattedData = this.formatTransactionData(rawData, address);

      // 比較轉換前後的數據結構
      console.log('🔄 轉換後的數據結構:', JSON.stringify(formattedData));

      return formattedData;
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
      const response = await historyApiClient.get<any>(
        `/transaction/${chainId}/${txHash}`
      );

      // 檢查API返回的數據結構
      console.log('📊 Transaction details API response:', response.data);

      // 如果API返回的數據結構與期望的Transaction不匹配，進行轉換
      const rawData = response.data;
      if (!rawData || typeof rawData !== 'object') {
        return null;
      }

      // 使用相同的轉換邏輯處理單個交易
      const formattedTx = this.formatTransaction(rawData, '', 0);
      return formattedTx;
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
      const response = await historyApiClient.get<any>(
        `/${address.toLowerCase()}/events/swaps`,
        { params }
      );

      // 使用相同的數據轉換邏輯
      const formattedData = this.formatTransactionData(response.data, address);
      return formattedData;
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
      const response = await historyApiClient.post<any>(
        `/${address.toLowerCase()}/search/events`,
        searchParams
      );

      // 使用相同的數據轉換邏輯
      const formattedData = this.formatTransactionData(response.data, address);
      return formattedData;
    } catch (error) {
      console.error('Error searching transactions:', error);
      throw error;
    }
  }
}
