/**
 * Chunk Preloading Strategy
 * Preloads critical chunks to prevent runtime loading failures
 */

interface PreloadOptions {
  crossOrigin?: 'anonymous' | 'use-credentials';
  as?: 'script' | 'style';
}

/**
 * Preload a resource using link rel="preload"
 */
export const preloadResource = (href: string, options: PreloadOptions = {}): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if already preloaded
    const existing = document.querySelector(`link[href="${href}"]`);
    if (existing) {
      resolve();
      return;
    }

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.crossOrigin = options.crossOrigin || 'anonymous';
    link.as = options.as || 'script';

    link.onload = () => {
      console.log(`✅ Preloaded: ${href}`);
      resolve();
    };

    link.onerror = (error) => {
      console.warn(`⚠️ Failed to preload: ${href}`, error);
      // Don't reject, as preload failure shouldn't break the app
      resolve();
    };

    document.head.appendChild(link);

    // Timeout after 10 seconds
    setTimeout(() => {
      console.warn(`⏱️ Preload timeout: ${href}`);
      resolve();
    }, 10000);
  });
};

/**
 * Get all chunk files from the build manifest
 */
const getChunkUrls = (): string[] => {
  // In production, we need to extract chunk URLs from the actual build
  const scripts = Array.from(document.querySelectorAll('script[src]'));
  const chunkUrls: string[] = [];

  scripts.forEach(script => {
    const src = script.getAttribute('src');
    if (src && src.includes('assets/') && src.endsWith('.js')) {
      chunkUrls.push(src);
    }
  });

  return chunkUrls;
};

/**
 * Preload critical chunks for better reliability
 */
export const preloadCriticalChunks = async (): Promise<void> => {
  console.log('🚀 Starting critical chunk preloading...');

  try {
    // Get all available chunk URLs
    const chunkUrls = getChunkUrls();
    console.log(`Found ${chunkUrls.length} chunks to preload`);

    // Preload critical chunks in parallel
    const preloadPromises = chunkUrls.map(url => 
      preloadResource(url, { crossOrigin: 'anonymous', as: 'script' })
    );

    // Wait for all preloads with timeout
    await Promise.allSettled(preloadPromises);
    console.log('✅ Critical chunk preloading completed');

  } catch (error) {
    console.error('❌ Critical chunk preloading failed:', error);
    // Don't throw, as this is a performance optimization
  }
};

/**
 * Prefetch next likely chunks based on current route
 */
export const prefetchRouteChunks = (currentRoute: string): void => {
  const routeChunkMap: Record<string, string[]> = {
    '/': ['analyzing', 'diagnosis'],
    '/diagnosis': ['analyzing'],
    '/analyzing': ['result'],
    '/result': ['completion']
  };

  const nextChunks = routeChunkMap[currentRoute] || [];
  
  nextChunks.forEach(chunkName => {
    // This is a best-effort prefetch
    try {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = `/assets/${chunkName}.js`; // Approximate URL
      document.head.appendChild(link);
    } catch (error) {
      console.warn(`Failed to prefetch chunk: ${chunkName}`, error);
    }
  });
};