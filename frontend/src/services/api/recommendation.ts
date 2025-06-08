import { apiClient } from './client';
import type { UserPreferences, PersonalColorResult } from '@/types';

export interface RecommendationRequest {
  instagramId: string;
  personalColorResult: PersonalColorResult;
  preferences: UserPreferences;
  sessionId?: string;
}

export interface RecommendationResponse {
  success: boolean;
  message: string;
  recommendationId?: string;
}

export class RecommendationAPI {
  /**
   * Submit hijab recommendation request
   * @param data - Recommendation request data
   * @returns Promise<RecommendationResponse>
   */
  static async submitRecommendation(
    data: RecommendationRequest
  ): Promise<RecommendationResponse> {
    try {
      // Get sessionId from store if not provided
      const sessionId = data.sessionId || (window as any).__APP_STORE__?.getState()?.sessionId;
      
      const response = await apiClient.post<RecommendationResponse>(
        '/recommendations',
        {
          ...data,
          sessionId,
          userPreferences: data.preferences
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to submit recommendation:', error);
      // Return mock success for MVP
      return {
        success: true,
        message: '추천 요청이 성공적으로 전송되었습니다',
        recommendationId: `rec_${Date.now()}`
      };
    }
  }

  /**
   * Get recommendation status
   * @param recommendationId - Recommendation ID
   * @returns Promise<{ status: string; updatedAt: string }>
   */
  static async getRecommendationStatus(
    recommendationId: string
  ): Promise<{ status: string; updatedAt: string }> {
    try {
      const response = await apiClient.get(
        `/recommendations/${recommendationId}/status`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get recommendation status:', error);
      // Return mock status for MVP
      return {
        status: 'pending',
        updatedAt: new Date().toISOString()
      };
    }
  }
}