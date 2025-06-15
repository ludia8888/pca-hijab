import axios from 'axios';
import type { PersonalColorResult } from '@/types';
import { getAIApiUrl, shouldUseMockAI, getApiTimeout, debugApiConfig } from '@/utils/apiConfig';

export class PersonalColorAPI {
  /**
   * Analyzes an image to determine personal color
   * @param file - Image file to analyze
   * @param debug - Include debug information
   * @param retryCount - Number of retry attempts (internal use)
   * @returns Promise<PersonalColorResult>
   */
  static async analyzeImage(
    file: File,
    debug = false,
    retryCount = 0,
  ): Promise<PersonalColorResult> {
    // Get dynamic configuration
    const aiApiUrl = getAIApiUrl();
    const useMockAI = shouldUseMockAI();
    const apiTimeout = getApiTimeout();
    
    // Debug logging only in development
    if (import.meta.env.DEV) {
      console.log('analyzeImage called with:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        aiApiUrl,
        useMockAI,
        debug,
        retryCount,
      });
      
      // Extra debug on first call
      if (retryCount === 0) {
        debugApiConfig();
      }
    }
    
    const formData = new FormData();
    formData.append('file', file);

    // Check if we should use mock AI (using dynamic config)
    if (useMockAI) {
      console.warn('⚠️ Mock AI mode is enabled but not implemented');
      throw new Error('Mock mode is not implemented. Please configure the AI API URL.');
    }
    
    // Validate AI API URL
    if (!aiApiUrl) {
      throw new Error('AI API URL is not configured. Please check your environment variables.');
    }

    try {
      if (import.meta.env.DEV) {
        console.log('Making real API call to:', aiApiUrl);
      }
      // Create separate axios instance for AI API with dynamic config
      const aiApiClient = axios.create({
        baseURL: aiApiUrl,
        timeout: apiTimeout,
      });

      const response = await aiApiClient.post<PersonalColorResult>(
        `/analyze${debug ? '?debug=true' : ''}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      if (import.meta.env.DEV) {
        console.log('API response:', response.data);
      }
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('API call failed:', error);
      }
      
      if (axios.isAxiosError(error)) {
        if (import.meta.env.DEV) {
          console.error('Axios error details:', {
            message: error.message,
            code: error.code,
            response: error.response?.data,
            status: error.response?.status,
          });
        }
        
        // Handle timeout with retry
        if (error.code === 'ECONNABORTED' && retryCount < 1) {
          if (import.meta.env.DEV) {
            console.log('Timeout occurred, retrying...');
          }
          // Wait 2 seconds before retry
          await new Promise(resolve => setTimeout(resolve, 2000));
          return this.analyzeImage(file, debug, retryCount + 1);
        }
        
        if (error.code === 'ECONNABORTED') {
          throw new Error('분석에 시간이 오래 걸리고 있습니다. 다시 시도해주세요.');
        }
        if (error.code === 'ECONNREFUSED') {
          throw new Error('AI 분석 서비스에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
        }
        if (error.response?.status === 500) {
          throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
        if (error.response?.status === 413) {
          throw new Error('파일 크기가 너무 큽니다. 10MB 이하의 파일을 업로드해주세요.');
        }
      }
      
      // Re-throw with more context
      throw new Error(`Image analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Health check for the API
   * @returns Promise<{ status: string; service: string }>
   */
  static async healthCheck(): Promise<{ status: string; service: string }> {
    const aiApiUrl = getAIApiUrl();
    const useMockAI = shouldUseMockAI();
    
    if (useMockAI) {
      return { status: 'ok', service: 'mock-ai' };
    }

    const aiApiClient = axios.create({
      baseURL: aiApiUrl,
      timeout: 5000,
    });
    
    const response = await aiApiClient.get<{ status: string; service: string }>('/health');
    return response.data;
  }
}