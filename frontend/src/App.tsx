import { useEffect } from 'react';
import { Router } from './routes';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PageTracker } from './components/analytics/PageTracker';
import { ToastProvider } from './components/ui/Toast';
import { initializeGA4 } from './utils/analytics';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Toaster } from 'react-hot-toast';
import { performanceMonitor } from './utils/performanceMonitor';
import './styles/ipad-optimization.css';

function App(): JSX.Element {
  console.log('[APP] App component rendering...');
  
  useEffect(() => {
    console.log('[APP] useEffect running, initializing GA4...');
    // Initialize Google Analytics 4
    try {
      initializeGA4();
      console.log('[APP] GA4 initialized successfully');
    } catch (error) {
      console.error('[APP] Failed to initialize GA4:', error);
    }

    // Log performance metrics after page load
    if (process.env.NODE_ENV === 'development') {
      window.addEventListener('load', () => {
        setTimeout(() => {
          performanceMonitor.logMetrics();
        }, 2000); // Wait for all metrics to be collected
      });
    }

    // Report metrics to analytics in production
    if (process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        setTimeout(() => {
          performanceMonitor.reportMetrics();
        }, 5000); // Wait longer to ensure all metrics are collected
      });
    }
  }, []);

  console.log('[APP] Rendering app components...');
  
  // Check if Vercel analytics should be disabled
  const disableVercelAnalytics = import.meta.env.VITE_VERCEL_ANALYTICS_DISABLED === 'true';
  
  return (
    <ErrorBoundary>
      <ToastProvider>
        <PageTracker>
          <Router />
          {!disableVercelAnalytics && <Analytics />}
          {!disableVercelAnalytics && <SpeedInsights />}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                style: {
                  background: '#10b981',
                  color: '#fff',
                },
              },
              error: {
                duration: 5000,
                style: {
                  background: '#ef4444',
                  color: '#fff',
                },
              },
            }}
          />
        </PageTracker>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;