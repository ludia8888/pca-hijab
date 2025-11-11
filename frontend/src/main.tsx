console.log('[MAIN] Starting application...');

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryProvider } from './hooks/QueryProvider'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { preloadEnvironment } from './utils/preload'
import { setupChunkErrorHandler } from './utils/chunkErrorHandler'
// import { scheduleTensorFlowPreinit } from './utils/tensorflowInit'
import './index.css'
import './styles/admin-theme.css'
import App from './App.tsx'

console.log('[MAIN] Imports complete');

// 경로 플래그를 최상단에서 먼저 선언하여 TDZ(Temporal Dead Zone) 회피
// - 아래에서 Service Worker 등록 조건 등에서 사용되므로 선행 선언 필수
const isAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');

// Setup chunk error handler
setupChunkErrorHandler();

// Reset reload counter on successful app start
sessionStorage.removeItem('chunk_reload_count');

// Register service worker for better caching (production only)
if ('serviceWorker' in navigator && import.meta.env.PROD && !isAdminRoute) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('ServiceWorker registered:', registration);
      })
      .catch((error) => {
        console.log('ServiceWorker registration failed:', error);
      });
  });
}

// Add error handlers
window.addEventListener('error', (event) => {
  console.error('[MAIN] Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[MAIN] Unhandled promise rejection:', event.reason);
});


// On admin routes, aggressively disable Service Worker/caches to avoid stale bundles
if (isAdminRoute && 'serviceWorker' in navigator) {
  (async () => {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister()));
      if ('caches' in window) {
        const names = await caches.keys();
        await Promise.all(names.map(name => caches.delete(name)));
      }
      console.log('[MAIN] Admin route: disabled service worker and cleared caches');
    } catch (e) {
      console.warn('[MAIN] Failed to clear SW/caches on admin route', e);
    }
  })();
}

console.log('[MAIN] Starting app initialization...');
console.log('[MAIN] Current route:', typeof window !== 'undefined' ? window.location.pathname : 'unknown');
console.log('[MAIN] TensorFlow preload enabled:', !isAdminRoute);

// Render app immediately without waiting for TensorFlow
const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('[MAIN] Root element not found!');
} else {
  console.log('[MAIN] Creating React root...');
  const root = createRoot(rootElement);
  
  console.log('[MAIN] Rendering app immediately...');
  root.render(
    <StrictMode>
      <QueryProvider>
        <App />
        {import.meta.env.VITE_VERCEL_ANALYTICS_DISABLED !== 'true' && <SpeedInsights />}
      </QueryProvider>
    </StrictMode>,
  );
  console.log('[MAIN] Render call complete');
  
  // Load environment and TensorFlow in background after render
  console.log('[MAIN] Loading resources in background...');
  
  // Preload environment variables (non-blocking)
  preloadEnvironment().catch(error => {
    console.error('[MAIN] Failed to preload environment:', error);
  });
  
  // Initialize TensorFlow in background (non-blocking) unless we're on admin routes
  // if (!isAdminRoute) {
  //   console.log('[MAIN] Scheduling TensorFlow pre-init in background...');
  //   scheduleTensorFlowPreinit(500);
  // } else {
  //   console.log('[MAIN] Skipping TensorFlow preload on admin route');
  // }
}
