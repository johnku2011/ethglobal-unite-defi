import { retryRequest } from './api/axiosClient';
import type {
  CryptoPriceData,
  CryptoPriceParams,
  CryptoPriceError,
  SpotPriceApiResponse,
  CryptoToken,
} from '@/types/cryptoPrice';
import { COMMON_TOKEN_ADDRESSES, COMMON_TOKENS } from '@/types/cryptoPrice';

/**
 * Cryptocurrency Price Service
 * Based on 1inch Spot Price API implementation
 */
export class CryptoPriceService {
  /**
   * Get price data for multiple cryptocurrencies
   * @param symbols Token symbol array, e.g. ['BTC', 'ETH', 'BNB']
   * @param chainId Blockchain ID, default is 1 (Ethereum mainnet)
   * @returns Array of token price data
   */
  static async getPrices(
    symbols: string[] = ['BTC', 'ETH', 'USDT'],
    chainId: string = '1'
  ): Promise<CryptoPriceData[]> {
    try {
      console.log(`🚀 CryptoPriceService: Fetching cryptocurrency price data`, {
        symbols,
        chainId,
      });

      // Convert symbols to addresses
      const addresses = this.symbolsToAddresses(symbols);
      if (addresses.length === 0) {
        throw this.createError(
          'INVALID_PARAMS',
          'No valid token symbols provided',
          false
        );
      }

      // Call API
      const addressesStr = addresses.join(',');
      const response = await this.fetchPriceData(addressesStr, chainId);

      // Process response data
      const processedData = this.transformPriceData(response, symbols);

      console.log(
        `✅ Price data fetched successfully: ${processedData.length} tokens`
      );
      return processedData;
    } catch (error) {
      console.error('❌ Failed to fetch cryptocurrency price data', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get price data for a single cryptocurrency
   * @param symbol Token symbol, e.g. 'BTC'
   * @param chainId Blockchain ID, default is 1 (Ethereum mainnet)
   * @returns Token price data
   */
  static async getPrice(
    symbol: string,
    chainId: string = '1'
  ): Promise<CryptoPriceData> {
    const prices = await this.getPrices([symbol], chainId);
    if (prices.length === 0) {
      throw this.createError(
        'NOT_FOUND',
        `Price data not found for token ${symbol}`,
        false
      );
    }
    return prices[0];
  }

  /**
   * Call API to fetch raw price data
   * @param addresses Token addresses, comma-separated
   * @param chainId Blockchain ID
   * @returns Raw API response data
   */
  private static async fetchPriceData(
    addresses: string,
    chainId: string
  ): Promise<SpotPriceApiResponse> {
    return retryRequest(
      async () => {
        // Use Next.js API route proxy request
        const apiUrl = `/api/crypto-price/${addresses}?chainId=${chainId}`;

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          // Set 5 second timeout
          signal: AbortSignal.timeout(5000),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `API request failed (${response.status}): ${errorText}`
          );
        }

        return await response.json();
      },
      3, // Maximum retry count
      1000 // Retry delay (milliseconds)
    );
  }

  /**
   * Transform API response data to application data format
   * @param data Raw API response data
   * @param symbols Original request symbol list (to maintain order)
   * @returns Processed price data array
   */
  private static transformPriceData(
    data: SpotPriceApiResponse,
    symbols: string[]
  ): CryptoPriceData[] {
    if (!data || Object.keys(data).length === 0) {
      return [];
    }

    const addressToSymbol = this.createAddressToSymbolMap(symbols);

    // Convert data
    const result: CryptoPriceData[] = [];

    // Process data in original symbol order
    symbols.forEach((symbol) => {
      const address = this.getTokenAddressBySymbol(symbol);
      if (!address || !data[address]) return;

      const priceValue = data[address];
      const token = this.getTokenInfo(symbol);

      // Handle both simple string price and complex object formats
      let price = 0;
      let change24h = 0;
      let lastUpdated = new Date();

      if (typeof priceValue === 'string' || typeof priceValue === 'number') {
        // Simple format: {"address": "price_value"}
        price = parseFloat(String(priceValue)) || 0;
      } else if (typeof priceValue === 'object' && priceValue !== null) {
        // Complex format: {"address": {"usd": "price", "usd_24h_change": 2.5}}
        price = parseFloat(priceValue.usd || priceValue.price || '0') || 0;
        change24h = priceValue.usd_24h_change || priceValue.change24h || 0;
        lastUpdated = priceValue.last_updated_at
          ? new Date(priceValue.last_updated_at)
          : new Date();
      }

      result.push({
        token,
        price,
        change24h,
        lastUpdated,
      });
    });

    return result;
  }

  /**
   * Create address to symbol mapping
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
   * Get token address by symbol
   */
  private static getTokenAddressBySymbol(symbol: string): string | undefined {
    const upperSymbol = symbol.toUpperCase();
    // Get address from COMMON_TOKEN_ADDRESSES
    return (COMMON_TOKEN_ADDRESSES as any)[upperSymbol];
  }

  /**
   * Get token basic information
   */
  private static getTokenInfo(symbol: string): CryptoToken {
    const upperSymbol = symbol.toUpperCase();

    // Get information from predefined tokens
    const token = (COMMON_TOKENS as any)[upperSymbol];

    // If predefined token information is not found, create a basic one
    if (!token) {
      const address =
        this.getTokenAddressBySymbol(upperSymbol) ||
        '0x0000000000000000000000000000000000000000';
      return {
        symbol: upperSymbol,
        name: upperSymbol,
        address,
        decimals: 18, // Assume standard ERC20 decimals
        chainId: '1',
      };
    }

    return token;
  }

  /**
   * Convert token symbol array to address array
   */
  private static symbolsToAddresses(symbols: string[]): string[] {
    if (!symbols || symbols.length === 0) return [];

    return symbols
      .map((symbol) => this.getTokenAddressBySymbol(symbol.toUpperCase()))
      .filter((address): address is string => address !== undefined);
  }

  /**
   * Handle errors
   */
  private static handleError(error: any): CryptoPriceError {
    if (error.code && error.retryable !== undefined) {
      return error as CryptoPriceError;
    }

    let code = 'UNKNOWN_ERROR';
    let message = 'Unknown error';
    let retryable = false;

    if (error instanceof Error) {
      message = error.message;

      // Network-related errors are usually retryable
      if (error.name === 'AbortError') {
        code = 'TIMEOUT';
        message = 'Request timeout';
        retryable = true;
      } else if (
        error.message.includes('fetch') ||
        error.message.includes('network')
      ) {
        code = 'NETWORK_ERROR';
        message = 'Network connection failed';
        retryable = true;
      }
    }

    return this.createError(code, message, retryable);
  }

  /**
   * Create error object
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
