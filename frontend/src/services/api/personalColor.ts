import axios from 'axios';
import type { PersonalColorResult } from '@/types';
import { getAIApiUrl, shouldUseMockAI, getApiTimeout, debugApiConfig } from '@/utils/apiConfig';

export class PersonalColorAPI {
  /**
   * Compress image before upload for faster processing
   */
  private static async compressImage(file: File, maxSizeMB = 2): Promise<File> {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    
    // If file is already small enough, return as-is
    if (file.size <= maxSizeBytes) {
      return file;
    }
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      img.onload = () => {
        // Calculate new dimensions maintaining aspect ratio
        let { width, height } = img;
        const maxDimension = 1920; // Max width/height for processing
        
        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              console.log(`Image compressed: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(blob.size / 1024 / 1024).toFixed(2)}MB`);
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          0.85 // 85% quality
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }
  
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
    const fileSizeMB = file.size / (1024 * 1024);
    const apiTimeout = getApiTimeout(fileSizeMB);
    
    // Debug logging only in development
    if (import.meta.env.DEV) {
      console.log('analyzeImage called with:', {
        fileName: file.name,
        fileSize: file.size,
        fileSizeMB: fileSizeMB.toFixed(2) + 'MB',
        fileType: file.type,
        aiApiUrl,
        useMockAI,
        apiTimeout: apiTimeout + 'ms',
        debug,
        retryCount,
      });
      
      // Extra debug on first call
      if (retryCount === 0) {
        debugApiConfig();
      }
    }
    
    // Compress image if needed for faster upload and processing
    const processedFile = await this.compressImage(file, 2); // Max 2MB
    
    const formData = new FormData();
    formData.append('file', processedFile);

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
        
        // Preserve original error for better categorization, but provide Korean fallbacks
        if (error.code === 'ECONNABORTED') {
          const timeoutSeconds = Math.round(apiTimeout / 1000);
          const timeoutError = new Error(`분석이 ${timeoutSeconds}초를 초과했습니다. 이미지 크기를 줄이거나 다른 이미지로 시도해주세요.`);
          (timeoutError as any).originalError = error;
          (timeoutError as any).errorType = 'timeout';
          throw timeoutError;
        }
        if (error.code === 'ECONNREFUSED') {
          const connectionError = new Error('AI 분석 서비스에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
          (connectionError as any).originalError = error;
          (connectionError as any).errorType = 'connection_refused';
          throw connectionError;
        }
        
        // For API errors with response data, preserve the original response
        if (error.response?.status === 500) {
          const serverError = new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
          (serverError as any).response = error.response;
          (serverError as any).originalError = error;
          throw serverError;
        }
        if (error.response?.status === 413) {
          const fileSizeError = new Error('파일 크기가 너무 큽니다. 10MB 이하의 파일을 업로드해주세요.');
          (fileSizeError as any).response = error.response;
          (fileSizeError as any).originalError = error;
          throw fileSizeError;
        }
        
        // For other API errors, preserve the response data
        if (error.response) {
          const apiError = new Error(error.response.data?.message || error.response.data?.error || `API Error: ${error.response.status}`);
          (apiError as any).response = error.response;
          (apiError as any).originalError = error;
          throw apiError;
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