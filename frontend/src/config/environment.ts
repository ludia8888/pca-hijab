// Environment configuration
export const env = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // API URLs - Environment-specific fallbacks
  aiApiUrl: import.meta.env.VITE_AI_API_URL || 
    (import.meta.env.PROD 
      ? '' // No fallback in production - must be explicitly set
      : 'http://localhost:8000'
    ),
  backendApiUrl: import.meta.env.VITE_API_BASE_URL || 
    (import.meta.env.PROD 
      ? '' // No fallback in production - must be explicitly set
      : 'http://localhost:5001/api'
    ),
  
  // Features
  enableDebug: import.meta.env.VITE_ENABLE_DEBUG === 'true',
  
  // Analytics (optional)
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
};

// Validate required environment variables and security requirements
if (env.isProduction) {
  const required = ['VITE_AI_API_URL', 'VITE_API_BASE_URL'];
  const missing = required.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  // Security validation: Ensure HTTPS in production
  const urls = [
    { name: 'VITE_AI_API_URL', value: env.aiApiUrl },
    { name: 'VITE_API_BASE_URL', value: env.backendApiUrl }
  ];
  
  for (const { name, value } of urls) {
    if (!value) {
      throw new Error(`${name} is required in production`);
    }
    if (!value.startsWith('https://')) {
      throw new Error(`${name} must use HTTPS in production. Got: ${value}`);
    }
  }
  
  console.info('✅ All environment variables validated for production with HTTPS enforcement');
} else {
  console.info('🔧 Development environment - HTTP URLs allowed for local development');
}