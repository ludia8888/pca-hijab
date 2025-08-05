import axios, { AxiosError } from 'axios';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '@/utils/constants';
import type { ApiError, ApiResponse } from '@/types';
import { secureLog, secureError, createSecureRequestLog, createSecureResponseLog, createSecureErrorLog } from '@/utils/secureLogging';

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
      try {
        const { CSRFAPI } = await import('./csrf');
        let token = CSRFAPI.getCurrentToken();
        
        // Get new token if we don't have one
        if (!token && config.url !== '/csrf-token') {
          token = await CSRFAPI.getToken();
        }
        
        if (token) {
          config.headers['x-csrf-token'] = token;
        }
      } catch (error) {
        console.warn('Failed to get CSRF token:', error);
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
    secureError('[API Response Error]', createSecureErrorLog(error));
    
    // Handle CSRF token errors
    if (error.response?.status === 403 && 
        error.response?.data?.error?.includes('CSRF')) {
      try {
        // Clear old token and get new one
        const { CSRFAPI } = await import('./csrf');
        CSRFAPI.clearToken();
        
        // Don't retry if this was already a retry
        if (!error.config?._retry) {
          const newToken = await CSRFAPI.getToken();
          error.config!._retry = true;
          error.config!.headers['x-csrf-token'] = newToken;
          return apiClient.request(error.config!);
        }
      } catch (csrfError) {
        secureError('Failed to handle CSRF error:', csrfError);
      }
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