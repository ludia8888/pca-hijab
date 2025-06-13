import { http, HttpResponse } from 'msw';

// MSW 핸들러
export const handlers = [
  // GET /api/health (헬스체크)
  http.get('/api/health', () => {
    return HttpResponse.json({ 
      status: 'ok',
      timestamp: new Date().toISOString()
    });
  })
];