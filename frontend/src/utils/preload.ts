// Preload utility to ensure environment is ready
export async function preloadEnvironment(): Promise<void> {
  console.log('[PRELOAD] Starting preloadEnvironment...');
  
  try {
    // Force evaluation of environment variables
    const checks = {
      AI_API_URL: import.meta.env.VITE_AI_API_URL,
      USE_MOCK_AI: import.meta.env.VITE_USE_MOCK_AI,
      API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    };
    
    console.log('[PRELOAD] Environment variables loaded:', checks);
    console.log('[PRELOAD] import.meta.env:', import.meta.env);
    
    // Small delay to ensure everything is loaded
    console.log('[PRELOAD] Waiting 50ms...');
    await new Promise(resolve => setTimeout(resolve, 50));
    console.log('[PRELOAD] Wait complete');
    
    // Import constants to trigger their initialization
    console.log('[PRELOAD] Importing constants...');
    const constants = await import('@/utils/constants');
    console.log('[PRELOAD] Constants imported successfully');
    
    console.log('[PRELOAD] Constants values:', {
      AI_API_URL: constants.AI_API_URL,
      USE_MOCK_AI: constants.USE_MOCK_AI,
      API_BASE_URL: constants.API_BASE_URL,
    });
    
    console.log('[PRELOAD] preloadEnvironment complete');
  } catch (error) {
    console.error('[PRELOAD] Error in preloadEnvironment:', error);
    console.error('[PRELOAD] Stack trace:', error.stack);
    throw error;
  }
}