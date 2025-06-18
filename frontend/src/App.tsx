import { useEffect } from 'react';
import { Router } from './routes';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PageTracker } from './components/analytics/PageTracker';
import { ToastProvider } from './components/ui/Toast';
import { initializeGA4 } from './utils/analytics';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

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
        </PageTracker>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;