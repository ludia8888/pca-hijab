import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { Button } from '@/components/ui';
import { trackError } from '@/utils/analytics';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorCount: number;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private lastErrorTime = 0;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const currentTime = Date.now();
    
    // Reset retry count if it's been more than 5 minutes since last error
    if (currentTime - this.lastErrorTime > 300000) {
      this.retryCount = 0;
    }
    
    this.lastErrorTime = currentTime;
    this.retryCount++;

    // Log error to analytics
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    trackError('react_error_boundary', error.message, 'global', {
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorName: error.name,
      timestamp: new Date().toISOString(),
      retryCount: this.retryCount,
      userAgent: navigator.userAgent
    });

    // Update state with error details
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // If too many errors in short time, reload the page
    if (this.retryCount > 3) {
      console.error('Too many errors detected, reloading page in 3 seconds...');
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    }
  }

  handleReset = (): void => {
    this.retryCount = 0;
    this.setState({ hasError: false, error: null, errorCount: 0 });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isNetworkError = this.state.error?.message?.toLowerCase().includes('network') ||
                           this.state.error?.message?.toLowerCase().includes('fetch');

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-6">
              <div className="w-20 h-20 bg-error-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-error-500"
                >
                  <path
                    d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                {isNetworkError ? 'Connection Problem' : 'Oops, something went wrong'}
              </h1>
              <p className="text-gray-600 mb-6">
                {isNetworkError 
                  ? 'Please check your internet connection and try again.'
                  : 'We apologize for the inconvenience. The application encountered an unexpected error.'}
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left bg-gray-100 p-4 rounded-lg mb-6">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700">
                    Error Details (Development Only)
                  </summary>
                  <pre className="mt-2 text-xs text-gray-600 overflow-auto max-h-40">
                    {this.state.error.message}
                    {'\n\n'}
                    {this.state.error.stack}
                    {this.state.errorInfo && '\n\nComponent Stack:\n' + this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={this.handleReset} 
                variant="primary"
                size="lg"
                className="w-full"
              >
                Try Again
              </Button>
              
              <Button 
                onClick={this.handleReload}
                variant="secondary"
                size="lg"
                className="w-full"
              >
                Refresh Page
              </Button>
              
              <Button 
                onClick={this.handleGoHome}
                variant="ghost"
                size="lg"
                className="w-full"
              >
                Go to Home
              </Button>
            </div>
            
            {this.state.errorCount > 1 && (
              <p className="mt-4 text-sm text-gray-500">
                Multiple errors detected ({this.state.errorCount}). 
                {this.retryCount > 2 && ' The page will reload automatically soon.'}
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}