import { apiClient } from './client';

export interface SessionResponse {
  success: boolean;
  message: string;
  data: {
    sessionId: string;
    instagramId: string;
  };
}

export class SessionAPI {
  /**
   * Create a new session
   * @param instagramId - Instagram ID
   * @returns Promise<SessionResponse>
   */
  static async createSession(instagramId: string): Promise<SessionResponse> {
    const response = await apiClient.post<SessionResponse>('/api/sessions', {
      instagramId
    });
    return response.data;
  }

  /**
   * Get session details
   * @param sessionId - Session ID
   * @returns Promise<{ success: boolean; data: { id: string; instagramId: string; createdAt: string } }>
   */
  static async getSession(sessionId: string): Promise<{
    success: boolean;
    data: {
      id: string;
      instagramId: string;
      createdAt: string;
    };
  }> {
    const response = await apiClient.get(`/api/sessions/${sessionId}`);
    return response.data;
  }
}