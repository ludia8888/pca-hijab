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
  hasAnalysis: boolean;
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

  /**
   * Log admin action
   */
  static async logAction(apiKey: string, action: {
    userId: string;
    actionType: string;
    description: string;
    metadata?: any;
  }): Promise<void> {
    await apiClient.post(
      '/admin/actions/log',
      action,
      {
        headers: this.getAuthHeaders(apiKey)
      }
    );
  }

  /**
   * Add note to user
   */
  static async addUserNote(apiKey: string, userId: string, note: {
    content: string;
    tags?: string[];
  }): Promise<any> {
    const response = await apiClient.post(
      `/admin/users/${userId}/notes`,
      note,
      {
        headers: this.getAuthHeaders(apiKey)
      }
    );
    return response.data.data;
  }

  /**
   * Get user notes
   */
  static async getUserNotes(apiKey: string, userId: string): Promise<any[]> {
    const response = await apiClient.get(
      `/admin/users/${userId}/notes`,
      {
        headers: this.getAuthHeaders(apiKey)
      }
    );
    return response.data.data;
  }

  /**
   * Update user status
   */
  static async updateUserStatus(apiKey: string, userId: string, status: string): Promise<void> {
    await apiClient.patch(
      `/admin/users/${userId}/status`,
      { status },
      {
        headers: this.getAuthHeaders(apiKey)
      }
    );
  }

  /**
   * Update user priority
   */
  static async updateUserPriority(apiKey: string, userId: string, priority: string): Promise<void> {
    await apiClient.patch(
      `/admin/users/${userId}/priority`,
      { priority },
      {
        headers: this.getAuthHeaders(apiKey)
      }
    );
  }

  /**
   * Schedule followup
   */
  static async scheduleFollowup(apiKey: string, followup: {
    userId: string;
    scheduledDate: Date;
    type: string;
    notes?: string;
  }): Promise<void> {
    await apiClient.post(
      '/admin/followups',
      followup,
      {
        headers: this.getAuthHeaders(apiKey)
      }
    );
  }

  /**
   * Get unified dashboard data
   */
  static async getDashboardData(apiKey: string): Promise<{ users: any[], total: number }> {
    const response = await apiClient.get<{ success: boolean; data: { users: any[], total: number } }>(
      '/admin/dashboard/data',
      {
        headers: this.getAuthHeaders(apiKey)
      }
    );
    return response.data.data;
  }
}