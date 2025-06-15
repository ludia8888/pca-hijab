import { apiClient } from './client';
import { useAppStore } from '@/store';
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
      const sessionId = data.sessionId || useAppStore.getState().sessionId;
      
      if (!sessionId) {
        throw new Error('Session ID not found');
      }
      
      // Transform personalColorResult to match backend expectations
      const transformedPersonalColorResult = {
        ...data.personalColorResult,
        season: data.personalColorResult.personal_color_en,
        tone: data.personalColorResult.tone_en || 
              (data.personalColorResult.personal_color_en === 'spring' || 
               data.personalColorResult.personal_color_en === 'autumn' ? 'warm' : 'cool')
      };
      
      // Log the data being sent
      const requestData = {
        sessionId,
        instagramId: data.instagramId,
        personalColorResult: transformedPersonalColorResult,
        userPreferences: data.preferences
      };
      
      console.log('Sending recommendation request:', requestData);
      
      const response = await apiClient.post<RecommendationResponse>(
        '/api/recommendations',
        requestData
      );
      return response.data;
    } catch (error: any) {
      console.error('Recommendation submission error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        request: error.request,
        code: error.code,
        config: error.config
      });
      // Re-throw the error to see what's actually happening
      throw error;
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
        `/api/recommendations/${recommendationId}/status`
      );
      return response.data;
    } catch {
      // Return mock status for MVP
      return {
        status: 'pending',
        updatedAt: new Date().toISOString()
      };
    }
  }
}