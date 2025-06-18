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

interface User {
  id: string;
  instagramId: string;
  personalColor: string | null;
  personalColorKo: string | null;
  uploadedImageUrl: string | null;
  requestedAt: string;
  completedAt: string | null;
  status: string;
  hasRecommendation: boolean;
}

interface UsersResponse {
  success: boolean;
  data: User[];
  total: number;
}

export class AdminAPI {
  /**
   * Verify admin API key
   */
  static async verifyApiKey(apiKey: string): Promise<boolean> {
    try {
      const response = await apiClient.get<{ success: boolean }>(
        '/admin/verify',
        {
          headers: this.getAuthHeaders(apiKey)
        }
      );
      return response.data.success;
    } catch {
      return false;
    }
  }

  
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

  /**
   * Get all users
   */
  static async getUsers(apiKey: string): Promise<UsersResponse> {
    const response = await apiClient.get<UsersResponse>(
      '/admin/users',
      {
        headers: this.getAuthHeaders(apiKey)
      }
    );
    return response.data;
  }

  /**
   * Delete a user
   */
  static async deleteUser(apiKey: string, userId: string): Promise<void> {
    await apiClient.delete(
      `/admin/users/${userId}`,
      {
        headers: this.getAuthHeaders(apiKey)
      }
    );
  }
}