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
  chains: Chain[];
  positions: Protocol[];
  totalValueUsd: number;
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
 * 1inch Portfolio API 服務類
 */
export class OneInchPortfolioAPI {
  /**
   * 觸發所有鏈的Portfolio數據獲取
   * 第一階段：觸發數據獲取任務
   */
  static async triggerPortfolioFetch(address: string): Promise<void> {
    console.log(`🔄 觸發Portfolio數據獲取: ${address}`);

    await retryRequest(
      async () => {
        const response = await portfolioApiClient.post('/portfolio/fetch/all', {
          address,
        });

        if (response.status !== 200) {
          throw new Error(`觸發Portfolio獲取失敗: ${response.status}`);
        }

        return response.data;
      },
      3,
      1000
    );
  }

  /**
   * 獲取Portfolio聚合數據
   * 第二階段：輪詢獲取聚合結果
   */
  static async getPortfolioData(address: string): Promise<PortfolioResponse> {
    console.log(`📊 獲取Portfolio數據: ${address}`);

    return retryRequest(
      async () => {
        const response = await portfolioApiClient.get<PortfolioResponse>(
          `/portfolio/${address}`
        );

        return response.data;
      },
      3,
      1000
    );
  }

  /**
   * 完整的Portfolio數據獲取流程
   * 包含觸發→輪詢→驗證的完整邏輯
   */
  static async fetchCompletePortfolioData(
    address: string,
    maxRetries: number = 10,
    retryDelay: number = 2000
  ): Promise<PortfolioResponse | null> {
    try {
      console.log(`🚀 開始完整Portfolio數據獲取流程: ${address}`);

      // 第一步：觸發所有鏈的數據獲取
      await this.triggerPortfolioFetch(address);
      console.log(`✅ 已觸發Portfolio數據獲取任務`);

      // 第二步：輪詢獲取聚合數據
      let retries = 0;

      while (retries < maxRetries) {
        try {
          console.log(`🔍 輪詢嘗試 ${retries + 1}/${maxRetries}`);

          const portfolioData = await this.getPortfolioData(address);

          // 檢查所有鏈的數據是否準備就緒
          const allChainsCompleted = portfolioData.chains.every(
            (chain) => chain.status === 'completed'
          );

          if (allChainsCompleted) {
            console.log(`🎉 Portfolio數據獲取完成 (嘗試 ${retries + 1}次)`);
            return portfolioData;
          }

          // 記錄鏈狀態統計
          const statusStats = portfolioData.chains.reduce(
            (acc, chain) => {
              acc[chain.status] = (acc[chain.status] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>
          );

          console.log(`📈 鏈狀態統計:`, statusStats);
        } catch (error) {
          console.warn(`⚠️ 輪詢嘗試 ${retries + 1} 失敗:`, error);
        }

        // 等待下次重試
        await this.delay(retryDelay);
        retries++;
      }

      console.warn(
        `⏰ 達到最大重試次數 (${maxRetries})，可能部分數據未完全載入`
      );

      // 即使未完全載入，也嘗試返回現有數據
      try {
        return await this.getPortfolioData(address);
      } catch (error) {
        console.error(`❌ 最終獲取Portfolio數據失敗:`, error);
        return null;
      }
    } catch (error) {
      console.error(`❌ Portfolio數據獲取流程失敗:`, error);
      throw error;
    }
  }

  /**
   * 獲取價值歷史圖表數據
   */
  static async getValueChart(
    address: string,
    timerange: string = '1month',
    useCache: boolean = true
  ): Promise<BalanceHistoryAPIResponse> {
    console.log(`📈 獲取價值圖表數據: ${address} (${timerange})`);

    return retryRequest(
      async () => {
        const response =
          await portfolioApiClient.get<BalanceHistoryAPIResponse>(
            `/portfolio/${address}/value-chart`,
            {
              params: { timerange, useCache },
            }
          );

        return response.data;
      },
      3,
      1000
    );
  }

  /**
   * 獲取交易歷史
   */
  static async getTransactionHistory(
    address: string,
    limit: number = 100
  ): Promise<Transaction[]> {
    console.log(`📜 獲取交易歷史: ${address} (limit: ${limit})`);

    return retryRequest(
      async () => {
        const response = await portfolioApiClient.get<{ items: Transaction[] }>(
          `/portfolio/${address}/history`,
          {
            params: { limit },
          }
        );

        return response.data.items;
      },
      3,
      1000
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
