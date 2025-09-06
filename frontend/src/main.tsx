console.log('[MAIN] Starting application...');

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryProvider } from './hooks/QueryProvider'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { preloadEnvironment } from './utils/preload'
import { setupChunkErrorHandler } from './utils/chunkErrorHandler'
import { initializeTensorFlow } from './utils/tensorflowInit'
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

console.log('[MAIN] Starting app initialization...');

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
  
  // Initialize TensorFlow in background (non-blocking)
  // Delay slightly to let the UI render first
  setTimeout(() => {
    console.log('[MAIN] Starting TensorFlow initialization in background...');
    initializeTensorFlow().catch(err => {
      console.error('[MAIN] TensorFlow initialization failed:', err);
      // Will retry when actually needed
    });
  }, 500);
}
