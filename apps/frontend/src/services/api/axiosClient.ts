import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';

/**
 * API Client Configuration
 * Based on industry best practices for Axios configuration
 */

// Next.js API proxy configuration (solves CORS issues)
// Proxies 1inch Portfolio API v4 calls through local Next.js API routes
const PORTFOLIO_API_CONFIG = {
  baseURL: '/api', // Using local Next.js API route
  timeout: 30000, // 30 second timeout for 1inch API processing time
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    // API key is handled securely on server-side, not needed in frontend
  },
} as const;

// 1inch History API configuration (direct calls)
const HISTORY_API_CONFIG = {
  baseURL: 'https://api.1inch.dev/history', // Direct connection to 1inch History API
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
} as const;

/**
 * Create Portfolio-specific Axios instance
 */
const portfolioApiClient: AxiosInstance = axios.create(PORTFOLIO_API_CONFIG);

/**
 * Create History API-specific Axios instance
 */
const historyApiClient: AxiosInstance = axios.create(HISTORY_API_CONFIG);

/**
 * Request interceptor for History API - adds authorization and logging
 */
historyApiClient.interceptors.request.use(
  (config) => {
    // Add API key (if available)
    const apiKey = process.env.NEXT_PUBLIC_1INCH_API_KEY;
    if (apiKey && config.headers) {
      config.headers['Authorization'] = `Bearer ${apiKey}`;
    }

    // Log requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `🚀 History API Request: ${config.method?.toUpperCase()} ${config.url}`
      );
      if (config.params) {
        console.log('📤 Request params:', config.params);
      }
    }

    // Add timestamp
    config.metadata = { startTime: Date.now() };

    return config;
  },
  (error: AxiosError) => {
    console.error('❌ History API Request error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor for History API - handles responses and errors
 */
historyApiClient.interceptors.response.use(
  (response) => {
    // Calculate request time
    const startTime = response.config.metadata?.startTime;
    const duration = startTime ? Date.now() - startTime : 0;

    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `✅ History API Response: ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`
      );
      console.log('📥 Response data:', response.data);
    }

    return response;
  },
  (error: AxiosError) => {
    // Calculate request time
    const startTime = error.config?.metadata?.startTime;
    const duration = startTime ? Date.now() - startTime : 0;

    // Detailed error log
    const errorInfo = {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status,
      statusText: error.response?.statusText,
      duration: `${duration}ms`,
      message: error.message,
      data: error.response?.data,
    };

    console.error('❌ History API Error:', errorInfo);

    return Promise.reject(error);
  }
);

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

// Export both API clients
export { portfolioApiClient, historyApiClient };

// Default export for backward compatibility
export default portfolioApiClient;
