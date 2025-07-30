'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

/**
 * TanStack Query 客戶端配置
 * 基於Portfolio API的特性優化的配置
 */
const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 緩存策略 - 適合Portfolio數據的更新頻率
        staleTime: 5 * 60 * 1000, // 5分鐘內數據被認為是新鮮的
        gcTime: 10 * 60 * 1000, // 10分鐘後清理緩存 (原cacheTime)

        // 重試策略 - 適應Portfolio API的特性
        retry: (failureCount, error: any) => {
          // 不重試的錯誤類型
          if (error?.code === 'UNAUTHORIZED' || error?.code === 'FORBIDDEN') {
            return false;
          }

          // 最多重試3次
          return failureCount < 3;
        },

        // 指數退避重試延遲
        retryDelay: (attemptIndex) =>
          Math.min(1000 * Math.pow(2, attemptIndex), 5000),

        // 重新聚焦時重新獲取數據
        refetchOnWindowFocus: true,

        // 重新連接時重新獲取數據
        refetchOnReconnect: true,

        // 組件掛載時重新獲取數據
        refetchOnMount: true,
      },
      mutations: {
        // 變更操作的重試策略
        retry: 1,
        retryDelay: 1000,
      },
    },
  });
};

// 創建全局查詢客戶端實例
let browserQueryClient: QueryClient | undefined = undefined;

const getQueryClient = () => {
  if (typeof window === 'undefined') {
    // 服務器端：總是創建新的客戶端
    return createQueryClient();
  } else {
    // 瀏覽器端：創建一次性客戶端
    if (!browserQueryClient) browserQueryClient = createQueryClient();
    return browserQueryClient;
  }
};

/**
 * Query Provider 組件
 * 提供Portfolio數據查詢和狀態管理
 */
interface QueryProviderProps {
  children: React.ReactNode;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* 只在開發環境顯示DevTools */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
          position='bottom'
          buttonPosition='bottom-left'
        />
      )}
    </QueryClientProvider>
  );
};

/**
 * 自定義Hook - 獲取QueryClient實例
 * 用於在組件外部進行查詢操作
 */
export const getGlobalQueryClient = () => {
  return getQueryClient();
};

/**
 * Query Keys 工廠 - 統一管理查詢鍵
 * 確保查詢緩存的一致性
 */
export const queryKeys = {
  // Portfolio相關查詢
  portfolio: {
    all: ['portfolio'] as const,
    byAddress: (address: string) => ['portfolio', address] as const,
    valueChart: (address: string, timerange: string) =>
      ['portfolio', address, 'value-chart', timerange] as const,
    transactions: (address: string, limit?: number) =>
      ['portfolio', address, 'transactions', limit] as const,
    chainData: (address: string, chainId: number) =>
      ['portfolio', address, 'chain', chainId] as const,
  },

  // 系統相關查詢
  system: {
    supportedChains: ['system', 'chains'] as const,
    health: ['system', 'health'] as const,
  },
} as const;

/**
 * 查詢客戶端工具函數
 */
export const queryUtils = {
  /**
   * 預取Portfolio數據
   */
  prefetchPortfolio: async (address: string) => {
    const queryClient = getQueryClient();
    return queryClient.prefetchQuery({
      queryKey: queryKeys.portfolio.byAddress(address),
      queryFn: async () => {
        const { OneInchPortfolioAPI } = await import(
          '@/services/api/oneinchAPI'
        );
        return OneInchPortfolioAPI.fetchCompletePortfolioData(address);
      },
      staleTime: 5 * 60 * 1000,
    });
  },

  /**
   * 清除Portfolio緩存
   */
  invalidatePortfolio: async (address?: string) => {
    const queryClient = getQueryClient();
    if (address) {
      return queryClient.invalidateQueries({
        queryKey: queryKeys.portfolio.byAddress(address),
      });
    } else {
      return queryClient.invalidateQueries({
        queryKey: queryKeys.portfolio.all,
      });
    }
  },

  /**
   * 清除所有緩存
   */
  clearAllCache: async () => {
    const queryClient = getQueryClient();
    return queryClient.clear();
  },

  /**
   * 獲取緩存統計
   */
  getCacheStats: () => {
    const queryClient = getQueryClient();
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();

    return {
      totalQueries: queries.length,
      activeQueries: queries.filter((q) => q.observers.length > 0).length,
      staleQueries: queries.filter((q) => q.isStale()).length,
      cachedData: queries.reduce((acc, q) => {
        if (q.state.data) acc++;
        return acc;
      }, 0),
    };
  },
};

export default QueryProvider;
