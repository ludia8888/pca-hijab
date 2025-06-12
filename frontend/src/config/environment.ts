// Environment configuration
export const env = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // API URLs
  aiApiUrl: import.meta.env.VITE_AI_API_URL || 'http://localhost:8000',
  backendApiUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api',
  
  // Features
  enableDebug: import.meta.env.VITE_ENABLE_DEBUG === 'true',
  
  // Analytics (optional)
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
};

// Validate required environment variables
if (env.isProduction) {
  const required = ['VITE_AI_API_URL', 'VITE_API_BASE_URL'];
  const missing = required.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}