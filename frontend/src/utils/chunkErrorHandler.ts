import React from 'react';

/**
 * Chunk Loading Error Handler
 * Handles dynamic import failures and provides retry mechanisms
 */

interface ChunkRetryOptions {
  maxRetries?: number;
  retryDelay?: number;
}

/**
 * Retry mechanism for failed dynamic imports
 */
export const retryChunkLoad = async <T>(
  importFn: () => Promise<T>,
  options: ChunkRetryOptions = {}
): Promise<T> => {
  const { maxRetries = 2, retryDelay = 1000 } = options;
  
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const module = await importFn();
      
      // Validate that the module has a default export
      if (module && typeof module === 'object' && 'default' in module) {
        return module;
      }
      
      // If module doesn't have default export, return as is
      return module;
    } catch (error) {
      lastError = error as Error;
      
      // Check if it's a chunk loading error
      const isChunkError = error instanceof Error && (
        error.message.includes('Loading chunk') ||
        error.message.includes('Failed to fetch dynamically imported module') ||
        error.message.includes('Loading CSS chunk') ||
        error.message.includes('Cannot read properties of undefined')
      );
      
      if (!isChunkError) {
        throw error; // Re-throw non-chunk errors immediately
      }
      
      console.warn(`Chunk loading attempt ${attempt + 1} failed:`, error.message);
      
      if (attempt < maxRetries) {
        // Clear module cache to force fresh load
        if (window.location.pathname !== '/') {
          // Don't clear cache on home page to prevent infinite loops
          const moduleUrl = error.message.match(/https?:\/\/[^\s]+\.js/)?.[0];
          if (moduleUrl) {
            // Try to clear the specific module from cache
            try {
              delete window.__vite_preload_cache?.[moduleUrl];
            } catch {}
          }
        }
        
        // Wait before retry with exponential backoff
        const delay = retryDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        console.log(`Retrying chunk load in ${delay}ms...`);
      }
    }
  }
  
  // If all retries failed, try cache-busting reload as last resort
  console.error('All chunk loading attempts failed. Attempting cache-busting reload.', lastError);
  
  // Try to reload with cache busting
  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.set('_cb', Date.now().toString());
  
  // For critical errors, automatically reload without asking user
  // This ensures users don't get stuck in broken states
  console.log('🔄 Automatically reloading page with cache busting...');
  
  // Add a flag to prevent infinite reload loops
  const reloadCount = parseInt(sessionStorage.getItem('chunk_reload_count') || '0');
  
  if (reloadCount < 3) {
    sessionStorage.setItem('chunk_reload_count', (reloadCount + 1).toString());
    window.location.href = currentUrl.toString();
    return;
  } else {
    // After 3 auto-reloads, ask user
    sessionStorage.removeItem('chunk_reload_count');
    const shouldReload = confirm(
      'Multiple resource loading failures detected. Would you like to try refreshing the page one more time?'
    );
    
    if (shouldReload) {
      window.location.reload();
      return;
    }
  }
  
  throw new Error(`Failed to load module after ${maxRetries + 1} attempts. Please refresh the page.`);
};

/**
 * Enhanced lazy loading with retry mechanism
 */
export const lazyWithRetry = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> => {
  return React.lazy(() => retryChunkLoad(importFn));
};

// Global chunk error handler
export const setupChunkErrorHandler = (): void => {
  // Handle unhandled promise rejections from chunk loading
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && typeof event.reason.message === 'string') {
      const isChunkError = event.reason.message.includes('Loading chunk') ||
                          event.reason.message.includes('Failed to fetch dynamically imported module');
      
      if (isChunkError) {
        console.error('Unhandled chunk loading error:', event.reason);
        // Prevent the error from being logged to console
        event.preventDefault();
        
        // Show user-friendly message
        const shouldReload = confirm(
          'A resource failed to load. Would you like to refresh the page to try again?'
        );
        
        if (shouldReload) {
          window.location.reload();
        }
      }
    }
  });
};