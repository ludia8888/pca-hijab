import React, { Component, ReactNode } from 'react';
import { trackError } from '@/utils/analytics';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  errorCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorCount: 0
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to analytics
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    trackError('react_error_boundary', error.message, 'global', {
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorName: error.name,
      timestamp: new Date().toISOString()
    });

    // Update state with error details
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // If too many errors, reload the page
    if (this.state.errorCount > 3) {
      console.error('Too many errors detected, reloading page...');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorCount: 0
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-error-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg 
                className="w-10 h-10 text-error-500" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Oops! Something went wrong
            </h2>
            
            <p className="text-gray-600 mb-6">
              We're sorry for the inconvenience. The application encountered an unexpected error.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Error details (development only)
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            
            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReset}
                className="w-full py-3 px-4 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors"
              >
                Try Again
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full py-3 px-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                Go to Home
              </button>
            </div>
            
            {this.state.errorCount > 1 && (
              <p className="mt-4 text-sm text-gray-500">
                Multiple errors detected. If this persists, please refresh the page.
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components to reset error boundary
export const useErrorHandler = () => {
  return (error: Error) => {
    throw error;
  };
};