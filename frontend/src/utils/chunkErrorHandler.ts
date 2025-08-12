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
      return await importFn();
    } catch (error) {
      lastError = error as Error;
      
      // Check if it's a chunk loading error
      const isChunkError = error instanceof Error && (
        error.message.includes('Loading chunk') ||
        error.message.includes('Failed to fetch dynamically imported module') ||
        error.message.includes('Loading CSS chunk')
      );
      
      if (!isChunkError) {
        throw error; // Re-throw non-chunk errors immediately
      }
      
      console.warn(`Chunk loading attempt ${attempt + 1} failed:`, error.message);
      
      if (attempt < maxRetries) {
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        console.log(`Retrying chunk load in ${retryDelay}ms...`);
      }
    }
  }
  
  // If all retries failed, try cache-busting reload as last resort
  console.error('All chunk loading attempts failed. Attempting cache-busting reload.', lastError);
  
  // Try to reload with cache busting
  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.set('_cb', Date.now().toString());
  
  // Give user option to reload with cache busting
  const shouldReload = confirm(
    'Resource loading failed. Would you like to refresh the page to try again?'
  );
  
  if (shouldReload) {
    window.location.href = currentUrl.toString();
    return; // This won't execute, but TypeScript needs it
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