import { http, HttpResponse } from 'msw';

// Shared mock data helpers
const createMockPersonalColorResult = () => ({
  personal_color: '가을 웜톤',
  personal_color_en: 'autumn',
  tone: '따뜻한 톤',
  tone_en: 'warm',
  confidence: 0.92,
  best_colors: ['#D2691E', '#8B4513', '#CD853F', '#A0522D'],
  worst_colors: ['#ADD8E6', '#E0FFFF', '#AFEEEE', '#87CEFA'],
  details: {
    is_warm: 0.78,
    skin_lab_b: 12.3,
    eyebrow_lab_b: 5.6,
    eye_lab_b: 3.4,
    skin_hsv_s: 0.52,
    eyebrow_hsv_s: 0.34,
    eye_hsv_s: 0.29,
  },
  facial_colors: {
    cheek: {
      rgb: [210, 135, 110] as [number, number, number],
      lab: [65.2, 18.4, 23.1] as [number, number, number],
      hsv: [18, 0.47, 0.82] as [number, number, number],
    },
    eyebrow: {
      rgb: [90, 60, 45] as [number, number, number],
      lab: [32.1, 10.2, 15.6] as [number, number, number],
      hsv: [25, 0.5, 0.35] as [number, number, number],
    },
    eye: {
      rgb: [75, 55, 40] as [number, number, number],
      lab: [28.4, 8.1, 12.3] as [number, number, number],
      hsv: [22, 0.47, 0.29] as [number, number, number],
    },
  },
});

// MSW 핸들러
export const handlers = [
  // GET /api/health (헬스체크)
  http.get('/api/health', () => {
    return HttpResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  }),

  // AI API analyze endpoint fallback
  http.post('http://localhost:8000/analyze', async ({ request }) => {
    const url = new URL(request.url);
    const debug = url.searchParams.get('debug') === 'true';

    return HttpResponse.json({
      success: true,
      debug,
      result: createMockPersonalColorResult(),
    });
  }),

  // AI API health endpoint fallback
  http.get('http://localhost:8000/health', () => {
    return HttpResponse.json({ status: 'ok' });
  }),

  // Recommendation submission fallback
  http.post('http://localhost:5001/api/recommendations', async () => {
    return HttpResponse.json({
      success: true,
      message: 'Mock recommendation created',
      recommendationId: `rec_${Date.now()}`,
    });
  }),

  // Recommendation status fallback
  http.get('http://localhost:5001/api/recommendations/:id/status', ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      status: 'completed',
      recommendationId: id,
      updatedAt: new Date().toISOString(),
    });
  }),
];
