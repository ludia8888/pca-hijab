import { apiClient } from './client';
import type { PersonalColorResult } from '@/types';

export interface SessionResponse {
  success: boolean;
  message: string;
  data: {
    sessionId: string;
    instagramId: string;
  };
}

export interface SessionDetails {
  id: string;
  instagramId: string;
  uploadedImageUrl?: string;
  analysisResult?: PersonalColorResult;
  createdAt: string;
  updatedAt?: string;
}

export interface SessionUpdateData {
  uploadedImageUrl?: string;
  analysisResult?: PersonalColorResult;
}

export class SessionAPI {
  /**
   * Create a new session with retry logic
   * @param instagramId - Instagram ID
   * @returns Promise<SessionResponse>
   */
  static async createSession(instagramId: string): Promise<SessionResponse> {
    // First, try to check if backend is reachable
    try {
      const healthCheck = await apiClient.get('/health').catch(() => null);
      console.log('[Session API] Health check result:', healthCheck?.data);
    } catch (e) {
      console.warn('[Session API] Health check failed, continuing anyway');
    }
    
    let lastError: unknown;
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await apiClient.post<SessionResponse>('/sessions', {
          instagramId
        });
        return response.data;
      } catch (error) {
        lastError = error;
        console.warn(`Session creation attempt ${attempt} failed:`, error);
        
        // Don't retry on client errors (4xx)
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { status?: number } };
          if (axiosError.response?.status && axiosError.response.status >= 400 && axiosError.response.status < 500) {
            throw error;
          }
        }
        
        // Wait before retrying (exponential backoff)
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, attempt * 1000));
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Get session details
   * @param sessionId - Session ID
   * @returns Promise<{ success: boolean; data: SessionDetails }>
   */
  static async getSession(sessionId: string): Promise<{
    success: boolean;
    data: SessionDetails;
  }> {
    const response = await apiClient.get(`/sessions/${sessionId}`);
    return response.data;
  }

  /**
   * Update session with analysis results and/or uploaded image URL
   * @param sessionId - Session ID
   * @param updateData - Data to update (uploadedImageUrl and/or analysisResult)
   * @returns Promise<{ success: boolean; data: SessionDetails }>
   */
  static async updateSession(
    sessionId: string,
    updateData: SessionUpdateData
  ): Promise<{
    success: boolean;
    data: SessionDetails;
  }> {
    const response = await apiClient.patch(`/sessions/${sessionId}`, updateData);
    return response.data;
  }
}