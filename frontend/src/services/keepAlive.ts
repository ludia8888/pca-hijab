import { apiClient } from './api/client';

class KeepAliveService {
  private intervalId: NodeJS.Timeout | null = null;
  private isActive = false;
  private readonly PING_INTERVAL = 4 * 60 * 1000; // 4 minutes
  
  /**
   * Start the keep-alive service
   * Sends a lightweight ping to backend every 4 minutes to prevent cold starts
   */
  start(): void {
    if (this.isActive) return;
    
    this.isActive = true;
    
    // Initial ping
    this.ping();
    
    // Set up interval
    this.intervalId = setInterval(() => {
      this.ping();
    }, this.PING_INTERVAL);
    
    console.log('✅ Keep-alive service started');
  }
  
  /**
   * Stop the keep-alive service
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isActive = false;
    console.log('⏹️ Keep-alive service stopped');
  }
  
  /**
   * Send a lightweight ping to the backend
   */
  private async ping(): Promise<void> {
    try {
      await apiClient.get('/health', {
        timeout: 5000, // Short timeout for ping
      });
      console.log('🏓 Keep-alive ping sent');
    } catch (error) {
      // Silently ignore errors - this is just a keep-alive
      console.log('Keep-alive ping failed (normal if backend is sleeping)');
    }
  }
  
  /**
   * Check if service is running
   */
  isRunning(): boolean {
    return this.isActive;
  }
}

export const keepAliveService = new KeepAliveService();