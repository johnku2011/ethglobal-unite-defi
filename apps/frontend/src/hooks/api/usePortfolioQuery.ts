import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OneInchPortfolioAPI } from '@/services/api/oneinchAPI';
import { queryKeys } from '@/providers/QueryProvider';
import { useCurrentWalletChain } from '@/providers/ChainProvider';
import { toast } from 'react-hot-toast';

/**
 * Portfolio 數據查詢 Hook（使用鏈狀態管理）
 * 包含完整的觸發→輪詢流程，並根據當前鏈狀態決定是否查詢
 */
export const usePortfolio = (address?: string) => {
  const { canUse1inch, shouldShowTestnetWarning, chain } =
    useCurrentWalletChain();

  return useQuery({
    queryKey: queryKeys.portfolio.byAddress(address || ''),
    queryFn: async () => {
      if (!address || !OneInchPortfolioAPI.isValidEthereumAddress(address)) {
        throw new Error('Invalid wallet address');
      }

      if (!canUse1inch) {
        if (shouldShowTestnetWarning) {
          throw new Error(
            '1inch Portfolio API does not support testnets. Please switch to mainnet to view portfolio data.'
          );
        }
        throw new Error('Current network does not support 1inch API');
      }

      console.log(
        `🚀 Starting to fetch Portfolio data: ${OneInchPortfolioAPI.formatAddress(address)} (Chain: ${chain?.shortName})`
      );

      // Execute complete Portfolio data fetching process
      const result =
        await OneInchPortfolioAPI.fetchCompletePortfolioData(address);

      if (!result) {
        throw new Error(
          'Failed to retrieve Portfolio data, please try again later'
        );
      }

      return result;
    },
    enabled:
      !!address &&
      OneInchPortfolioAPI.isValidEthereumAddress(address) &&
      canUse1inch,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      // Do not retry for network unsupported errors
      if (
        error?.message?.includes('does not support') ||
        error?.message?.includes('testnets')
      ) {
        return false;
      }
      // Do not retry for invalid address and other non-retryable errors
      if (
        error?.message?.includes('Invalid') ||
        error?.code === 'BAD_REQUEST'
      ) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) =>
      Math.min(1000 * Math.pow(2, attemptIndex), 10000),
  });
};

/**
 * 價值圖表數據查詢 Hook
 * 支持多種時間範圍選項
 */
export type TimeRange = '1day' | '1week' | '1month' | '1year' | '3years';

export const useValueChart = (
  address?: string,
  timerange: TimeRange = '1month'
) => {
  const { canUse1inch, shouldShowTestnetWarning, chain } =
    useCurrentWalletChain();

  return useQuery({
    queryKey: queryKeys.portfolio.valueChart(address || '', timerange),
    queryFn: async () => {
      if (!address || !OneInchPortfolioAPI.isValidEthereumAddress(address)) {
        throw new Error('Invalid wallet address');
      }

      if (!canUse1inch) {
        if (shouldShowTestnetWarning) {
          throw new Error(
            '1inch Portfolio API does not support testnets. Please switch to mainnet to view value chart.'
          );
        }
        throw new Error('Current network does not support 1inch API');
      }

      console.log(
        `📈 Fetching value chart: ${OneInchPortfolioAPI.formatAddress(address)} (${timerange}) [Chain: ${chain?.shortName}]`
      );

      // Add random delay to avoid API rate limits
      await OneInchPortfolioAPI.randomDelay(1, 3);

      return OneInchPortfolioAPI.getValueChart(address, timerange);
    },
    enabled:
      !!address &&
      OneInchPortfolioAPI.isValidEthereumAddress(address) &&
      canUse1inch,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Do not retry for network unsupported errors
      if (
        error?.message?.includes('does not support') ||
        error?.message?.includes('testnets')
      ) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) =>
      Math.min(1000 * Math.pow(2, attemptIndex), 5000),
  });
};

/**
 * 交易歷史查詢 Hook
 */
export const useTransactionHistory = (
  address: string | undefined,
  limit: number = 100
) => {
  return useQuery({
    queryKey: queryKeys.portfolio.transactions(address || '', limit),
    queryFn: async () => {
      if (!address || !OneInchPortfolioAPI.isValidEthereumAddress(address)) {
        throw new Error('無效的錢包地址');
      }

      console.log(
        `📜 獲取交易歷史: ${OneInchPortfolioAPI.formatAddress(address)}`
      );

      return OneInchPortfolioAPI.getTransactionHistory(address, limit);
    },
    enabled: !!address && OneInchPortfolioAPI.isValidEthereumAddress(address),
    staleTime: 10 * 60 * 1000, // 10分鐘，交易歷史更新較慢
    retry: 3,
  });
};

/**
 * 單鏈Portfolio數據查詢 Hook
 */
export const useChainPortfolio = (
  address: string | undefined,
  chainId: number | undefined
) => {
  return useQuery({
    queryKey: queryKeys.portfolio.chainData(address || '', chainId || 0),
    queryFn: async () => {
      if (!address || !OneInchPortfolioAPI.isValidEthereumAddress(address)) {
        throw new Error('無效的錢包地址');
      }
      if (!chainId) {
        throw new Error('無效的鏈ID');
      }

      console.log(
        `🔗 獲取單鏈數據: ${OneInchPortfolioAPI.formatAddress(address)} (Chain: ${chainId})`
      );

      return OneInchPortfolioAPI.getChainPortfolio(address, chainId);
    },
    enabled:
      !!address &&
      !!chainId &&
      OneInchPortfolioAPI.isValidEthereumAddress(address),
    staleTime: 5 * 60 * 1000,
    retry: 3,
  });
};

/**
 * 支持的鏈列表查詢 Hook
 */
export const useSupportedChains = () => {
  return useQuery({
    queryKey: queryKeys.system.supportedChains,
    queryFn: async () => {
      console.log(`🔗 獲取支持的鏈列表`);
      return OneInchPortfolioAPI.getSupportedChains();
    },
    staleTime: 60 * 60 * 1000, // 1小時，鏈列表很少變化
    retry: 2,
  });
};

/**
 * API健康檢查 Hook
 */
export const useHealthCheck = () => {
  return useQuery({
    queryKey: queryKeys.system.health,
    queryFn: async () => {
      return OneInchPortfolioAPI.healthCheck();
    },
    staleTime: 2 * 60 * 1000, // 2分鐘
    retry: 1,
    refetchInterval: 5 * 60 * 1000, // 每5分鐘自動檢查
  });
};

/**
 * 刷新Portfolio緩存 Mutation Hook
 */
export const useRefreshPortfolio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (address: string) => {
      if (!OneInchPortfolioAPI.isValidEthereumAddress(address)) {
        throw new Error('無效的錢包地址');
      }

      console.log(
        `🔄 刷新Portfolio緩存: ${OneInchPortfolioAPI.formatAddress(address)}`
      );

      await OneInchPortfolioAPI.refreshPortfolioCache(address);
      return address;
    },
    onSuccess: (address) => {
      // 刷新成功後，清除相關緩存
      queryClient.invalidateQueries({
        queryKey: queryKeys.portfolio.byAddress(address),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.portfolio.valueChart(address, ''),
        exact: false,
      });

      toast.success('Portfolio數據已刷新');
    },
    onError: (error: any) => {
      console.error('刷新Portfolio失敗:', error);
      toast.error(error?.message || '刷新失敗，請稍後再試');
    },
  });
};

/**
 * 批量預取Portfolio數據
 */
export const usePrefetchPortfolio = () => {
  const queryClient = useQueryClient();

  return {
    prefetchPortfolio: async (address: string) => {
      if (!OneInchPortfolioAPI.isValidEthereumAddress(address)) {
        return;
      }

      console.log(
        `🚀 預取Portfolio數據: ${OneInchPortfolioAPI.formatAddress(address)}`
      );

      // 預取主要的Portfolio數據
      await queryClient.prefetchQuery({
        queryKey: queryKeys.portfolio.byAddress(address),
        queryFn: async () => {
          return OneInchPortfolioAPI.fetchCompletePortfolioData(address);
        },
        staleTime: 5 * 60 * 1000,
      });

      // 預取價值圖表數據（默認時間範圍）
      await queryClient.prefetchQuery({
        queryKey: queryKeys.portfolio.valueChart(address, '1month'),
        queryFn: async () => {
          await OneInchPortfolioAPI.randomDelay(1, 2);
          return OneInchPortfolioAPI.getValueChart(address, '1month');
        },
        staleTime: 5 * 60 * 1000,
      });
    },

    prefetchValueChart: async (address: string, timerange: string) => {
      if (!OneInchPortfolioAPI.isValidEthereumAddress(address)) {
        return;
      }

      await queryClient.prefetchQuery({
        queryKey: queryKeys.portfolio.valueChart(address, timerange),
        queryFn: async () => {
          await OneInchPortfolioAPI.randomDelay(1, 2);
          return OneInchPortfolioAPI.getValueChart(address, timerange);
        },
        staleTime: 5 * 60 * 1000,
      });
    },
  };
};

/**
 * Portfolio數據狀態摘要 Hook
 * 提供數據加載狀態的綜合視圖
 */
export const usePortfolioStatus = (address: string | undefined) => {
  const portfolioQuery = usePortfolio(address);
  const valueChartQuery = useValueChart(address);
  const transactionsQuery = useTransactionHistory(address);

  return {
    // 數據狀態
    isLoading: portfolioQuery.isLoading || valueChartQuery.isLoading,
    isError: portfolioQuery.isError || valueChartQuery.isError,
    hasData: !!portfolioQuery.data || !!valueChartQuery.data,

    // 具體數據
    portfolio: portfolioQuery.data,
    valueChart: valueChartQuery.data,
    transactions: transactionsQuery.data,

    // 錯誤信息
    errors: {
      portfolio: portfolioQuery.error,
      valueChart: valueChartQuery.error,
      transactions: transactionsQuery.error,
    },

    // 重新獲取函數
    refetch: {
      portfolio: portfolioQuery.refetch,
      valueChart: valueChartQuery.refetch,
      transactions: transactionsQuery.refetch,
      all: () => {
        portfolioQuery.refetch();
        valueChartQuery.refetch();
        transactionsQuery.refetch();
      },
    },

    // 加載狀態詳情
    loadingStates: {
      portfolio: portfolioQuery.isLoading,
      valueChart: valueChartQuery.isLoading,
      transactions: transactionsQuery.isLoading,
      portfolioRefetching: portfolioQuery.isRefetching,
      valueChartRefetching: valueChartQuery.isRefetching,
    },
  };
};
