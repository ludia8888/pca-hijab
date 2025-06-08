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
    console.log('Analyzing image:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: new Date(file.lastModified).toISOString()
    });
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiClient.post<PersonalColorResult>(
        `/analyze${debug ? '?debug=true' : ''}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      console.log('Analysis response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
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