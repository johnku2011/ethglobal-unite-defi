/**
 * 交易狀態存儲
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TransactionFilter {
  chainIds: number[]; // 區塊鏈ID列表
  types: string[]; // 交易類型列表
  fromDate?: Date; // 開始日期
  toDate?: Date; // 結束日期
  search?: string; // 搜索關鍵詞
}

export interface TransactionViewSettings {
  pageSize: number; // 每頁顯示數量
  sortBy: string; // 排序字段
  sortDirection: 'asc' | 'desc'; // 排序方向
  showChart: boolean; // 是否顯示圖表
  chartType: 'daily' | 'weekly' | 'monthly'; // 圖表類型
}

interface TransactionState {
  filter: TransactionFilter;
  viewSettings: TransactionViewSettings;
  recentTransactions: string[]; // 最近查看的交易哈希列表

  // 更新過濾器
  setFilter: (filter: Partial<TransactionFilter>) => void;

  // 更新視圖設置
  setViewSettings: (settings: Partial<TransactionViewSettings>) => void;

  // 添加最近查看的交易
  addRecentTransaction: (txHash: string) => void;

  // 清除過濾器
  clearFilter: () => void;

  // 重置所有狀態
  resetState: () => void;
}

// 默認過濾器
const DEFAULT_FILTER: TransactionFilter = {
  chainIds: [],
  types: [],
};

// 默認視圖設置
const DEFAULT_VIEW_SETTINGS: TransactionViewSettings = {
  pageSize: 10,
  sortBy: 'timeMs',
  sortDirection: 'desc',
  showChart: true,
  chartType: 'daily',
};

// 創建存儲
export const useTransactionStore = create<TransactionState>()(
  persist(
    (set) => ({
      filter: DEFAULT_FILTER,
      viewSettings: DEFAULT_VIEW_SETTINGS,
      recentTransactions: [],

      setFilter: (newFilter) =>
        set((state) => ({
          filter: { ...state.filter, ...newFilter },
        })),

      setViewSettings: (newSettings) =>
        set((state) => ({
          viewSettings: { ...state.viewSettings, ...newSettings },
        })),

      addRecentTransaction: (txHash) =>
        set((state) => {
          // 移除已存在的相同交易哈希
          const filteredList = state.recentTransactions.filter(
            (hash) => hash !== txHash
          );

          // 添加到列表開頭，並限制列表長度為10
          return {
            recentTransactions: [txHash, ...filteredList].slice(0, 10),
          };
        }),

      clearFilter: () => set(() => ({ filter: DEFAULT_FILTER })),

      resetState: () =>
        set(() => ({
          filter: DEFAULT_FILTER,
          viewSettings: DEFAULT_VIEW_SETTINGS,
          recentTransactions: [],
        })),
    }),
    {
      name: 'transaction-store', // 存儲名稱，用於本地存儲
    }
  )
);
