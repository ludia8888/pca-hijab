import { apiClient } from './api/client';
import axios from 'axios';

class KeepAliveService {
  private intervalId: NodeJS.Timeout | null = null;
  private isActive = false;
  private readonly PING_INTERVAL = 3 * 60 * 1000; // 3 minutes (more aggressive)
  private lastPingTime = 0;
  private coldStartDetected = false;
  
  // Multiple backend URLs to wake up
  private readonly BACKEND_URLS = [
    import.meta.env.VITE_API_BASE_URL || 'https://pca-hijab-backend.onrender.com',
    import.meta.env.VITE_AI_API_URL || 'https://showmethecolor-api.onrender.com'
  ];
  
  /**
   * Start the keep-alive service
   * Sends lightweight pings to prevent cold starts
   */
  start(): void {
    if (this.isActive) return;
    
    this.isActive = true;
    
    // Immediate aggressive pre-warming on start
    this.aggressivePrewarm();
    
    // Set up regular interval
    this.intervalId = setInterval(() => {
      this.ping();
    }, this.PING_INTERVAL);
    
    console.log('✅ Keep-alive service started with aggressive pre-warming');
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
   * Aggressive pre-warming for cold starts
   * Called on app initialization
   */
  private async aggressivePrewarm(): Promise<void> {
    console.log('🔥 Starting aggressive pre-warming...');
    
    // First, use Edge Function for fast pre-warming
    try {
      const edgeResponse = await fetch('/api/health?prewarm=true', {
        method: 'GET',
      });
      
      if (edgeResponse.ok) {
        const data = await edgeResponse.json();
        console.log('⚡ Edge pre-warm response:', data);
        
        // Check if any backends had cold starts
        if (data.backends) {
          const coldStarts = data.backends.filter((b: any) => b.coldStart);
          if (coldStarts.length > 0) {
            this.coldStartDetected = true;
            console.warn('🐌 Cold starts detected:', coldStarts);
            
            // Additional warmup for cold-started services
            coldStarts.forEach((backend: any) => {
              if (backend.url) {
                this.additionalWarmup(backend.url);
              }
            });
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ Edge pre-warm failed:', error);
    }
    
    // Fallback: Direct wake-up calls to all services
    const wakeupPromises = this.BACKEND_URLS.map(async (url) => {
      try {
        const startTime = performance.now();
        
        // Use direct axios to bypass interceptors and get raw performance
        const response = await axios.get(`${url}/api/health`, {
          timeout: 30000, // 30 seconds for cold start
          headers: {
            'X-Prewarm': 'true'
          }
        });
        
        const responseTime = performance.now() - startTime;
        
        // Detect cold start (response time > 5 seconds)
        if (responseTime > 5000) {
          this.coldStartDetected = true;
          console.warn(`🐌 Cold start detected for ${url}: ${Math.round(responseTime)}ms`);
          
          // Send additional requests to fully warm up
          this.additionalWarmup(url);
        } else {
          console.log(`✅ ${url} warm: ${Math.round(responseTime)}ms`);
        }
        
        return { url, responseTime, status: 'success' };
      } catch (error) {
        console.warn(`⚠️ Pre-warm failed for ${url}:`, error);
        
        // Definitely a cold start if it fails
        this.coldStartDetected = true;
        this.additionalWarmup(url);
        
        return { url, responseTime: -1, status: 'failed' };
      }
    });
    
    const results = await Promise.allSettled(wakeupPromises);
    console.log('🔥 Pre-warming complete:', results);
    
    // If cold start detected, send another round after 2 seconds
    if (this.coldStartDetected) {
      setTimeout(() => {
        console.log('🔄 Second round of warming due to cold start...');
        this.ping();
      }, 2000);
    }
  }
  
  /**
   * Additional warmup requests for cold-started services
   */
  private async additionalWarmup(url: string): Promise<void> {
    // Send 2 more requests with delay to ensure full warmup
    for (let i = 0; i < 2; i++) {
      setTimeout(async () => {
        try {
          await axios.get(`${url}/api/health`, { timeout: 5000 });
          console.log(`🔥 Additional warmup ${i + 1} for ${url}`);
        } catch {
          // Ignore errors
        }
      }, (i + 1) * 1000);
    }
  }
  
  /**
   * Send lightweight pings to all backends
   */
  private async ping(): Promise<void> {
    const now = Date.now();
    
    // Prevent too frequent pings
    if (now - this.lastPingTime < 30000) return; // Min 30 seconds between pings
    
    this.lastPingTime = now;
    
    // Ping all backends in parallel
    this.BACKEND_URLS.forEach(async (url) => {
      try {
        await axios.get(`${url}/api/health`, {
          timeout: 5000,
          headers: {
            'X-Keep-Alive': 'true'
          }
        });
        console.log(`🏓 Keep-alive ping sent to ${url}`);
      } catch (error) {
        console.log(`Keep-alive ping failed for ${url} (normal if sleeping)`);
      }
    });
  }
  
  /**
   * Check if service is running
   */
  isRunning(): boolean {
    return this.isActive;
  }
}

export const keepAliveService = new KeepAliveService();