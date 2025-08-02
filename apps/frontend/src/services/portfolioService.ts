import moment from 'moment';
import { OneInchPortfolioAPI } from './api/oneinchAPI';
import type {
  OneInchPortfolioResponse,
  OneInchBalanceHistoryResponse,
  OneInchTransaction,
  ProcessedPortfolioData,
  ProcessedChartData,
  ProcessedTransaction,
  PortfolioStats,
  PortfolioAPIError,
  PortfolioFetchParams,
  ValueChartParams,
  TransactionHistoryParams,
  ProcessedChainData,
  ProcessedProtocolData,
  ProcessedTokenData,
  ChartDataPoint,
} from '@/types/portfolio';

/**
 * Portfolio 業務邏輯服務層
 * 提供高級的業務功能和數據轉換
 */
export class PortfolioService {
  /**
   * 獲取並處理Portfolio數據
   */
  static async getPortfolioData(
    params: PortfolioFetchParams
  ): Promise<ProcessedPortfolioData> {
    try {
      console.log(`🚀 PortfolioService: 獲取Portfolio數據`, params);

      // 調用底層API
      const rawData = await OneInchPortfolioAPI.fetchCompletePortfolioData(
        params.address,
        params.maxRetries,
        params.retryDelay
      );

      if (!rawData) {
        throw this.createError('API_ERROR', 'Portfolio數據獲取失敗', true);
      }

      // 轉換數據格式
      const processedData = this.transformPortfolioData(
        rawData as any,
        params.address
      );

      console.log(`✅ PortfolioService: Portfolio數據處理完成`, {
        totalValue: processedData.totalValue,
        chainCount: processedData.chains.length,
        protocolCount: processedData.protocols.length,
      });

      return processedData;
    } catch (error) {
      console.error('❌ PortfolioService: Portfolio數據獲取失敗', error);
      throw this.handleError(error);
    }
  }

  /**
   * 獲取並處理價值圖表數據
   */
  static async getValueChartData(
    params: ValueChartParams
  ): Promise<ProcessedChartData> {
    try {
      console.log(`📈 PortfolioService: 獲取價值圖表數據`, params);

      const rawData = await OneInchPortfolioAPI.getValueChart(
        params.address,
        params.timerange,
        params.useCache
      );

      const processedData = this.transformChartData(rawData);

      console.log(`✅ PortfolioService: 圖表數據處理完成`, {
        dataPoints: processedData.data.length,
        currentValue: processedData.summary.currentValue,
        change: processedData.summary.changePercentage,
      });

      return processedData;
    } catch (error) {
      console.error('❌ PortfolioService: 圖表數據獲取失敗', error);
      throw this.handleError(error);
    }
  }

  /**
   * 獲取並處理交易歷史數據
   */
  static async getTransactionHistory(
    params: TransactionHistoryParams
  ): Promise<ProcessedTransaction[]> {
    try {
      console.log(`📜 PortfolioService: 獲取交易歷史`, params);

      const rawData = await OneInchPortfolioAPI.getTransactionHistory(
        params.address,
        params.limit
      );

      const processedData = rawData.map((tx) => this.transformTransaction(tx));

      console.log(`✅ PortfolioService: 交易歷史處理完成`, {
        transactionCount: processedData.length,
      });

      return processedData;
    } catch (error) {
      console.error('❌ PortfolioService: 交易歷史獲取失敗', error);
      throw this.handleError(error);
    }
  }

  /**
   * 計算Portfolio統計信息
   */
  static calculatePortfolioStats(data: ProcessedPortfolioData): PortfolioStats {
    const chains = data.chains.filter((chain) => chain.status === 'completed');
    const topChain = chains.reduce((prev, current) =>
      prev.totalValue > current.totalValue ? prev : current
    );

    const topProtocol = data.protocols.reduce((prev, current) =>
      prev.value > current.value ? prev : current
    );

    const tokenCount = data.protocols.reduce(
      (sum, protocol) => sum + protocol.tokens.length,
      0
    );

    return {
      totalValue: data.totalValue,
      change24h: data.totalChange24h,
      changePercentage24h: data.totalChangePercentage24h,
      chainCount: chains.length,
      protocolCount: data.protocols.length,
      tokenCount,
      topChain: {
        name: topChain.chainName,
        value: topChain.totalValue,
        percentage: topChain.percentage,
      },
      topProtocol: {
        name: topProtocol.name,
        value: topProtocol.value,
        percentage: (topProtocol.value / data.totalValue) * 100,
      },
      lastUpdated: data.lastUpdated,
    };
  }

  /**
   * 數據轉換：OneInch API響應 → 處理後的Portfolio數據
   */
  private static transformPortfolioData(
    rawData: OneInchPortfolioResponse,
    address: string
  ): ProcessedPortfolioData {
    const chains = rawData.chains.map((chain) =>
      this.transformChainData(chain, rawData.totalValueUsd)
    );
    const protocols = rawData.positions.map((protocol) =>
      this.transformProtocolData(protocol)
    );

    // 計算24小時變化（這裡是模擬數據，實際需要歷史數據）
    const totalChange24h = this.calculateChange24h(rawData.totalValueUsd);
    const totalChangePercentage24h =
      rawData.totalValueUsd > 0
        ? (totalChange24h / rawData.totalValueUsd) * 100
        : 0;

    return {
      totalValue: rawData.totalValueUsd,
      totalChange24h,
      totalChangePercentage24h,
      chains,
      protocols,
      lastUpdated: new Date(),
      address,
    };
  }

  /**
   * 轉換鏈數據
   */
  private static transformChainData(
    chain: any,
    totalValue: number
  ): ProcessedChainData {
    const chainValue = chain.data.result.reduce(
      (sum: number, protocol: any) => sum + protocol.value_usd,
      0
    );

    return {
      chainId: chain.id,
      chainName: this.getChainName(chain.id),
      totalValue: chainValue,
      totalChange24h: this.calculateChange24h(chainValue),
      percentage: totalValue > 0 ? (chainValue / totalValue) * 100 : 0,
      protocolCount: chain.data.result.length,
      status: chain.status,
      protocols: chain.data.result.map((protocol: any) =>
        this.transformProtocolData(protocol)
      ),
    };
  }

  /**
   * 轉換協議數據
   */
  private static transformProtocolData(protocol: any): ProcessedProtocolData {
    return {
      name: protocol.name,
      protocol: protocol.protocol,
      contractAddress: protocol.contract_address,
      chainId: protocol.chain_id,
      value: protocol.value_usd,
      tokens: protocol.underlying_tokens.map((token: any) =>
        this.transformTokenData(token)
      ),
      profitLoss:
        protocol.profit_abs_usd !== null && protocol.roi !== null
          ? {
              absolute: protocol.profit_abs_usd,
              percentage: protocol.roi * 100,
            }
          : undefined,
    };
  }

  /**
   * 轉換代幣數據
   */
  private static transformTokenData(token: any): ProcessedTokenData {
    return {
      address: token.address,
      name: token.name,
      symbol: token.symbol,
      amount: token.amount,
      value: token.value_usd,
      price: token.price_to_usd,
      chainId: token.chain_id,
    };
  }

  /**
   * 轉換圖表數據
   */
  private static transformChartData(
    rawData: OneInchBalanceHistoryResponse
  ): ProcessedChartData {
    // 合併所有鏈的數據點
    const allTimestamps = new Set<number>();
    Object.values(rawData.result).forEach((chainData) => {
      chainData.forEach((point) => allTimestamps.add(point.timestamp));
    });

    const sortedTimestamps = Array.from(allTimestamps).sort((a, b) => a - b);

    const chartData: ChartDataPoint[] = sortedTimestamps.map((timestamp) => {
      let totalValue = 0;
      const chains: { [chainId: string]: number } = {};

      Object.entries(rawData.result).forEach(([chainId, chainData]) => {
        const point = chainData.find((p) => p.timestamp === timestamp);
        const value = point?.value_usd || 0;
        chains[chainId] = value;
        totalValue += value;
      });

      return {
        timestamp,
        date: moment(timestamp * 1000).format('YYYY-MM-DD HH:mm:ss'),
        totalValue,
        chains,
      };
    });

    // 計算摘要統計
    const values = chartData.map((d) => d.totalValue);
    const startValue = values[0] || 0;
    const currentValue = values[values.length - 1] || 0;
    const change = currentValue - startValue;
    const changePercentage = startValue > 0 ? (change / startValue) * 100 : 0;

    return {
      timerange: rawData.timerange,
      address: rawData.address,
      data: chartData,
      summary: {
        currentValue,
        startValue,
        change,
        changePercentage,
        highestValue: Math.max(...values),
        lowestValue: Math.min(...values),
      },
    };
  }

  /**
   * 轉換交易數據
   */
  private static transformTransaction(
    tx: OneInchTransaction
  ): ProcessedTransaction {
    return {
      id: `${tx.details.txHash}_${tx.timeMs}`,
      hash: tx.details.txHash,
      timestamp: new Date(tx.timeMs),
      type: this.determineTransactionType(tx),
      direction: tx.direction,
      chainId: tx.details.chainId,
      chainName: this.getChainName(tx.details.chainId),
      value: this.calculateTransactionValue(tx.details.tokenActions),
      tokens: tx.details.tokenActions.map((action) => ({
        symbol: this.getTokenSymbol(action.address),
        amount: action.amount,
        value: parseFloat(action.amount) * (action.priceToUsd || 0),
        direction: action.direction as 'in' | 'out',
      })),
      rating: tx.rating,
      status: 'confirmed' as const,
    };
  }

  /**
   * 工具方法：獲取鏈名稱
   */
  private static getChainName(chainId: number): string {
    const chainNames: { [key: number]: string } = {
      1: 'Ethereum',
      56: 'BNB Chain',
      137: 'Polygon',
      42161: 'Arbitrum',
      10: 'Optimism',
      43114: 'Avalanche',
      8453: 'Base',
      324: 'zkSync Era',
      59144: 'Linea',
      100: 'Gnosis',
    };
    return chainNames[chainId] || `Chain ${chainId}`;
  }

  /**
   * 工具方法：計算24小時變化（模擬）
   */
  private static calculateChange24h(currentValue: number): number {
    // 這裡是模擬數據，實際應該從歷史數據計算
    // 可以在後續版本中實現真實的24小時變化計算
    return currentValue * (Math.random() * 0.1 - 0.05); // -5% 到 +5% 的隨機變化
  }

  /**
   * 工具方法：確定交易類型
   */
  private static determineTransactionType(
    tx: OneInchTransaction
  ): ProcessedTransaction['type'] {
    const hasMultipleTokens = tx.details.tokenActions.length > 1;
    const hasInAndOut =
      tx.details.tokenActions.some((a) => a.direction === 'in') &&
      tx.details.tokenActions.some((a) => a.direction === 'out');

    if (hasInAndOut && hasMultipleTokens) return 'swap';
    if (tx.direction === 'in') return 'receive';
    if (tx.direction === 'out') return 'send';

    return 'other';
  }

  /**
   * 工具方法：計算交易價值
   */
  private static calculateTransactionValue(tokenActions: any[]): number {
    return tokenActions.reduce((sum, action) => {
      const value = parseFloat(action.amount) * (action.priceToUsd || 0);
      return sum + Math.abs(value);
    }, 0);
  }

  /**
   * 工具方法：獲取代幣符號
   */
  private static getTokenSymbol(address: string): string {
    // 這裡可以維護一個常用代幣地址到符號的映射
    // 或者從API獲取代幣信息
    const commonTokens: { [address: string]: string } = {
      '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': 'WETH',
      '0xa0b86a33e6b495b89e9f7e23fe50dc4b8e22e0bc': 'USDC',
      '0xdac17f958d2e523a2206206994597c13d831ec7': 'USDT',
      // 可以添加更多常用代幣
    };

    return commonTokens[address.toLowerCase()] || address.slice(0, 8);
  }

  /**
   * 錯誤處理
   */
  private static handleError(error: any): PortfolioAPIError {
    if (error.code && error.message) {
      // 已經是格式化的錯誤
      return error;
    }

    return this.createError('UNKNOWN_ERROR', error.message || '未知錯誤', true);
  }

  /**
   * 創建錯誤對象
   */
  private static createError(
    code: PortfolioAPIError['code'],
    message: string,
    retryable: boolean
  ): PortfolioAPIError {
    return {
      code,
      message,
      retryable,
      timestamp: new Date(),
    };
  }

  /**
   * 驗證地址格式
   */
  static validateAddress(address: string): boolean {
    return OneInchPortfolioAPI.isValidEthereumAddress(address);
  }

  /**
   * 格式化地址顯示
   */
  static formatAddress(address: string): string {
    return OneInchPortfolioAPI.formatAddress(address);
  }

  /**
   * 刷新Portfolio緩存
   */
  static async refreshCache(address: string): Promise<void> {
    try {
      console.log(`🔄 PortfolioService: 刷新緩存`, {
        address: this.formatAddress(address),
      });

      await OneInchPortfolioAPI.refreshPortfolioCache(address);

      console.log(`✅ PortfolioService: 緩存刷新完成`);
    } catch (error) {
      console.error('❌ PortfolioService: 緩存刷新失敗', error);
      throw this.handleError(error);
    }
  }

  /**
   * 健康檢查
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const result = await OneInchPortfolioAPI.healthCheck();
      return result.status === 'ok';
    } catch (error) {
      console.error('❌ PortfolioService: 健康檢查失敗', error);
      return false;
    }
  }
}

export default PortfolioService;
