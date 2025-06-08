// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
export const AI_API_URL = import.meta.env.VITE_AI_API_URL || 'http://localhost:8000';
export const API_TIMEOUT = 30000; // 30 seconds
export const USE_MOCK_AI = import.meta.env.VITE_USE_MOCK_AI === 'true' || !import.meta.env.VITE_AI_API_URL;

// File Upload
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ACCEPTED_IMAGE_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic'];
export const ACCEPTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.heic'];

// Analysis Steps
export const ANALYSIS_STEPS = [
  {
    id: 'skin-analysis',
    icon: '🎨',
    message: '피부의 노란기를 분석 중입니다...',
    progress: 20,
    duration: 5000,
  },
  {
    id: 'saturation-calculation',
    icon: '🌈',
    message: '당신에게 어울리는 채도를 계산 중입니다...',
    progress: 45,
    duration: 5000,
  },
  {
    id: 'tone-analysis',
    icon: '✨',
    message: '명도 대비를 통해 전체 톤을 분석하고 있어요...',
    progress: 70,
    duration: 5000,
  },
  {
    id: 'palette-generation',
    icon: '🎨',
    message: '최적의 컬러 팔레트를 생성하고 있어요...',
    progress: 90,
    duration: 5000,
  },
  {
    id: 'completion',
    icon: '✅',
    message: '곧 결과를 확인할 수 있어요!',
    progress: 100,
    duration: 2000,
  },
];

// Routes
export const ROUTES = {
  HOME: '/',
  UPLOAD: '/upload',
  ANALYZING: '/analyzing',
  RESULT: '/result',
  RECOMMENDATION: '/recommendation',
  COMPLETION: '/completion',
} as const;

// Personal Color Descriptions
export const SEASON_DESCRIPTIONS = {
  spring: {
    ko: '봄 웜톤',
    en: 'Spring Warm',
    description: '맑고 생기 있는 따뜻한 색감이 어울리는 타입',
  },
  summer: {
    ko: '여름 쿨톤',
    en: 'Summer Cool',
    description: '부드럽고 차분한 시원한 색감이 어울리는 타입',
  },
  autumn: {
    ko: '가을 웜톤',
    en: 'Autumn Warm',
    description: '깊고 풍부한 따뜻한 색감이 어울리는 타입',
  },
  winter: {
    ko: '겨울 쿨톤',
    en: 'Winter Cool',
    description: '선명하고 대비가 강한 시원한 색감이 어울리는 타입',
  },
} as const;

// Form Steps
export const RECOMMENDATION_STEPS = [
  { id: 'material', title: '희망하는 히잡 소재를 선택해주세요' },
  { id: 'transparency', title: '원하시는 비침 정도를 선택해주세요' },
  { id: 'price', title: '희망 가격대를 선택해주세요' },
  { id: 'fit', title: '선호하는 착용감을 선택해주세요' },
  { id: 'color', title: '좋아하는 색상 스타일을 선택해주세요' },
  { id: 'notes', title: '추가로 원하시는 사항이 있으신가요?' },
];

// Validation Messages
export const VALIDATION_MESSAGES = {
  INSTAGRAM_ID_REQUIRED: '인스타그램 ID를 입력해주세요',
  INSTAGRAM_ID_INVALID: '올바른 인스타그램 ID 형식이 아닙니다',
  FILE_REQUIRED: '사진을 업로드해주세요',
  FILE_TOO_LARGE: '파일 크기는 10MB 이하여야 합니다',
  FILE_INVALID_TYPE: 'JPG, PNG, HEIC 형식의 이미지만 업로드 가능합니다',
  FACE_NOT_DETECTED: '얼굴을 찾을 수 없습니다. 정면 사진을 업로드해주세요',
  NETWORK_ERROR: '네트워크 연결을 확인해주세요',
  SERVER_ERROR: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요',
};