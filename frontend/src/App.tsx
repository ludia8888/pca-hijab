import { Router } from './routes';
import { ErrorBoundary } from './components/ErrorBoundary';

function App(): JSX.Element {
  return (
    <ErrorBoundary>
      <Router />
    </ErrorBoundary>
  );
}

export default App;