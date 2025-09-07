/**
 * Instagram-optimized API client
 * Faster timeouts, no retries, reduced overhead for Instagram in-app browser
 */

import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { API_BASE_URL } from '@/utils/constants';
import { detectInAppBrowser } from '@/utils/inAppBrowserDetection';

// Shorter timeout for Instagram browser (5 seconds instead of 15)
const INSTAGRAM_TIMEOUT = 5000;

// Create Instagram-optimized axios instance
export const createInstagramClient = (): AxiosInstance => {
  const browserInfo = detectInAppBrowser();
  const isInstagram = browserInfo.isInAppBrowser && browserInfo.browserName === 'instagram';
  
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: INSTAGRAM_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
    // Disable credentials for Instagram to avoid CORS preflight
    withCredentials: !isInstagram,
  });
  
  // Minimal request interceptor - no CSRF for Instagram
  client.interceptors.request.use(
    async (config) => {
      console.log('📱 [Instagram API] Request:', config.method?.toUpperCase(), config.url);
      
      // Skip CSRF for Instagram browser to reduce delays
      if (!isInstagram && config.method && config.method.toUpperCase() !== 'GET') {
        try {
          const { CSRFAPI } = await import('./csrf');
          const token = CSRFAPI.getCurrentToken();
          if (token) {
            config.headers['x-csrf-token'] = token;
          }
        } catch {
          // Ignore CSRF errors for Instagram
        }
      }
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  
  // Minimal response interceptor - no retries for Instagram
  client.interceptors.response.use(
    (response) => {
      console.log('📱 [Instagram API] Response:', response.status, response.config.url);
      return response;
    },
    async (error) => {
      console.error('📱 [Instagram API] Error:', error.message);
      
      // No retry logic for Instagram - fail fast
      if (error.code === 'ECONNABORTED') {
        return Promise.reject({
          error: 'Request Timeout',
          detail: 'The request took too long. Please try again.',
          code: 'TIMEOUT',
        });
      }
      
      return Promise.reject(error);
    }
  );
  
  return client;
};

// Singleton instance for Instagram browser
let instagramClient: AxiosInstance | null = null;

export const getInstagramClient = (): AxiosInstance => {
  if (!instagramClient) {
    instagramClient = createInstagramClient();
  }
  return instagramClient;
};

// Check if we should use Instagram client
export const shouldUseInstagramClient = (): boolean => {
  const browserInfo = detectInAppBrowser();
  return browserInfo.isInAppBrowser && browserInfo.browserName === 'instagram';
};