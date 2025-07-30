import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';

/**
 * Portfolio API 客戶端配置
 * 基於業界最佳實踐的Axios配置
 */

// Next.js API代理配置 (解決CORS問題)
// 通過本地API路由代理1inch Portfolio API v4調用
const API_CONFIG = {
  baseURL: '/api', // 使用本地Next.js API路由
  timeout: 30000, // 30秒超時，適應1inch API處理時間
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    // API密鑰將在服務器端安全處理，前端不需要設置Authorization
  },
} as const;

/**
 * 創建Portfolio專用的Axios實例
 */
export const portfolioApiClient: AxiosInstance = axios.create(API_CONFIG);

/**
 * 請求攔截器 - 添加認證和日誌
 */
portfolioApiClient.interceptors.request.use(
  (config) => {
    // 添加API密鑰（如果有的話）
    const apiKey = process.env.NEXT_PUBLIC_1INCH_API_KEY;
    if (apiKey && config.headers) {
      config.headers['Authorization'] = `Bearer ${apiKey}`;
    }

    // 開發環境下記錄請求
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`
      );
      if (config.data) {
        console.log('📤 Request payload:', config.data);
      }
    }

    // 添加請求時間戳
    config.metadata = { startTime: Date.now() };

    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

/**
 * 響應攔截器 - 處理響應和錯誤
 */
portfolioApiClient.interceptors.response.use(
  (response) => {
    // 計算請求時間
    const startTime = response.config.metadata?.startTime;
    const duration = startTime ? Date.now() - startTime : 0;

    // 開發環境下記錄響應
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`
      );
      console.log('📥 Response data:', response.data);
    }

    return response;
  },
  (error: AxiosError) => {
    // 計算請求時間
    const startTime = error.config?.metadata?.startTime;
    const duration = startTime ? Date.now() - startTime : 0;

    // 詳細錯誤日誌
    const errorInfo = {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status,
      statusText: error.response?.statusText,
      duration: `${duration}ms`,
      message: error.message,
      data: error.response?.data,
    };

    console.error('❌ API Error:', errorInfo);

    // 根據不同錯誤類型提供用戶友好的錯誤信息
    const userFriendlyError = createUserFriendlyError(error);

    return Promise.reject(userFriendlyError);
  }
);

/**
 * 創建用戶友好的錯誤信息
 */
function createUserFriendlyError(
  error: AxiosError
): Error & { code?: string; retryable?: boolean } {
  const baseError = {
    code: 'UNKNOWN_ERROR',
    retryable: false,
  };

  // 網絡錯誤
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      return Object.assign(new Error('請求超時，請檢查網絡連接'), {
        ...baseError,
        code: 'TIMEOUT',
        retryable: true,
      });
    }
    return Object.assign(new Error('網絡連接失敗，請檢查網絡設置'), {
      ...baseError,
      code: 'NETWORK_ERROR',
      retryable: true,
    });
  }

  // HTTP狀態錯誤
  const status = error.response.status;
  const data = error.response.data as any;

  switch (status) {
    case 400:
      return Object.assign(new Error(data?.message || '請求參數錯誤'), {
        ...baseError,
        code: 'BAD_REQUEST',
        retryable: false,
      });

    case 401:
      return Object.assign(new Error('API認證失敗，請檢查配置'), {
        ...baseError,
        code: 'UNAUTHORIZED',
        retryable: false,
      });

    case 403:
      return Object.assign(new Error('API訪問被拒絕，請檢查權限'), {
        ...baseError,
        code: 'FORBIDDEN',
        retryable: false,
      });

    case 404:
      return Object.assign(new Error('請求的資源不存在'), {
        ...baseError,
        code: 'NOT_FOUND',
        retryable: false,
      });

    case 429:
      return Object.assign(new Error('請求過於頻繁，請稍後再試'), {
        ...baseError,
        code: 'RATE_LIMITED',
        retryable: true,
      });

    case 500:
    case 502:
    case 503:
    case 504:
      return Object.assign(new Error('服務器暫時不可用，請稍後再試'), {
        ...baseError,
        code: 'SERVER_ERROR',
        retryable: true,
      });

    default:
      return Object.assign(new Error(data?.message || '未知錯誤'), {
        ...baseError,
        code: 'UNKNOWN_ERROR',
        retryable: status >= 500,
      });
  }
}

/**
 * 請求重試工具函數
 */
export async function retryRequest<T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as Error;

      // 檢查是否可重試
      const isRetryable = (error as any)?.retryable ?? true;

      if (!isRetryable || attempt === maxRetries) {
        break;
      }

      // 指數退避延遲
      const delay = retryDelay * Math.pow(2, attempt - 1);
      console.log(
        `⏳ 重試請求 (${attempt}/${maxRetries}) - ${delay}ms後重試...`
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * 通用API響應類型
 */
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  timestamp?: number;
}

/**
 * API錯誤響應類型
 */
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp?: number;
}

// 擴展AxiosRequestConfig以支持metadata
declare module 'axios' {
  interface AxiosRequestConfig {
    metadata?: {
      startTime: number;
    };
  }
}

export default portfolioApiClient;
