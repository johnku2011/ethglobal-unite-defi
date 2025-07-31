import { retryRequest } from './api/axiosClient';
import type {
  CryptoPriceData,
  CryptoPriceParams,
  CryptoPriceError,
  SpotPriceApiResponse,
  COMMON_TOKEN_ADDRESSES,
  COMMON_TOKENS,
  CryptoToken,
} from '@/types/cryptoPrice';

/**
 * 加密貨幣價格服務
 * 基於1inch Spot Price API實現
 */
export class CryptoPriceService {
  /**
   * 獲取多種加密貨幣的價格數據
   * @param symbols 代幣符號數組，如 ['BTC', 'ETH', 'BNB']
   * @param chainId 區塊鏈ID，默認為1（以太坊主網）
   * @returns 代幣價格數據數組
   */
  static async getPrices(
    symbols: string[] = ['BTC', 'ETH', 'USDT'],
    chainId: string = '1'
  ): Promise<CryptoPriceData[]> {
    try {
      console.log(`🚀 CryptoPriceService: 獲取加密貨幣價格數據`, {
        symbols,
        chainId,
      });

      // 將符號轉換為地址
      const addresses = this.symbolsToAddresses(symbols);
      if (addresses.length === 0) {
        throw this.createError('INVALID_PARAMS', '未提供有效的代幣符號', false);
      }

      // 調用API
      const addressesStr = addresses.join(',');
      const response = await this.fetchPriceData(addressesStr, chainId);

      // 處理響應數據
      const processedData = this.transformPriceData(response, symbols);

      console.log(`✅ 價格數據獲取成功: ${processedData.length}個代幣`);
      return processedData;
    } catch (error) {
      console.error('❌ 加密貨幣價格數據獲取失敗', error);
      throw this.handleError(error);
    }
  }

  /**
   * 獲取單個加密貨幣的價格數據
   * @param symbol 代幣符號，如 'BTC'
   * @param chainId 區塊鏈ID，默認為1（以太坊主網）
   * @returns 代幣價格數據
   */
  static async getPrice(
    symbol: string,
    chainId: string = '1'
  ): Promise<CryptoPriceData> {
    const prices = await this.getPrices([symbol], chainId);
    if (prices.length === 0) {
      throw this.createError(
        'NOT_FOUND',
        `未找到代幣 ${symbol} 的價格數據`,
        false
      );
    }
    return prices[0];
  }

  /**
   * 調用API獲取原始價格數據
   * @param addresses 代幣地址，逗號分隔
   * @param chainId 區塊鏈ID
   * @returns 原始API響應數據
   */
  private static async fetchPriceData(
    addresses: string,
    chainId: string
  ): Promise<SpotPriceApiResponse> {
    return retryRequest(
      async () => {
        // 使用Next.js API路由代理請求
        const apiUrl = `/api/crypto-price/${addresses}?chainId=${chainId}`;

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          // 設置5秒超時
          signal: AbortSignal.timeout(5000),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API請求失敗 (${response.status}): ${errorText}`);
        }

        return await response.json();
      },
      3, // 最大重試次數
      1000 // 重試延遲（毫秒）
    );
  }

  /**
   * 將API響應數據轉換為應用數據格式
   * @param data 原始API響應數據
   * @param symbols 原始請求的符號列表（用於保持順序）
   * @returns 處理後的價格數據數組
   */
  private static transformPriceData(
    data: SpotPriceApiResponse,
    symbols: string[]
  ): CryptoPriceData[] {
    if (!data || Object.keys(data).length === 0) {
      return [];
    }

    const addressToSymbol = this.createAddressToSymbolMap(symbols);

    // 轉換數據
    const result: CryptoPriceData[] = [];

    // 按原始符號順序處理數據
    symbols.forEach((symbol) => {
      const address = this.getTokenAddressBySymbol(symbol);
      if (!address || !data[address]) return;

      const priceInfo = data[address];
      const token = this.getTokenInfo(symbol);

      result.push({
        token,
        price: parseFloat(priceInfo.usd) || 0,
        change24h: priceInfo.usd_24h_change || 0,
        lastUpdated: new Date(priceInfo.last_updated_at),
      });
    });

    return result;
  }

  /**
   * 創建地址到符號的映射
   */
  private static createAddressToSymbolMap(
    symbols: string[]
  ): Record<string, string> {
    const map: Record<string, string> = {};
    symbols.forEach((symbol) => {
      const address = this.getTokenAddressBySymbol(symbol);
      if (address) {
        map[address.toLowerCase()] = symbol;
      }
    });
    return map;
  }

  /**
   * 根據符號獲取代幣地址
   */
  private static getTokenAddressBySymbol(symbol: string): string | undefined {
    const upperSymbol = symbol.toUpperCase();
    // 從COMMON_TOKEN_ADDRESSES中獲取地址
    return (COMMON_TOKEN_ADDRESSES as any)[upperSymbol];
  }

  /**
   * 獲取代幣基本信息
   */
  private static getTokenInfo(symbol: string): CryptoToken {
    const upperSymbol = symbol.toUpperCase();

    // 從預定義代幣中獲取信息
    const token = (COMMON_TOKENS as any)[upperSymbol];

    // 如果找不到預定義的代幣信息，創建一個基本的
    if (!token) {
      const address =
        this.getTokenAddressBySymbol(upperSymbol) ||
        '0x0000000000000000000000000000000000000000';
      return {
        symbol: upperSymbol,
        name: upperSymbol,
        address,
        decimals: 18, // 假設標準ERC20小數點
        chainId: '1',
      };
    }

    return token;
  }

  /**
   * 將代幣符號數組轉換為地址數組
   */
  private static symbolsToAddresses(symbols: string[]): string[] {
    if (!symbols || symbols.length === 0) return [];

    return symbols
      .map((symbol) => this.getTokenAddressBySymbol(symbol.toUpperCase()))
      .filter((address): address is string => address !== undefined);
  }

  /**
   * 處理錯誤
   */
  private static handleError(error: any): CryptoPriceError {
    if (error.code && error.retryable !== undefined) {
      return error as CryptoPriceError;
    }

    let code = 'UNKNOWN_ERROR';
    let message = '未知錯誤';
    let retryable = false;

    if (error instanceof Error) {
      message = error.message;

      // 網絡相關錯誤通常可以重試
      if (error.name === 'AbortError') {
        code = 'TIMEOUT';
        message = '請求超時';
        retryable = true;
      } else if (
        error.message.includes('fetch') ||
        error.message.includes('network')
      ) {
        code = 'NETWORK_ERROR';
        message = '網絡連接失敗';
        retryable = true;
      }
    }

    return this.createError(code, message, retryable);
  }

  /**
   * 創建錯誤對象
   */
  private static createError(
    code: string,
    message: string,
    retryable: boolean,
    details?: any
  ): CryptoPriceError {
    const error = new Error(message) as CryptoPriceError;
    error.code = code;
    error.retryable = retryable;
    error.details = details;
    return error;
  }
}
