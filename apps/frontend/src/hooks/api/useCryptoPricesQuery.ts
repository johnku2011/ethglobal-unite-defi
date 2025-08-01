import { useQuery } from '@tanstack/react-query';
import { CryptoPriceService } from '@/services/cryptoPriceService';
import type { CryptoPriceData } from '@/types/cryptoPrice';

/**
 * 使用加密貨幣價格數據的Hook
 *
 * 使用TanStack Query來管理價格數據的獲取、緩存和重新獲取
 *
 * @param symbols 要獲取的加密貨幣符號列表，默認為熱門加密貨幣
 * @param refetchInterval 自動刷新間隔（毫秒），默認為30秒
 * @param chainId 區塊鏈ID，默認為以太坊主網(1)
 * @param enabled 是否啟用查詢，默認為true
 * @returns TanStack Query結果對象，包含價格數據和查詢狀態
 */
export function useCryptoPrices(
  symbols: string[] = ['BTC', 'ETH', 'USDT', 'BNB', 'SOL'],
  refetchInterval: number = 30000,
  chainId: string = '1',
  enabled: boolean = true
) {
  return useQuery<CryptoPriceData[], Error>({
    queryKey: ['cryptoPrices', symbols.join(','), 'coingecko'],
    queryFn: () => CryptoPriceService.getPricesWithChanges(symbols),
    refetchInterval,
    staleTime: 15000, // 15 seconds until data becomes stale
    refetchOnWindowFocus: true,
    keepPreviousData: true, // Keep previous data for change comparison
    enabled,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff strategy
  });
}

/**
 * 使用單個加密貨幣價格數據的Hook
 *
 * @param symbol 加密貨幣符號
 * @param refetchInterval 自動刷新間隔（毫秒），默認為30秒
 * @param chainId 區塊鏈ID，默認為以太坊主網(1)
 * @param enabled 是否啟用查詢，默認為true
 * @returns TanStack Query結果對象，包含價格數據和查詢狀態
 */
export function useCryptoPrice(
  symbol: string,
  refetchInterval: number = 30000,
  chainId: string = '1',
  enabled: boolean = true
) {
  return useQuery<CryptoPriceData, Error>({
    queryKey: ['cryptoPrice', symbol, chainId],
    queryFn: () => CryptoPriceService.getPrice(symbol, chainId),
    refetchInterval,
    staleTime: 15000, // 15秒後數據變為過時
    refetchOnWindowFocus: true,
    enabled: enabled && !!symbol,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
