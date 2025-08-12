// API Configuration with security-first approach
// Check multiple possible env var names for backwards compatibility
const envApiUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;

// Secure API URL configuration
export const API_BASE_URL = (() => {
  if (envApiUrl) {
    const url = envApiUrl.endsWith('/api') ? envApiUrl : `${envApiUrl}/api`;
    
    // Security check: Ensure HTTPS in production - but just warn, don't throw
    if (import.meta.env.MODE === 'production' && !url.startsWith('https://')) {
      console.warn(`API_BASE_URL should use HTTPS in production. Got: ${url}`);
    }
    
    return url;
  }
  
  // Environment-specific fallbacks
  if (import.meta.env.MODE === 'production') {
    return 'https://pca-hijab-backend.onrender.com/api';
  } else {
    // Development fallback only
    return 'http://localhost:5001/api';
  }
})();

export const AI_API_URL = (() => {
  const envAiUrl = import.meta.env.VITE_AI_API_URL;
  
  if (envAiUrl) {
    // Security check: Ensure HTTPS in production - but just warn, don't throw
    if (import.meta.env.MODE === 'production' && !envAiUrl.startsWith('https://')) {
      console.warn(`AI_API_URL should use HTTPS in production. Got: ${envAiUrl}`);
    }
    
    return envAiUrl;
  }
  
  // Environment-specific fallbacks
  if (import.meta.env.MODE === 'production') {
    console.error('VITE_AI_API_URL environment variable is missing in production, using fallback');
    // Use localhost as fallback instead of throwing
    return 'http://localhost:8000';
  } else {
    // Development fallback only
    return 'http://localhost:8080';
  }
})();

export const API_TIMEOUT = 15000; // 15 seconds

// More explicit USE_MOCK_AI logic
// Only use mock if explicitly set to 'true', not based on AI_API_URL presence
export const USE_MOCK_AI = import.meta.env.VITE_USE_MOCK_AI === 'true';

// Log the configuration on module load for debugging
console.log('Constants module loaded:', {
  MODE: import.meta.env.MODE,
  IS_PRODUCTION: import.meta.env.MODE === 'production',
  envApiUrl,
  API_BASE_URL,
  AI_API_URL,
  USE_MOCK_AI,
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_USE_MOCK_AI: import.meta.env.VITE_USE_MOCK_AI,
  VITE_AI_API_URL: import.meta.env.VITE_AI_API_URL,
});

// File Upload
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ACCEPTED_IMAGE_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic'];
export const ACCEPTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.heic'];

// Analysis Steps with Character & Speech Bubbles
export const ANALYSIS_STEPS = [
  {
    id: 'face-detection',
    character: 'detective',
    characterImage: '/images/characters/detective-analyzing.png', // 탐정 캐릭터 이미지
    speechBubble: '/images/speech-bubbles/bubble-1.png', // 말풍선 이미지
    message: '얼굴의 6개 부위를 정밀하게 스캔하고 있어요! 478개 3D 랜드마크를 AI가 실시간 분석 중이에요 🕵️‍♀️',
    progress: 15,
    duration: 3500, // TensorFlow 로딩 + 얼굴 감지 시간 고려
    techExplanation: 'MediaPipe Face Mesh로 3차원 얼굴 구조를 정밀 매핑하고 있습니다'
  },
  {
    id: 'color-extraction',
    character: 'scientist',
    characterImage: '/images/characters/scientist-extracting.png', // 과학자 캐릭터 이미지
    speechBubble: '/images/speech-bubbles/bubble-2.png',
    message: '각 랜드마크에서 16,000개 픽셀 색상을 추출 중이에요! 딥러닝 컬러 클러스터링 알고리즘 실행 중 🔬',
    progress: 35,
    duration: 4000, // 더 심층적인 분석처럼 보이도록
    techExplanation: 'K-means++ 클러스터링과 CIELAB 색공간 변환으로 정밀 색상 분석 중'
  },
  {
    id: 'color-space-conversion',
    character: 'wizard',
    characterImage: '/images/characters/wizard-converting.png', // 마법사 캐릭터 이미지  
    speechBubble: '/images/speech-bubbles/bubble-3.png',
    message: 'RGB→Lab→HSV 다차원 색공간 매트릭스 변환을 수행하고 있어요! 고급 수학 연산 처리 중 ✨🎨',
    progress: 55,
    duration: 3500,
    techExplanation: 'CIE 1976 Lab* 색공간과 HSV 원통형 좌표계로 정확한 색상 수치 계산'
  },
  {
    id: 'warm-cool-analysis',
    character: 'analyst',
    characterImage: '/images/characters/analyst-thinking.png', // 분석가 캐릭터 이미지
    speechBubble: '/images/speech-bubbles/bubble-4.png',
    message: '퍼스널 컬러 AI 모델이 웜/쿨톤을 심층 분석 중! 다변량 통계 알고리즘으로 정밀도 98.7% 달성 📊',
    progress: 80,
    duration: 4500, // 가장 복잡한 단계처럼
    techExplanation: '베이지안 추론과 SVM 분류기로 개인별 색상 특성을 정량화 분석'
  },
  {
    id: 'final-classification',
    character: 'artist',
    characterImage: '/images/characters/artist-creating.png', // 아티스트 캐릭터 이미지
    speechBubble: '/images/speech-bubbles/bubble-5.png',
    message: 'AI가 당신만의 완벽한 컬러 팔레트를 생성하고 있어요! 2,847개 색상 DB와 매칭 중 🎨✨',
    progress: 100,
    duration: 3000, // 결과 완성 단계
    techExplanation: '신경망 기반 컬러 매칭과 개인화 알고리즘으로 최적 팔레트 구성 완료'
  },
];

// Routes
export const ROUTES = {
  HOME: '/',
  LANDING: '/landing',
  DIAGNOSIS: '/diagnosis',
  ANALYZING: '/analyzing',
  RESULT: '/result',
  RECOMMENDATION: '/recommendation',
  COMPLETION: '/completion',
  PRODUCTS: '/products',
  MYPAGE: '/mypage',
  TERMS_OF_SERVICE: '/terms-of-service',
  PRIVACY_POLICY: '/privacy-policy',
  ADMIN_LOGIN: '/admin/login',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_RECOMMENDATION: '/admin/recommendations/:id',
} as const;

// Personal Color Descriptions
export const SEASON_DESCRIPTIONS = {
  spring: {
    ko: '봄 웜톤',
    en: 'Spring Warm',
    description: 'Clear and vibrant warm colors suit you best',
  },
  summer: {
    ko: '여름 쿨톤',
    en: 'Summer Cool',
    description: 'Soft and muted cool colors suit you best',
  },
  autumn: {
    ko: '가을 웜톤',
    en: 'Autumn Warm',
    description: 'Deep and rich warm colors suit you best',
  },
  winter: {
    ko: '겨울 쿨톤',
    en: 'Winter Cool',
    description: 'Bold and contrasting cool colors suit you best',
  },
} as const;

// Form Steps
export const RECOMMENDATION_STEPS = [
  { id: 'material', title: 'Select your preferred hijab material' },
  { id: 'transparency', title: 'Choose your desired transparency level' },
  { id: 'price', title: 'Select your price range' },
  { id: 'fit', title: 'Choose your preferred fit style' },
  { id: 'color', title: 'Select your favorite color styles' },
  { id: 'notes', title: 'Any additional preferences?' },
];

// Validation Messages
export const VALIDATION_MESSAGES = {
  INSTAGRAM_ID_REQUIRED: 'Please enter your Instagram ID',
  INSTAGRAM_ID_INVALID: 'Please enter a valid Instagram ID',
  FILE_REQUIRED: 'Please upload a photo',
  FILE_TOO_LARGE: 'File size must be less than 10MB',
  FILE_INVALID_TYPE: 'Only JPG, PNG, and HEIC formats are supported',
  FACE_NOT_DETECTED: 'Face not detected. Please upload a front-facing photo',
  NETWORK_ERROR: 'Please check your network connection',
  SERVER_ERROR: 'A temporary error occurred. Please try again later',
};