import { describe, it, expect } from 'vitest';
import { PersonalColorAPI } from '../personalColor';
import { server } from '@/mocks/server';
import { http, HttpResponse } from 'msw';

describe('PersonalColorAPI', () => {
  describe('analyzeImage', () => {
    it('should successfully analyze an image', async () => {
      // 테스트용 이미지 파일 생성
      const testFile = new File(['test image content'], 'test.jpg', { 
        type: 'image/jpeg' 
      });

      // API 호출
      const result = await PersonalColorAPI.analyzeImage(testFile);

      // 결과 검증
      expect(result).toBeDefined();
      expect(result.status).toBe('success');
      expect(result.data).toBeDefined();
      expect(result.data.season).toBe('fall');
      expect(result.data.tone.name).toBe('가을 웜톤');
      expect(result.data.bestColors).toHaveLength(4);
      expect(result.data.confidence).toBeGreaterThan(0);
    });

    it('should handle image analysis with debug flag', async () => {
      const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      const result = await PersonalColorAPI.analyzeImage(testFile, true);

      expect(result.status).toBe('success');
    });

    it('should handle missing image error', async () => {
      // 에러 응답을 위한 커스텀 핸들러
      server.use(
        http.post('/api/analyze', () => {
          return HttpResponse.json(
            { status: 'error', message: '이미지가 필요합니다.' },
            { status: 400 }
          );
        })
      );

      // 빈 파일로 테스트
      const emptyFile = new File([], 'empty.jpg', { type: 'image/jpeg' });

      await expect(PersonalColorAPI.analyzeImage(emptyFile)).rejects.toThrow();
    });

    it('should handle server errors', async () => {
      // 서버 에러 시뮬레이션
      server.use(
        http.post('/api/analyze', () => {
          return HttpResponse.json(
            { status: 'error', message: '서버 오류가 발생했습니다.' },
            { status: 500 }
          );
        })
      );

      const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      await expect(PersonalColorAPI.analyzeImage(testFile)).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      // 네트워크 에러 시뮬레이션
      server.use(
        http.post('/api/analyze', () => {
          return HttpResponse.error();
        })
      );

      const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      await expect(PersonalColorAPI.analyzeImage(testFile)).rejects.toThrow();
    });
  });

  describe('healthCheck', () => {
    it('should successfully perform health check', async () => {
      const result = await PersonalColorAPI.healthCheck();

      expect(result).toBeDefined();
      expect(result.status).toBe('ok');
      expect(result.timestamp).toBeDefined();
    });

    it('should handle health check failure', async () => {
      // 헬스체크 실패 시뮬레이션
      server.use(
        http.get('/api/health', () => {
          return HttpResponse.json(
            { status: 'error', message: 'Service unavailable' },
            { status: 503 }
          );
        })
      );

      await expect(PersonalColorAPI.healthCheck()).rejects.toThrow();
    });
  });
});