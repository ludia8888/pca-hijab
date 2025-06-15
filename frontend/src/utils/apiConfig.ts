// Dynamic API configuration that can handle initial load issues
export function getAIApiUrl(): string {
  // Try to get from environment variable first
  const envUrl = import.meta.env.VITE_AI_API_URL;
  
  // If environment variable exists and is not empty, use it
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl;
  }
  
  // Fallback to localhost
  return 'http://localhost:8000';
}

export function shouldUseMockAI(): boolean {
  // Only use mock if explicitly set to 'true'
  return import.meta.env.VITE_USE_MOCK_AI === 'true';
}

export function getApiTimeout(): number {
  return 15000; // 15 seconds
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