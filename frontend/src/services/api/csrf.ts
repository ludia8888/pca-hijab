import { apiClient } from './client';

interface CSRFResponse {
  success: boolean;
  csrfToken: string;
}

let csrfToken: string | null = null;

export const CSRFAPI = {
  // Get CSRF token from server
  getToken: async (): Promise<string> => {
    try {
      const response = await apiClient.get<CSRFResponse>('/csrf-token');
      csrfToken = response.data.csrfToken;
      return csrfToken;
    } catch (error) {
      console.error('Failed to get CSRF token:', error);
      throw error;
    }
  },

  // Get current token
  getCurrentToken: (): string | null => {
    return csrfToken;
  },

  // Clear token
  clearToken: (): void => {
    csrfToken = null;
  }
};