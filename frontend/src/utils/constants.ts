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
    message: '얼굴의 6개 부위를 정밀하게 스캔하고 있어요! 양쪽 볼, 눈썹, 눈을 찾아내는 중이에요 🕵️‍♀️',
    progress: 20,
    duration: 1500,
    techExplanation: '딥러닝 얼굴 감지 알고리즘으로 68개 랜드마크 포인트를 분석해요'
  },
  {
    id: 'color-extraction',
    character: 'scientist',
    characterImage: '/images/characters/scientist-extracting.png', // 과학자 캐릭터 이미지
    speechBubble: '/images/speech-bubbles/bubble-2.png',
    message: '각 부위에서 가장 대표적인 색상 4개씩을 추출하고 있어요! 첨단 컬러 클러스터링 기술이에요 🔬',
    progress: 40,
    duration: 1500,
    techExplanation: 'K-means 클러스터링으로 주요 색상을 추출하고 히스토그램 분석을 진행해요'
  },
  {
    id: 'color-space-conversion',
    character: 'wizard',
    characterImage: '/images/characters/wizard-converting.png', // 마법사 캐릭터 이미지  
    speechBubble: '/images/speech-bubbles/bubble-3.png',
    message: 'RGB 색상을 Lab과 HSV 색공간으로 변환하는 마법을 부리고 있어요! ✨🎨',
    progress: 60,
    duration: 1500,
    techExplanation: 'ColorMath 라이브러리로 정확한 색상 수치 변환을 수행해요'
  },
  {
    id: 'warm-cool-analysis',
    character: 'analyst',
    characterImage: '/images/characters/analyst-thinking.png', // 분석가 캐릭터 이미지
    speechBubble: '/images/speech-bubbles/bubble-4.png',
    message: 'Lab_b 수치로 웜톤과 쿨톤을 판별하고 있어요! 과학적 기준값과 거리를 계산 중이에요 📊',
    progress: 80,
    duration: 1500,
    techExplanation: '웜톤(11.65) vs 쿨톤(4.64) 기준값과의 유클리드 거리를 계산해요'
  },
  {
    id: 'final-classification',
    character: 'artist',
    characterImage: '/images/characters/artist-creating.png', // 아티스트 캐릭터 이미지
    speechBubble: '/images/speech-bubbles/bubble-5.png',
    message: 'HSV 채도값으로 최종 타입을 결정하고 당신만의 컬러 팔레트를 완성하고 있어요! 🎨✨',
    progress: 100,
    duration: 1000,
    techExplanation: '봄(18.59), 여름(12.5), 가을(27.14), 겨울(16.74) 기준으로 최적 매칭해요'
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