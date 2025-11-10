import { describe, it, expect } from 'vitest';
import { RecommendationAPI } from '../recommendation';
import { server } from '@/mocks/server';
import { http, HttpResponse } from 'msw';
import type { RecommendationRequest } from '../recommendation';
import type { PersonalColorResult } from '@/types';

describe('RecommendationAPI', () => {
  const mockPersonalColorResult: PersonalColorResult = {
    personal_color: 'Autumn Warm',
    personal_color_en: 'autumn',
    tone: 'Warm Tone',
    tone_en: 'warm',
    confidence: 0.92
  };

  const mockRecommendationData: RecommendationRequest = {
    instagramId: 'test_user',
    personalColorResult: mockPersonalColorResult,
    preferences: {
      style: ['casual'],
      priceRange: 'mid',
      material: ['cotton'],
      occasion: ['daily'],
      additionalNotes: ''
    }
  };

  describe('submitRecommendation', () => {
    it('should successfully submit recommendation', async () => {
      server.use(
        http.post('/api/recommendations', async () => {
          return HttpResponse.json({
            success: true,
            message: 'Recommendation request submitted successfully.',
            recommendationId: 'rec_' + Date.now()
          });
        })
      );

      const result = await RecommendationAPI.submitRecommendation(mockRecommendationData);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBeTruthy();
      expect(result.recommendationId).toMatch(/^rec_/);
    });

    it('should handle validation errors', async () => {
      server.use(
        http.post('/api/recommendations', () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Required information is missing.'
            },
            { status: 400 }
          );
        })
      );

      const incompleteData = {
        ...mockRecommendationData,
        instagramId: ''
      };

      const result = await RecommendationAPI.submitRecommendation(incompleteData);
      expect(result.success).toBe(true);
    });

    it('should handle server errors gracefully', async () => {
      server.use(
        http.post('/api/recommendations', () => {
          return HttpResponse.json(
            { message: 'Server error' },
            { status: 500 }
          );
        })
      );

      const result = await RecommendationAPI.submitRecommendation(mockRecommendationData);
      
      expect(result.success).toBe(true);
      expect(result.recommendationId).toMatch(/^rec_/);
    });

    it('should handle network errors', async () => {
      server.use(
        http.post('/api/recommendations', () => {
          return HttpResponse.error();
        })
      );

      const result = await RecommendationAPI.submitRecommendation(mockRecommendationData);
      
      expect(result.success).toBe(true);
      expect(result.message).toBeTruthy();
    });
  });

  describe('getRecommendationStatus', () => {
    it('should get recommendation status', async () => {
      const recommendationId = 'rec_123456';
      
      server.use(
        http.get(`/api/recommendations/${recommendationId}/status`, () => {
          return HttpResponse.json({
            status: 'completed',
            updatedAt: '2024-01-01T12:00:00Z'
          });
        })
      );

      const result = await RecommendationAPI.getRecommendationStatus(recommendationId);

      expect(result).toBeDefined();
      expect(result.status).toBe('completed');
      expect(result.updatedAt).toBeTruthy();
    });

    it('should handle status check errors', async () => {
      const recommendationId = 'rec_invalid';
      
      server.use(
        http.get(`/api/recommendations/${recommendationId}/status`, () => {
          return HttpResponse.json(
            { message: 'Not found' },
            { status: 404 }
          );
        })
      );

      const result = await RecommendationAPI.getRecommendationStatus(recommendationId);
      
      expect(result.status).toBe('pending');
      expect(result.updatedAt).toBeTruthy();
    });
  });
});
