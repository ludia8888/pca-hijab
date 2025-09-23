// Cold Start Handler for Render.com Free Tier
// Detects and handles cold start scenarios with appropriate timeouts

interface ColdStartConfig {
  normalTimeout: number;
  coldStartTimeout: number;
  maxRetries: number;
  retryDelay: number;
}

const DEFAULT_CONFIG: ColdStartConfig = {
  normalTimeout: 30000, // 30 seconds
  coldStartTimeout: 60000, // 60 seconds for cold starts
  maxRetries: 2,
  retryDelay: 1000, // 1 second
};

class ColdStartHandler {
  private isFirstRequest = true;
  private lastSuccessfulRequestTime = 0;
  private readonly COLD_START_THRESHOLD = 10 * 60 * 1000; // 10 minutes
  private config: ColdStartConfig;

  constructor(config: Partial<ColdStartConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get appropriate timeout based on cold start detection
   */
  getTimeout(): number {
    const now = Date.now();
    
    // First request of the session - likely cold start
    if (this.isFirstRequest) {
      console.log('🥶 [Cold Start] First request detected, using extended timeout');
      return this.config.coldStartTimeout;
    }
    
    // If last successful request was more than 10 minutes ago - likely cold start
    if (this.lastSuccessfulRequestTime && 
        (now - this.lastSuccessfulRequestTime) > this.COLD_START_THRESHOLD) {
      console.log('🥶 [Cold Start] Idle period detected, using extended timeout');
      return this.config.coldStartTimeout;
    }
    
    // Normal operation
    return this.config.normalTimeout;
  }

  /**
   * Mark a request as successful
   */
  markSuccess(): void {
    this.isFirstRequest = false;
    this.lastSuccessfulRequestTime = Date.now();
    console.log('✅ [Cold Start] Request successful, updating timestamp');
  }

  /**
   * Get retry configuration
   */
  getRetryConfig() {
    return {
      maxRetries: this.config.maxRetries,
      retryDelay: this.config.retryDelay,
      shouldRetry: (error: any): boolean => {
        // Retry on timeout errors
        if (error?.code === 'ECONNABORTED' || error?.code === 'TIMEOUT') {
          return true;
        }
        
        // Retry on network errors (no response)
        if (!error?.response && error?.request) {
          return true;
        }
        
        // Don't retry on client errors (4xx)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        
        // Retry on server errors (5xx)
        if (error?.response?.status >= 500) {
          return true;
        }
        
        return false;
      }
    };
  }

  /**
   * Reset cold start detection (useful for testing)
   */
  reset(): void {
    this.isFirstRequest = true;
    this.lastSuccessfulRequestTime = 0;
  }
}

// Export singleton instance
export const coldStartHandler = new ColdStartHandler();

// Export class for custom configurations
export { ColdStartHandler };