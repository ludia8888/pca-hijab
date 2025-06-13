import { useEffect } from 'react';
import { Router } from './routes';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PageTracker } from './components/analytics/PageTracker';
import { initializeGA4 } from './utils/analytics';

function App(): JSX.Element {
  useEffect(() => {
    // Initialize Google Analytics 4
    initializeGA4();
  }, []);

  return (
    <ErrorBoundary>
      <PageTracker>
        <Router />
      </PageTracker>
    </ErrorBoundary>
  );
}

export default App;