// Preload utility to ensure environment is ready
export async function preloadEnvironment(): Promise<void> {
  // Force evaluation of environment variables
  const checks = {
    AI_API_URL: import.meta.env.VITE_AI_API_URL,
    USE_MOCK_AI: import.meta.env.VITE_USE_MOCK_AI,
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  };
  
  if (import.meta.env.DEV) {
    console.log('🚀 Preloading environment...');
    console.log('Environment checks:', checks);
  }
  
  // Small delay to ensure everything is loaded
  await new Promise(resolve => setTimeout(resolve, 50));
  
  // Import constants to trigger their initialization
  const constants = await import('@/utils/constants');
  
  if (import.meta.env.DEV) {
    console.log('Constants loaded:', {
      AI_API_URL: constants.AI_API_URL,
      USE_MOCK_AI: constants.USE_MOCK_AI,
    });
  }
}