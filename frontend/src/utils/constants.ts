// API Configuration with security-first approach
// Check multiple possible env var names for backwards compatibility
const envApiUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;

// Secure API URL configuration
export const API_BASE_URL = (() => {
  if (envApiUrl) {
    const url = envApiUrl.endsWith('/api') ? envApiUrl : `${envApiUrl}/api`;
    
    // Security check: Ensure HTTPS in production
    if (import.meta.env.MODE === 'production' && !url.startsWith('https://')) {
      throw new Error(`API_BASE_URL must use HTTPS in production. Got: ${url}`);
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
    // Security check: Ensure HTTPS in production
    if (import.meta.env.MODE === 'production' && !envAiUrl.startsWith('https://')) {
      throw new Error(`AI_API_URL must use HTTPS in production. Got: ${envAiUrl}`);
    }
    
    return envAiUrl;
  }
  
  // Environment-specific fallbacks
  if (import.meta.env.MODE === 'production') {
    throw new Error('VITE_AI_API_URL environment variable is required in production');
  } else {
    // Development fallback only
    return 'http://localhost:8000';
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

// Analysis Steps
export const ANALYSIS_STEPS = [
  {
    id: 'skin-analysis',
    icon: '🎨',
    message: 'Analyzing skin undertones...',
    progress: 20,
    duration: 1250,
  },
  {
    id: 'saturation-calculation',
    icon: '🌈',
    message: 'Calculating your ideal saturation levels...',
    progress: 45,
    duration: 1250,
  },
  {
    id: 'tone-analysis',
    icon: '✨',
    message: 'Analyzing overall tone through contrast...',
    progress: 70,
    duration: 1250,
  },
  {
    id: 'palette-generation',
    icon: '🎨',
    message: 'Generating your optimal color palette...',
    progress: 90,
    duration: 1250,
  },
  {
    id: 'completion',
    icon: '✅',
    message: 'Your results are ready!',
    progress: 100,
    duration: 500,
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