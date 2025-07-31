import { create } from 'zustand';
import { CryptoPriceData } from '@/types/cryptoPrice';
import { CryptoPriceService } from '@/services/cryptoPriceService';

/**
 * 加密貨幣價格全局狀態類型
 */
interface CryptoPriceState {
  // 數據
  prices: CryptoPriceData[];
  lastUpdated: Date | null;

  // 加載狀態
  isLoading: boolean;
  error: Error | null;

  // 配置
  selectedSymbols: string[];
  autoRefresh: boolean;
  refreshInterval: number;
  showTicker: boolean;

  // 操作
  fetchPrices: (symbols?: string[]) => Promise<void>;
  setSelectedSymbols: (symbols: string[]) => void;
  setShowTicker: (show: boolean) => void;
  setAutoRefresh: (auto: boolean) => void;
  setRefreshInterval: (interval: number) => void;
  resetError: () => void;
}

/**
 * 加密貨幣價格全局狀態存儲
 */
export const useCryptoPriceStore = create<CryptoPriceState>((set, get) => ({
  // 初始狀態
  prices: [],
  lastUpdated: null,
  isLoading: false,
  error: null,
  selectedSymbols: ['BTC', 'ETH', 'USDT', 'BNB', 'SOL', 'ADA', 'XRP', 'DOGE'],
  autoRefresh: true,
  refreshInterval: 30000, // 30秒
  showTicker: true,

  /**
   * 獲取加密貨幣價格數據
   */
  fetchPrices: async (symbols?: string[]) => {
    try {
      set({ isLoading: true, error: null });

      // 使用提供的符號列表或默認選擇的符號列表
      const symbolsToFetch = symbols || get().selectedSymbols;

      // 調用API獲取數據
      const prices = await CryptoPriceService.getPrices(symbolsToFetch);

      set({
        prices,
        lastUpdated: new Date(),
        isLoading: false,
      });

      return;
    } catch (error) {
      console.error('加密貨幣價格獲取失敗:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error : new Error('未知錯誤'),
      });
    }
  },

  /**
   * 設置要顯示的加密貨幣符號
   */
  setSelectedSymbols: (symbols: string[]) => {
    set({ selectedSymbols: symbols });

    // 如果有必要，立即獲取新的價格數據
    if (get().autoRefresh && symbols.length > 0) {
      get().fetchPrices(symbols);
    }
  },

  /**
   * 設置是否顯示價格消息欄
   */
  setShowTicker: (show: boolean) => {
    set({ showTicker: show });

    // 保存用戶偏好設置到localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('cryptoTicker.show', String(show));
    }
  },

  /**
   * 設置是否自動刷新價格數據
   */
  setAutoRefresh: (auto: boolean) => {
    set({ autoRefresh: auto });

    // 保存用戶偏好設置到localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('cryptoTicker.autoRefresh', String(auto));
    }
  },

  /**
   * 設置自動刷新間隔
   */
  setRefreshInterval: (interval: number) => {
    set({ refreshInterval: interval });

    // 保存用戶偏好設置到localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('cryptoTicker.refreshInterval', String(interval));
    }
  },

  /**
   * 重置錯誤狀態
   */
  resetError: () => set({ error: null }),
}));

/**
 * 從localStorage加載用戶偏好設置
 * 需要在客戶端組件中調用
 */
export function loadCryptoPricePreferences() {
  if (typeof window === 'undefined') return;

  const store = useCryptoPriceStore.getState();

  // 加載顯示設置
  const showTickerStr = localStorage.getItem('cryptoTicker.show');
  if (showTickerStr !== null) {
    store.setShowTicker(showTickerStr === 'true');
  }

  // 加載自動刷新設置
  const autoRefreshStr = localStorage.getItem('cryptoTicker.autoRefresh');
  if (autoRefreshStr !== null) {
    store.setAutoRefresh(autoRefreshStr === 'true');
  }

  // 加載刷新間隔設置
  const refreshIntervalStr = localStorage.getItem(
    'cryptoTicker.refreshInterval'
  );
  if (refreshIntervalStr !== null) {
    const interval = parseInt(refreshIntervalStr, 10);
    if (!isNaN(interval) && interval > 0) {
      store.setRefreshInterval(interval);
    }
  }

  // 加載選定的符號
  const selectedSymbolsStr = localStorage.getItem(
    'cryptoTicker.selectedSymbols'
  );
  if (selectedSymbolsStr) {
    try {
      const symbols = JSON.parse(selectedSymbolsStr);
      if (Array.isArray(symbols) && symbols.length > 0) {
        store.setSelectedSymbols(symbols);
      }
    } catch (e) {
      console.error('Failed to parse selected symbols from localStorage', e);
    }
  }
}
