console.log('[MAIN] Starting application...');

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryProvider } from './hooks/QueryProvider'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { preloadEnvironment } from './utils/preload'
import { setupChunkErrorHandler } from './utils/chunkErrorHandler'
import './index.css'
import './styles/admin-theme.css'
import App from './App.tsx'

console.log('[MAIN] Imports complete');

// Setup chunk error handler
setupChunkErrorHandler();

// Reset reload counter on successful app start
sessionStorage.removeItem('chunk_reload_count');

// Register service worker for better caching (production only)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
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

console.log('[MAIN] Starting preloadEnvironment...');

// Preload environment before rendering
preloadEnvironment().then(() => {
  console.log('[MAIN] preloadEnvironment complete, finding root element...');
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    console.error('[MAIN] Root element not found!');
    return;
  }
  
  console.log('[MAIN] Creating React root...');
  const root = createRoot(rootElement);
  
  console.log('[MAIN] Rendering app...');
  root.render(
    <StrictMode>
      <QueryProvider>
        <App />
        {import.meta.env.VITE_VERCEL_ANALYTICS_DISABLED !== 'true' && <SpeedInsights />}
      </QueryProvider>
    </StrictMode>,
  )
  console.log('[MAIN] Render call complete');
}).catch((error) => {
  console.error('[MAIN] Failed to preload environment:', error);
  console.error('[MAIN] Stack trace:', error.stack);
  
  // Still render the app even if preload fails
  const rootElement = document.getElementById('root');
  if (rootElement) {
    console.log('[MAIN] Attempting fallback render...');
    createRoot(rootElement).render(
      <StrictMode>
        <QueryProvider>
          <App />
          {import.meta.env.VITE_VERCEL_ANALYTICS_DISABLED !== 'true' && <SpeedInsights />}
        </QueryProvider>
      </StrictMode>,
    )
  }
})
