// Minimal service worker for basic caching
const CACHE_VERSION = 'v1';
const CACHE_NAME = `pca-hijab-${CACHE_VERSION}`;

self.addEventListener('install', (event) => {
  console.log('[SW] Install');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activate');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('pca-hijab-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
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