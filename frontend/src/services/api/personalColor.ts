import axios from 'axios';
import type { PersonalColorResult } from '@/types';
import { AI_API_URL, USE_MOCK_AI, API_TIMEOUT } from '@/utils/constants';

// Mock data for development/demo
const MOCK_RESULTS: PersonalColorResult[] = [
  {
    personal_color: '봄 웜톤',
    personal_color_en: 'spring' as const,
    tone: '웜톤',
    tone_en: 'warm' as const,
    confidence: 87.5,
    best_colors: ['#FFB3BA', '#FFCC99', '#FFFFCC', '#CCFFCC'],
    worst_colors: ['#4A4A4A', '#000080', '#800080', '#2F4F4F'],
  },
  {
    personal_color: '여름 쿨톤',
    personal_color_en: 'summer' as const,
    tone: '쿨톤',
    tone_en: 'cool' as const,
    confidence: 92.3,
    best_colors: ['#E6E6FA', '#FFE4E1', '#F0E68C', '#DDA0DD'],
    worst_colors: ['#FF4500', '#FF6347', '#DC143C', '#8B4513'],
  },
  {
    personal_color: '가을 웜톤',
    personal_color_en: 'autumn' as const,
    tone: '웜톤',
    tone_en: 'warm' as const,
    confidence: 85.2,
    best_colors: ['#CD853F', '#D2691E', '#B8860B', '#8B4513'],
    worst_colors: ['#FF69B4', '#FF1493', '#C71585', '#DB7093'],
  },
  {
    personal_color: '겨울 쿨톤',
    personal_color_en: 'winter' as const,
    tone: '쿨톤',
    tone_en: 'cool' as const,
    confidence: 90.8,
    best_colors: ['#4169E1', '#0000CD', '#191970', '#000080'],
    worst_colors: ['#FFD700', '#FFA500', '#FF8C00', '#FF7F50'],
  },
];

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

    // Use mock data if AI API is not available
    if (USE_MOCK_AI) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Return random mock result
      const mockResult = MOCK_RESULTS[Math.floor(Math.random() * MOCK_RESULTS.length)];
      return mockResult;
    }

    try {
      // Create separate axios instance for AI API
      const aiApiClient = axios.create({
        baseURL: AI_API_URL,
        timeout: API_TIMEOUT,
      });

      const response = await aiApiClient.post<PersonalColorResult>(
        `/analyze${debug ? '?debug=true' : ''}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
        throw new Error('AI 분석 서비스에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
      }
      throw error;
    }
  }

  /**
   * Health check for the API
   * @returns Promise<{ status: string; service: string }>
   */
  static async healthCheck(): Promise<{ status: string; service: string }> {
    if (USE_MOCK_AI) {
      return { status: 'ok', service: 'mock-ai' };
    }

    const aiApiClient = axios.create({
      baseURL: AI_API_URL,
      timeout: 5000,
    });
    
    const response = await aiApiClient.get<{ status: string; service: string }>('/health');
    return response.data;
  }
}