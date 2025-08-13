// Minimal service worker for basic caching
const CACHE_VERSION = 'v2-2025-01-13';
const CACHE_NAME = `pca-hijab-${CACHE_VERSION}`;

// Force clear all old caches on activation
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

// Simple fetch handler - cache JS/CSS after successful fetch
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Only handle same-origin JS/CSS requests
  if (url.origin !== location.origin) return;
  if (!url.pathname.includes('.js') && !url.pathname.includes('.css')) return;
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // On network failure, try cache
        return caches.match(event.request);
      })
  );
});