import axios, { AxiosError } from 'axios';
import type { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '@/utils/constants';
import type { ApiError, ApiResponse } from '@/types';
import { secureLog, secureError, createSecureRequestLog, createSecureResponseLog, createSecureErrorLog } from '@/utils/secureLogging';
import { coldStartHandler } from '@/utils/coldStartHandler';

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

// Create axios instance with dynamic timeout
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: coldStartHandler.getTimeout(), // Dynamic timeout based on cold start detection
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies
});

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    // Apply dynamic timeout for each request
    config.timeout = coldStartHandler.getTimeout();
    
    // Secure logging of requests
    secureLog('[API Request]', createSecureRequestLog(config));
    
    // Add CSRF token for non-GET requests (skip for session creation)
    const isSessionCreation = config.url === '/sessions' && config.method?.toUpperCase() === 'POST';
    if (config.method && config.method.toUpperCase() !== 'GET' && !isSessionCreation) {
      console.log('🔐 [API Client] CSRF token needed for:', config.method, config.url);
      try {
        const { CSRFAPI } = await import('./csrf');
        let token = CSRFAPI.getCurrentToken();
        console.log('🎫 [API Client] Current CSRF token exists:', !!token);
        
        // Get new token if we don't have one (with timeout for Instagram)
        if (!token && config.url !== '/csrf-token') {
          console.log('🔄 [API Client] Getting new CSRF token...');
          
          // Timeout CSRF fetch after 3 seconds to prevent blocking
          const csrfPromise = CSRFAPI.getToken();
          const timeoutPromise = new Promise<null>((resolve) => 
            setTimeout(() => resolve(null), 3000)
          );
          
          token = await Promise.race([csrfPromise, timeoutPromise]);
          
          if (token) {
            console.log('✅ [API Client] New CSRF token obtained:', !!token);
          } else {
            console.warn('⏱️ [API Client] CSRF token fetch timed out, proceeding without token');
          }
        }
        
        if (token) {
          config.headers['x-csrf-token'] = token;
          console.log('✅ [API Client] CSRF token added to headers');
        } else {
          console.warn('⚠️ [API Client] No CSRF token available, proceeding anyway');
        }
      } catch (error) {
        console.error('❌ [API Client] Failed to get CSRF token:', error);
        // Continue without CSRF token rather than blocking the request
      }
    } else if (isSessionCreation) {
      console.log('🚀 [API Client] Skipping CSRF for session creation');
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
    // Mark successful request for cold start detection
    coldStartHandler.markSuccess();
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
    
    // Enhanced retry logic with cold start handling
    const retryConfig = coldStartHandler.getRetryConfig();
    
    if (config && retryConfig.shouldRetry(error)) {
      // Initialize retry count
      config._retryCount = config._retryCount || 0;
      
      if (config._retryCount < retryConfig.maxRetries) {
        config._retryCount++;
        
        // Exponential backoff with base delay from config
        const delay = Math.min(
          retryConfig.retryDelay * Math.pow(2, config._retryCount - 1), 
          5000 // Max 5 seconds delay
        );
        
        secureLog(`[API Retry] Attempt ${config._retryCount}/${retryConfig.maxRetries} after ${delay}ms`);
        
        // Update timeout for retry (might be a cold start)
        config.timeout = coldStartHandler.getTimeout();
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return apiClient.request(config);
      }
    }
    
    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      const apiError: ApiError = {
        error: 'Request Timeout',
        detail: 'The request timed out. Please try again.',
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
        detail: 'Please check your network connection.',
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
