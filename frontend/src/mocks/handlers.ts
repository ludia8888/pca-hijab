import { http, HttpResponse } from 'msw';

// Mock 응답 데이터
const mockAnalysisResponse = {
  status: 'success',
  data: {
    season: 'fall',
    tone: {
      name: '가을 웜톤',
      characteristics: [
        '따뜻하고 부드러운 톤',
        '황색 베이스의 피부톤',
        '골드 계열 액세서리가 잘 어울림'
      ]
    },
    bestColors: [
      { 
        hex: '#8B4513', 
        name: '새들 브라운',
        description: '깊고 따뜻한 브라운'
      },
      { 
        hex: '#D2691E', 
        name: '초콜릿',
        description: '부드러운 초콜릿 컬러'
      },
      { 
        hex: '#CD853F', 
        name: '페루',
        description: '따뜻한 베이지 브라운'
      },
      { 
        hex: '#F4A460', 
        name: '샌디 브라운',
        description: '부드러운 모래색'
      }
    ],
    avoidColors: [
      { hex: '#FF1493', name: '딥 핑크' },
      { hex: '#00CED1', name: '다크 터콰이즈' },
      { hex: '#9370DB', name: '미디엄 퍼플' }
    ],
    confidence: 0.92
  }
};

const mockRecommendationResponse = {
  status: 'success',
  message: '추천이 성공적으로 등록되었습니다.',
  data: {
    recommendationId: 'rec_' + Date.now()
  }
};

// MSW 핸들러
export const handlers = [
  // POST /api/analyze
  http.post('/api/analyze', async ({ request }) => {
    // 요청 바디 파싱
    const formData = await request.formData();
    const file = formData.get('file'); // 'file'로 변경
    
    // 이미지가 없으면 에러 응답
    if (!file) {
      return HttpResponse.json(
        { 
          status: 'error', 
          message: '이미지가 필요합니다.' 
        },
        { status: 400 }
      );
    }

    // 2초 지연 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 성공 응답
    return HttpResponse.json(mockAnalysisResponse);
  }),

  // POST /api/recommend
  http.post('/api/recommend', async ({ request }) => {
    const data = await request.json() as any;
    
    // 필수 필드 검증
    if (!data?.sessionId || !data?.instagramId || !data?.preferences) {
      return HttpResponse.json(
        {
          status: 'error',
          message: '필수 정보가 누락되었습니다.'
        },
        { status: 400 }
      );
    }

    // 0.5초 지연
    await new Promise(resolve => setTimeout(resolve, 500));

    return HttpResponse.json(mockRecommendationResponse);
  }),

  // GET /api/health (헬스체크)
  http.get('/api/health', () => {
    return HttpResponse.json({ 
      status: 'ok',
      timestamp: new Date().toISOString()
    });
  })
];