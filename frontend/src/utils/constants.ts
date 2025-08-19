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
    characterImage: '/images/characters/detective-analyzing.png',
    speechBubble: '/images/speech-bubbles/bubble-1.png',
    message: '얼굴의 478개 포인트를 정밀 스캔 중이에요! AI가 당신의 얼굴 구조를 3D로 분석하고 있어요 🕵️‍♀️',
    progress: 20,
    duration: 4000,
    techExplanation: 'MediaPipe Face Mesh로 얼굴 구조 매핑 중'
  },
  {
    id: 'color-extraction',
    character: 'scientist',
    characterImage: '/images/characters/scientist-extracting.png',
    speechBubble: '/images/speech-bubbles/bubble-2.png',
    message: '피부톤, 홍조, 혈색을 추출하고 있어요! 이마, 볼, 턱에서 색상 데이터를 수집 중이에요 🔬',
    progress: 40,
    duration: 4000,
    techExplanation: '주요 얼굴 부위에서 색상 샘플링 진행 중'
  },
  {
    id: 'warm-cool-comparison',
    character: 'wizard',
    characterImage: '/images/characters/wizard-converting.png',
    speechBubble: '/images/speech-bubbles/bubble-3.png',
    message: '웜톤과 쿨톤을 비교 중이에요! 황색 언더톤과 핑크 언더톤 중 어느 것이 더 어울리는지 분석해요 🎨',
    progress: 60,
    duration: 5000,
    techExplanation: '피부 언더톤과 혈색을 기반으로 웜/쿨 판별'
  },
  {
    id: 'season-comparison',
    character: 'analyst',
    characterImage: '/images/characters/analyst-thinking.png',
    speechBubble: '/images/speech-bubbles/bubble-4.png',
    message: '4계절 중 가장 어울리는 시즌을 찾고 있어요! 명도와 채도를 분석해서 최적의 계절을 선정해요 📊',
    progress: 80,
    duration: 5000,
    techExplanation: '명도, 채도, 대비도를 기반으로 계절 타입 결정'
  },
  {
    id: 'final-result',
    character: 'artist',
    characterImage: '/images/characters/artist-creating.png',
    speechBubble: '/images/speech-bubbles/bubble-5.png',
    message: '당신만의 퍼스널 컬러 팔레트를 완성하고 있어요! 맞춤형 히잡 색상을 추천 준비 중이에요 ✨',
    progress: 100,
    duration: 3000,
    techExplanation: '개인 맞춤 컬러 팔레트 생성 완료'
  },
];

// Personal Color Palettes for Visual Comparison
export const COLOR_PALETTES = {
  warm: {
    base: ['#FF9966', '#FFB366', '#FFCC99'], // 웜톤 기본 색상
    spring: {
      name: '봄 웜톤',
      colors: ['#FF9999', '#FFCC99', '#FFE5CC', '#FFAA88'],
      description: '밝고 선명한 코랄과 피치 계열'
    },
    autumn: {
      name: '가을 웜톤',
      colors: ['#CC6633', '#996633', '#CC9966', '#805533'],
      description: '깊고 차분한 브라운과 오렌지 계열'
    }
  },
  cool: {
    base: ['#FF99CC', '#CC99FF', '#99CCFF'], // 쿨톤 기본 색상
    summer: {
      name: '여름 쿨톤',
      colors: ['#FFB3D9', '#D9B3FF', '#B3D9FF', '#E6CCFF'],
      description: '부드러운 파스텔 핑크와 라벤더 계열'
    },
    winter: {
      name: '겨울 쿨톤',
      colors: ['#FF0066', '#CC0066', '#9900CC', '#0066CC'],
      description: '선명하고 차가운 비비드 톤'
    }
  }
};

// Routes
export const ROUTES = {
  HOME: '/',
  LANDING: '/landing',
  PHOTOGUIDE: '/photoguide',
  DONTWORRY: '/dontworry',
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