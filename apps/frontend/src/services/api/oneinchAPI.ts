import { portfolioApiClient, retryRequest } from './axiosClient';

/**
 * 1inch Portfolio API 封裝
 * 基於業界最佳實踐和參考文檔實現
 */

/**
 * 1inch Portfolio API 響應類型定義
 */
export interface Chain {
  id: number;
  name: string;
  status: 'completed' | 'in_progress' | 'failed';
  data: {
    result: Protocol[];
  };
}

export interface Protocol {
  chain_id: number;
  contract_address: string;
  protocol: string;
  name: string;
  value_usd: number;
  underlying_tokens: UnderlyingToken[];
  profit_abs_usd: number | null;
  roi: number | null;
}

export interface UnderlyingToken {
  chain_id: number;
  address: string;
  name: string;
  symbol: string;
  amount: number;
  price_to_usd: number;
  value_usd: number;
}

export interface PortfolioResponse {
  result: {
    total: number;
    by_chain: any[];
    by_category: any;
    [key: string]: any;
  };
}

export interface BalanceHistoryAPIResponse {
  message: string;
  address: string;
  timerange: string;
  useCache: boolean;
  result: { [chainId: string]: HistoryPoint[] };
}

export interface HistoryPoint {
  timestamp: number;
  value_usd: number;
}

export interface Transaction {
  timeMs: number;
  address: string;
  type: number;
  rating: string;
  direction: 'in' | 'out';
  details: {
    txHash: string;
    chainId: number;
    blockNumber: number;
    tokenActions: TokenAction[];
  };
}

export interface TokenAction {
  chainId: string;
  address: string;
  standard: string;
  amount: string;
  direction: string;
  priceToUsd?: number;
}

/**
 * Portfolio Position (實際API返回的資產持倉數據結構)
 */
export interface PortfolioPosition {
  index: string;
  chain: number;
  contract_address: string;
  token_id: number;
  address: string;
  block_number_created: number;
  block_number: number | null;
  timestamp: number | null;
  protocol_type: string;
  protocol_handler_id: string;
  protocol_group_id: string;
  protocol_group_name: string;
  protocol_group_icon: string;
  protocol_sub_group_id: string | null;
  protocol_sub_group_name: string | null;
  contract_name: string;
  contract_symbol: string;
  asset_sign: number;
  status: number;
  underlying_tokens: UnderlyingPositionToken[];
  reward_tokens: any[];
  value_usd: number;
  locked: boolean;
}

export interface UnderlyingPositionToken {
  chain_id: number;
  address: string;
  decimals: number;
  symbol: string;
  name: string;
  amount: number;
  price_usd: number;
  value_usd: number;
}

export interface PortfolioHistoryResponse {
  result: PortfolioPosition[];
}

/**
 * 1inch Portfolio API 服務類
 */
export class OneInchPortfolioAPI {
  /**
   * 觸發Portfolio數據獲取 (1inch API v4不需要觸發步驟)
   * 注意：真正的1inch API是直接獲取數據的，不需要預先觸發
   */
  static async triggerPortfolioFetch(address: string): Promise<void> {
    console.log(`📝 注意: 1inch Portfolio API v4 不需要觸發步驟，直接獲取數據`);
    // 1inch API v4 不需要觸發步驟，這個方法保留是為了兼容性
    return Promise.resolve();
  }

  /**
   * 獲取Portfolio聚合數據 (使用1inch Portfolio API v4)
   * 直接從1inch API獲取投資組合數據
   */
  static async getPortfolioData(address: string): Promise<PortfolioResponse> {
    console.log(`📊 從1inch API v4獲取Portfolio數據: ${address}`);

    if (!this.isValidEthereumAddress(address)) {
      throw new Error(`無效的以太坊地址: ${address}`);
    }

    return retryRequest(
      async () => {
        // 使用真正的1inch Portfolio API v4端點
        const response = await portfolioApiClient.get<PortfolioResponse>(
          `/portfolio/${address}`,
          {
            headers: {
              Accept: 'application/json',
              ...(process.env.NEXT_PUBLIC_1INCH_API_KEY && {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_1INCH_API_KEY}`,
              }),
            },
          }
        );

        if (!response.data) {
          throw new Error('API響應數據為空');
        }

        return response.data;
      },
      3,
      2000
    );
  }

  /**
   * 完整的Portfolio數據獲取流程 (1inch API v4簡化版)
   * 直接獲取Portfolio數據，無需觸發-輪詢機制
   */
  static async fetchCompletePortfolioData(
    address: string,
    maxRetries: number = 3,
    retryDelay: number = 2000
  ): Promise<PortfolioResponse | null> {
    try {
      console.log(`🚀 使用1inch API v4獲取Portfolio數據: ${address}`);

      // 1inch API v4直接獲取數據，無需觸發步驟
      const portfolioData = await this.getPortfolioData(address);

      console.log(`🎉 Portfolio數據獲取成功`);
      console.log(`📊 獲取到 ${(portfolioData as any).chains?.length || 0} 條鏈數據`);
              console.log(
          `💰 總價值: $${(portfolioData as any).totalValueUsd?.toLocaleString() || '0'}`
        );

      return portfolioData;
    } catch (error) {
      console.error(`❌ Portfolio數據獲取流程失敗:`, error);

      // 對於1inch API，直接拋出錯誤，讓調用方處理
      throw error;
    }
  }

  /**
   * 獲取價值歷史圖表數據 (使用1inch Portfolio API v4)
   */
  static async getValueChart(
    address: string,
    timerange: string = '1month',
    useCache: boolean = true
  ): Promise<BalanceHistoryAPIResponse> {
    console.log(`📈 從1inch API v4獲取價值圖表數據: ${address} (${timerange})`);

    if (!this.isValidEthereumAddress(address)) {
      throw new Error(`無效的以太坊地址: ${address}`);
    }

    // 驗證時間範圍參數
    const validTimeRanges = ['1day', '1week', '1month', '1year', '3years'];
    if (!validTimeRanges.includes(timerange)) {
      console.warn(`⚠️ 無效的時間範圍參數: ${timerange}，使用默認值 1month`);
      timerange = '1month';
    }

    return retryRequest(
      async () => {
        const response =
          await portfolioApiClient.get<BalanceHistoryAPIResponse>(
            `/portfolio/${address}/value-chart`,
            {
              params: { timerange, useCache },
              headers: {
                Accept: 'application/json',
                ...(process.env.NEXT_PUBLIC_1INCH_API_KEY && {
                  Authorization: `Bearer ${process.env.NEXT_PUBLIC_1INCH_API_KEY}`,
                }),
              },
            }
          );

        return response.data;
      },
      3,
      2000
    );
  }

  /**
   * 獲取交易歷史 (使用1inch Portfolio API v4)
   */
  static async getTransactionHistory(
    address: string,
    limit: number = 100
  ): Promise<Transaction[]> {
    console.log(`📜 從1inch API v4獲取交易歷史: ${address} (limit: ${limit})`);

    if (!this.isValidEthereumAddress(address)) {
      throw new Error(`無效的以太坊地址: ${address}`);
    }

    return retryRequest(
      async () => {
        const response = await portfolioApiClient.get<{ items: Transaction[] }>(
          `/portfolio/${address}/history`,
          {
            params: { limit },
            headers: {
              Accept: 'application/json',
              ...(process.env.NEXT_PUBLIC_1INCH_API_KEY && {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_1INCH_API_KEY}`,
              }),
            },
          }
        );

        return response.data.items;
      },
      3,
      2000
    );
  }

  /**
   * 獲取資產持倉歷史 (實際API返回結構)
   */
  static async getPortfolioHistory(
    address: string,
    limit: number = 5
  ): Promise<PortfolioPosition[]> {
    console.log(`📊 獲取資產持倉數據: ${address} (limit: ${limit})`);

    if (!this.isValidEthereumAddress(address)) {
      throw new Error(`無效的以太坊地址: ${address}`);
    }

    return retryRequest(
      async () => {
        const response = await portfolioApiClient.get<PortfolioHistoryResponse>(
          `/portfolio/${address}/history`,
          {
            params: { limit },
            headers: {
              Accept: 'application/json',
              ...(process.env.NEXT_PUBLIC_1INCH_API_KEY && {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_1INCH_API_KEY}`,
              }),
            },
          }
        );

        return response.data.result || [];
      },
      3,
      2000
    );
  }

  /**
   * 獲取單個鏈的Portfolio數據
   */
  static async getChainPortfolio(
    address: string,
    chainId: number
  ): Promise<Protocol[]> {
    console.log(`🔗 獲取單鏈Portfolio數據: ${address} (Chain: ${chainId})`);

    return retryRequest(
      async () => {
        const response = await portfolioApiClient.get<{ result: Protocol[] }>(
          `/portfolio/${address}/chain/${chainId}`
        );

        return response.data.result;
      },
      3,
      1000
    );
  }

  /**
   * 刷新Portfolio數據緩存
   */
  static async refreshPortfolioCache(address: string): Promise<void> {
    console.log(`🔄 刷新Portfolio緩存: ${address}`);

    await retryRequest(
      async () => {
        const response = await portfolioApiClient.post(
          `/portfolio/${address}/refresh`
        );

        if (response.status !== 200) {
          throw new Error(`刷新緩存失敗: ${response.status}`);
        }

        return response.data;
      },
      2,
      1000
    );
  }

  /**
   * 獲取支持的鏈列表
   */
  static async getSupportedChains(): Promise<
    Array<{ id: number; name: string }>
  > {
    console.log(`🔗 獲取支持的鏈列表`);

    return retryRequest(
      async () => {
        const response = await portfolioApiClient.get<{
          chains: Array<{ id: number; name: string }>;
        }>('/portfolio/chains');

        return response.data.chains;
      },
      3,
      1000
    );
  }

  /**
   * 健康檢查 - 檢查API服務狀態
   */
  static async healthCheck(): Promise<{ status: string; timestamp: number }> {
    console.log(`🏥 執行API健康檢查`);

    return retryRequest(
      async () => {
        const response = await portfolioApiClient.get<{
          status: string;
          timestamp: number;
        }>('/health');

        return response.data;
      },
      2,
      500
    );
  }

  /**
   * 工具函數：延遲
   */
  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 工具函數：隨機延遲（避免API限制）
   */
  static async randomDelay(
    minSeconds: number,
    maxSeconds: number
  ): Promise<void> {
    const delay = Math.random() * (maxSeconds - minSeconds) + minSeconds;
    console.log(`⏳ 隨機延遲 ${delay.toFixed(1)}秒`);
    return new Promise((resolve) => setTimeout(resolve, delay * 1000));
  }

  /**
   * 工具函數：格式化地址（用於日誌）
   */
  static formatAddress(address: string): string {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  /**
   * 工具函數：驗證以太坊地址格式
   */
  static isValidEthereumAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }
}

/**
 * 便捷導出 - 使用更短的別名
 */
export const PortfolioAPI = OneInchPortfolioAPI;

export default OneInchPortfolioAPI;
