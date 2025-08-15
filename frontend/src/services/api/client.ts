import axios, { AxiosError } from 'axios';
import type { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '@/utils/constants';
import type { ApiError, ApiResponse } from '@/types';
import { secureLog, secureError, createSecureRequestLog, createSecureResponseLog, createSecureErrorLog } from '@/utils/secureLogging';

// Extend config with retry metadata
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _retryCount?: number;
}

// Debug API configuration (secure)
secureLog('[API Client] Initializing with:', {
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  env: import.meta.env.MODE,
  viteApiBaseUrl: import.meta.env.VITE_API_BASE_URL
});

// Enhanced debug logging for development
if (import.meta.env.MODE === 'development') {
  console.log('[API Client Debug] Full configuration:', {
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    mode: import.meta.env.MODE,
    viteApiBaseUrl: import.meta.env.VITE_API_BASE_URL,
    nodeEnv: process.env.NODE_ENV
  });
}

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies
});

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    // Secure logging of requests
    secureLog('[API Request]', createSecureRequestLog(config));
    
    // Add API key for admin routes
    if (config.url?.includes('/admin/')) {
      try {
        const { useAdminStore } = await import('@/store/useAdminStore');
        const apiKey = useAdminStore.getState().apiKey;
        if (apiKey) {
          config.headers['x-api-key'] = apiKey;
          console.log('[API Client] Added API key to admin request:', config.url);
        } else {
          console.warn('[API Client] No API key found for admin request:', config.url);
        }
      } catch (error) {
        console.error('[API Client] Failed to add API key:', error);
      }
    }
    
    // Add CSRF token for non-GET requests
    if (config.method && config.method.toUpperCase() !== 'GET') {
      console.log('🔐 [API Client] CSRF token needed for:', config.method, config.url);
      try {
        const { CSRFAPI } = await import('./csrf');
        let token = CSRFAPI.getCurrentToken();
        console.log('🎫 [API Client] Current CSRF token exists:', !!token);
        
        // Get new token if we don't have one
        if (!token && config.url !== '/csrf-token') {
          console.log('🔄 [API Client] Getting new CSRF token...');
          token = await CSRFAPI.getToken();
          console.log('✅ [API Client] New CSRF token obtained:', !!token);
        }
        
        if (token) {
          config.headers['x-csrf-token'] = token;
          console.log('✅ [API Client] CSRF token added to headers');
        } else {
          console.warn('⚠️ [API Client] No CSRF token available');
        }
      } catch (error) {
        console.error('❌ [API Client] Failed to get CSRF token:', error);
      }
    }
    
    return config;
  },
  (error) => {
    secureError('[API Request Error]', error);
    return Promise.reject(error);
  },
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    secureLog('[API Response]', createSecureResponseLog(response));
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    const config = error.config as ExtendedAxiosRequestConfig;
    
    secureError('[API Response Error]', createSecureErrorLog(error));
    
    // Handle CSRF token errors
    if (error.response?.status === 403 && 
        error.response?.data?.error?.includes('CSRF')) {
      try {
        // Clear old token and get new one
        const { CSRFAPI } = await import('./csrf');
        CSRFAPI.clearToken();
        
        // Don't retry if this was already a retry
        if (!config?._retry) {
          const newToken = await CSRFAPI.getToken();
          config._retry = true;
          config.headers['x-csrf-token'] = newToken;
          return apiClient.request(config);
        }
      } catch (csrfError) {
        secureError('Failed to handle CSRF error:', csrfError);
      }
    }
    
    // Network error retry logic
    if (!error.response && error.code !== 'ECONNABORTED' && config) {
      // Initialize retry count
      config._retryCount = config._retryCount || 0;
      
      // Retry up to 3 times for network errors
      if (config._retryCount < 3) {
        config._retryCount++;
        
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, config._retryCount - 1) * 1000;
        
        secureLog(`[API Retry] Attempt ${config._retryCount} after ${delay}ms`);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return apiClient.request(config);
      }
    }
    
    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      const apiError: ApiError = {
        error: 'Request Timeout',
        detail: '요청 시간이 초과되었습니다. 다시 시도해주세요.',
        code: 'TIMEOUT',
      };
      return Promise.reject(apiError);
    }
    
    if (error.response) {
      // Server responded with error
      const apiError: ApiError = {
        error: error.response.data?.error || 'Unknown error',
        detail: error.response.data?.detail || error.message,
        code: error.code,
      };
      return Promise.reject(apiError);
    } else if (error.request) {
      // Request made but no response
      secureError('[Network Error] No response received:', error.request);
      const apiError: ApiError = {
        error: 'Network Error',
        detail: '네트워크 연결을 확인해주세요',
        code: 'NETWORK_ERROR',
      };
      return Promise.reject(apiError);
    } else {
      // Something else happened
      const apiError: ApiError = {
        error: 'Request Error',
        detail: error.message,
        code: 'REQUEST_ERROR',
      };
      return Promise.reject(apiError);
    }
  },
);

// Generic request wrapper
export async function apiRequest<T>(
  config: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  try {
    const response = await apiClient.request<T>(config);
    return {
      data: response.data,
      success: true,
    };
  } catch (error) {
    return {
      error: error as ApiError,
      success: false,
    };
  }
}