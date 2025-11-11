// Enhanced service worker for better caching
const CACHE_VERSION = 'v4-2025-11-11';
const CACHE_NAME = `pca-hijab-${CACHE_VERSION}`;
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `runtime-${CACHE_VERSION}`;

// Don't force clear caches - only remove old versions
const FORCE_CLEAR_OLD_CACHES = true;

self.addEventListener('install', (event) => {
  console.log('[SW] Install');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activate - Force clearing ALL caches');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      // Force clear ALL caches when FORCE_CLEAR_OLD_CACHES is true
      if (FORCE_CLEAR_OLD_CACHES) {
        return Promise.all(
          cacheNames.map((name) => {
            console.log(`[SW] Deleting cache: ${name}`);
            return caches.delete(name);
          })
        );
      } else {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('pca-hijab-') && name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      }
    })
  );
  self.clients.claim();
});

// Enhanced fetch handler with cache-first strategy for static assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip cross-origin requests except for fonts and CDN resources
  if (url.origin !== location.origin) {
    // Allow Google Fonts and other CDN resources
    if (!url.hostname.includes('googleapis.com') && 
        !url.hostname.includes('gstatic.com') &&
        !url.hostname.includes('vercel-analytics.com')) {
      return;
    }
  }
  
  // Determine caching strategy based on resource type
  const isStaticAsset = (url.pathname.includes('.js') && !url.pathname.startsWith('/api/')) || 
                        url.pathname.includes('.css') ||
                        url.pathname.includes('.woff') ||
                        url.pathname.includes('.woff2') ||
                        url.pathname.includes('.ttf');
  
  const isImage = url.pathname.includes('.png') ||
                  url.pathname.includes('.jpg') ||
                  url.pathname.includes('.jpeg') ||
                  url.pathname.includes('.svg') ||
                  url.pathname.includes('.gif');
  
  if (isStaticAsset || isImage) {
    // Cache-first strategy for static assets
    event.respondWith(
      caches.match(event.request)
        .then((cached) => {
          if (cached) {
            // Return cached version and update cache in background
            const fetchPromise = fetch(event.request)
              .then((response) => {
                if (response.ok) {
                  const responseClone = response.clone();
                  caches.open(STATIC_CACHE).then((cache) => {
                    cache.put(event.request, responseClone);
                  });
                }
                return response;
              })
              .catch(() => cached); // If update fails, continue using cached version
            
            return cached;
          }
          
          // Not in cache, fetch from network
          return fetch(event.request)
            .then((response) => {
              if (response.ok) {
                const responseClone = response.clone();
                caches.open(STATIC_CACHE).then((cache) => {
                  cache.put(event.request, responseClone);
                });
              }
              return response;
            });
        })
    );
  } else {
    // Network-first for API calls and HTML
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok && url.pathname === '/') {
            // Cache homepage HTML
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache for offline support
          return caches.match(event.request);
        })
    );
  }
});
