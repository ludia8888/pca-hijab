import { apiClient } from './client';
import type { Recommendation } from '@/types';

interface AdminStatistics {
  total: number;
  byStatus: {
    pending: number;
    processing: number;
    completed: number;
  };
  byPersonalColor: Record<string, number>;
  recentRequests: Array<{
    id: string;
    instagramId: string;
    personalColor: string;
    status: string;
    createdAt: Date;
  }>;
}

interface RecommendationsResponse {
  recommendations: Recommendation[];
  total: number;
  limit: number;
  offset: number;
}

export class AdminAPI {
  private static getAuthHeaders(apiKey: string): Record<string, string> {
    return {
      'x-api-key': apiKey
    };
  }

  /**
   * Get all recommendations with pagination
   */
  static async getRecommendations(
    apiKey: string,
    params?: {
      status?: 'pending' | 'processing' | 'completed';
      limit?: number;
      offset?: number;
    }
  ): Promise<RecommendationsResponse> {
    const response = await apiClient.get<{ success: boolean; data: RecommendationsResponse }>(
      '/admin/recommendations',
      {
        headers: this.getAuthHeaders(apiKey),
        params
      }
    );
    return response.data.data;
  }

  /**
   * Get single recommendation details
   */
  static async getRecommendation(apiKey: string, id: string): Promise<Recommendation> {
    const response = await apiClient.get<{ success: boolean; data: Recommendation }>(
      `/admin/recommendations/${id}`,
      {
        headers: this.getAuthHeaders(apiKey)
      }
    );
    return response.data.data;
  }

  /**
   * Update recommendation status
   */
  static async updateRecommendationStatus(
    apiKey: string,
    id: string,
    status: 'pending' | 'processing' | 'completed'
  ): Promise<Recommendation> {
    const response = await apiClient.patch<{ success: boolean; data: Recommendation }>(
      `/admin/recommendations/${id}/status`,
      { status },
      {
        headers: this.getAuthHeaders(apiKey)
      }
    );
    return response.data.data;
  }

  /**
   * Get admin statistics
   */
  static async getStatistics(apiKey: string): Promise<AdminStatistics> {
    const response = await apiClient.get<{ success: boolean; data: AdminStatistics }>(
      '/admin/statistics',
      {
        headers: this.getAuthHeaders(apiKey)
      }
    );
    return response.data.data;
  }
}