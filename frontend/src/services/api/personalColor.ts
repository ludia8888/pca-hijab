import { apiClient } from './client';
import type { PersonalColorResult } from '@/types';

export class PersonalColorAPI {
  /**
   * Analyzes an image to determine personal color
   * @param file - Image file to analyze
   * @param debug - Include debug information
   * @returns Promise<PersonalColorResult>
   */
  static async analyzeImage(
    file: File,
    debug = false,
  ): Promise<PersonalColorResult> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<PersonalColorResult>(
      `/analyze${debug ? '?debug=true' : ''}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    return response.data;
  }

  /**
   * Health check for the API
   * @returns Promise<{ status: string; service: string }>
   */
  static async healthCheck(): Promise<{ status: string; service: string }> {
    const response = await apiClient.get<{ status: string; service: string }>('/health');
    return response.data;
  }
}