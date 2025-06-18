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
   * Create a new session
   * @param instagramId - Instagram ID
   * @returns Promise<SessionResponse>
   */
  static async createSession(instagramId: string): Promise<SessionResponse> {
    const response = await apiClient.post<SessionResponse>('/sessions', {
      instagramId
    });
    return response.data;
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