// Dynamic API configuration that can handle initial load issues
export function getAIApiUrl(): string {
  // Try to get from environment variable first
  const envUrl = import.meta.env.VITE_AI_API_URL;
  
  // If environment variable exists and is not empty, use it
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl;
  }
  
  // Environment-specific fallback
  if (import.meta.env.PROD) {
    // In production, throw error instead of falling back to insecure HTTP
    throw new Error('VITE_AI_API_URL environment variable is required in production');
  }
  
  // Development fallback only
  return 'http://localhost:8000';
}

export function shouldUseMockAI(): boolean {
  // Only use mock if explicitly set to 'true'
  return import.meta.env.VITE_USE_MOCK_AI === 'true';
}

export function getApiTimeout(fileSizeMB?: number): number {
  // Base timeout of 15 seconds (reasonable for most cases)
  const baseTimeout = 15000;
  
  // If no file size provided, return base timeout
  if (!fileSizeMB) {
    return baseTimeout;
  }
  
  // Add 3 seconds for every MB over 1MB
  // But cap at 30 seconds total (more than enough)
  const additionalTime = Math.floor((fileSizeMB - 1) * 3000);
  const dynamicTimeout = baseTimeout + additionalTime;
  
  return Math.min(dynamicTimeout, 30000); // Max 30 seconds
}

// Debug function to check API configuration
export function debugApiConfig(): void {
  console.group('🔧 API Configuration');
  console.log('AI API URL:', getAIApiUrl());
  console.log('Use Mock AI:', shouldUseMockAI());
  console.log('API Timeout:', getApiTimeout());
  console.log('Environment Variables:', {
    VITE_AI_API_URL: import.meta.env.VITE_AI_API_URL,
    VITE_USE_MOCK_AI: import.meta.env.VITE_USE_MOCK_AI,
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  });
  console.groupEnd();
}