import { useEffect } from 'react';
import { Router } from './routes';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PageTracker } from './components/analytics/PageTracker';
import { ToastProvider } from './components/ui/Toast';
import { initializeGA4 } from './utils/analytics';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Toaster } from 'react-hot-toast';

function App(): JSX.Element {
  useEffect(() => {
    // Initialize Google Analytics 4
    initializeGA4();
  }, []);

  return (
    <ErrorBoundary>
      <ToastProvider>
        <PageTracker>
          <Router />
          <Analytics />
          <SpeedInsights />
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