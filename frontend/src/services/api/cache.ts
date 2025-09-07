/**
 * Client-side caching service for API responses
 * Reduces need to hit backend APIs
 */

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
}

class CacheService {
  private cache = new Map<string, CacheEntry>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  
  /**
   * Get cached data if still valid
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    const now = Date.now();
    const isExpired = now - entry.timestamp > entry.ttl;
    
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    
    console.log(`📦 Cache hit: ${key}`);
    return entry.data as T;
  }
  
  /**
   * Set cache data
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
    console.log(`💾 Cached: ${key} (TTL: ${ttl / 1000}s)`);
  }
  
  /**
   * Clear specific cache entry
   */
  delete(key: string): void {
    this.cache.delete(key);
  }
  
  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    console.log('🧹 Cache cleared');
  }
  
  /**
   * Clear expired entries
   */
  cleanExpired(): void {
    const now = Date.now();
    let cleaned = 0;
    
    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    });
    
    if (cleaned > 0) {
      console.log(`🧹 Cleaned ${cleaned} expired cache entries`);
    }
  }
  
  /**
   * Get cache statistics
   */
  getStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    };
  }
  
  /**
   * Pre-cache common data
   */
  async preCacheCommonData(): Promise<void> {
    console.log('📦 Pre-caching common data...');
    
    // Pre-cache health check
    this.set('health-check', { status: 'ok', cached: true }, 60000); // 1 minute
    
    // You can add more pre-caching here for frequently accessed data
    // For example: product categories, static content, etc.
  }
}

export const cacheService = new CacheService();

// Clean expired entries every minute
if (typeof window !== 'undefined') {
  setInterval(() => {
    cacheService.cleanExpired();
  }, 60000);
}

/**
 * Higher-order function to wrap API calls with caching
 */
export function withCache<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Check cache first
  const cached = cacheService.get<T>(cacheKey);
  if (cached !== null) {
    return Promise.resolve(cached);
  }
  
  // Fetch and cache
  return fetcher().then(data => {
    cacheService.set(cacheKey, data, ttl);
    return data;
  });
}