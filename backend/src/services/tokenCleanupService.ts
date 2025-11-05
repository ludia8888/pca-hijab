/**
 * Token Cleanup Service for PCA-HIJAB
 * Automatically cleans up expired tokens to maintain database health and security
 * SECURITY: Prevents token table bloat and removes stale authentication data
 */

import cron from 'node-cron';
import { db } from '../db';
import { config } from '../config/environment';
import { maskUserId } from '../utils/logging';

interface CleanupStats {
  timestamp: Date;
  refreshTokensDeleted: number;
  verificationTokensExpired: number;
  passwordResetTokensExpired: number;
  totalOperations: number;
  executionTimeMs: number;
}

class TokenCleanupService {
  private isRunning: boolean = false;
  private cleanupHistory: CleanupStats[] = [];
  private maxHistoryEntries: number = 24; // Keep last 24 cleanup runs
  private schedulerEnabled: boolean = false;
  
  constructor() {
    // Only start scheduler in production or when explicitly enabled
    const override = process.env.ENABLE_TOKEN_CLEANUP?.toLowerCase();
    this.schedulerEnabled = this.shouldStartScheduler();

    if (this.schedulerEnabled) {
      this.startScheduler();
    } else {
      if (override === 'false') {
        console.info('🧹 Token cleanup scheduler disabled via ENABLE_TOKEN_CLEANUP=false override');
      } else if (config.NODE_ENV !== 'production') {
        console.info('🧹 Token cleanup scheduler disabled (development mode). Set ENABLE_TOKEN_CLEANUP=true to enable.');
      } else {
        console.info('🧹 Token cleanup scheduler disabled by configuration.');
      }
    }
  }

  private shouldStartScheduler(): boolean {
    const override = process.env.ENABLE_TOKEN_CLEANUP?.toLowerCase();
    const isProduction = config.NODE_ENV === 'production';

    if (override === 'false') {
      return false;
    }

    if (isProduction) {
      return true;
    }

    if (override === 'true') {
      return true;
    }

    return false;
  }

  /**
   * Start the automated cleanup scheduler
   * Runs every hour in production, every 6 hours in development
   */
  private startScheduler(): void {
    // Different schedules for different environments
    const schedule = config.NODE_ENV === 'production' 
      ? '0 * * * *'      // Every hour in production
      : '0 */6 * * *';   // Every 6 hours in development

    cron.schedule(schedule, () => {
      this.performCleanup().catch(error => {
        console.error('🚨 Scheduled token cleanup failed:', error);
      });
    }, {
      timezone: 'UTC' // Use UTC for consistency
    });

    console.info(`🧹 Token cleanup scheduler started (${config.NODE_ENV} mode, schedule: ${schedule})`);
  }

  /**
   * Perform comprehensive token cleanup
   */
  async performCleanup(): Promise<CleanupStats> {
    if (this.isRunning) {
      console.warn('🧹 Token cleanup already in progress, skipping...');
      return this.getLastCleanupStats();
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      console.info('🧹 Starting token cleanup...');

      // Perform cleanup operations
      const stats = await this.executeCleanupOperations();
      
      const executionTime = Date.now() - startTime;
      const cleanupStats: CleanupStats = {
        ...stats,
        executionTimeMs: executionTime
      };

      // Store cleanup history
      this.addToHistory(cleanupStats);

      // Log results
      this.logCleanupResults(cleanupStats);

      return cleanupStats;
    } catch (error) {
      console.error('🚨 Token cleanup failed:', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Execute the actual cleanup operations
   */
  private async executeCleanupOperations(): Promise<Omit<CleanupStats, 'executionTimeMs'>> {
    let refreshTokensDeleted = 0;
    let verificationTokensExpired = 0;
    let passwordResetTokensExpired = 0;

    try {
      // Clean up expired refresh tokens
      const refreshResult = await (db as any).query('DELETE FROM refresh_tokens WHERE expires_at < CURRENT_TIMESTAMP');
      refreshTokensDeleted = refreshResult.rowCount || 0;

      // Clean up expired verification tokens
      const verificationResult = await (db as any).query(`
        UPDATE users 
        SET verification_token = NULL, verification_token_expires = NULL
        WHERE verification_token IS NOT NULL 
          AND verification_token_expires < CURRENT_TIMESTAMP
      `);
      verificationTokensExpired = verificationResult.rowCount || 0;

      // Clean up expired password reset tokens
      const passwordResetResult = await (db as any).query(`
        UPDATE users 
        SET reset_password_token = NULL, reset_password_expires = NULL
        WHERE reset_password_token IS NOT NULL 
          AND reset_password_expires < CURRENT_TIMESTAMP
      `);
      passwordResetTokensExpired = passwordResetResult.rowCount || 0;

    } catch (error) {
      console.error('🚨 Error during cleanup operations:', error);
      throw error;
    }

    return {
      timestamp: new Date(),
      refreshTokensDeleted,
      verificationTokensExpired,
      passwordResetTokensExpired,
      totalOperations: refreshTokensDeleted + verificationTokensExpired + passwordResetTokensExpired
    };
  }

  /**
   * Add cleanup stats to history
   */
  private addToHistory(stats: CleanupStats): void {
    this.cleanupHistory.push(stats);
    
    // Keep only the most recent entries
    if (this.cleanupHistory.length > this.maxHistoryEntries) {
      this.cleanupHistory = this.cleanupHistory.slice(-this.maxHistoryEntries);
    }
  }

  /**
   * Log cleanup results in a secure manner
   */
  private logCleanupResults(stats: CleanupStats): void {
    const { timestamp, refreshTokensDeleted, verificationTokensExpired, passwordResetTokensExpired, totalOperations, executionTimeMs } = stats;
    
    if (totalOperations > 0) {
      console.info('🧹 Token cleanup completed:', {
        timestamp: timestamp.toISOString(),
        refreshTokensDeleted,
        verificationTokensExpired,
        passwordResetTokensExpired,
        totalOperations,
        executionTimeMs: `${executionTimeMs}ms`
      });
    } else {
      console.info('🧹 Token cleanup completed - no expired tokens found');
    }
  }

  /**
   * Get cleanup statistics for monitoring
   */
  getCleanupHistory(): CleanupStats[] {
    return [...this.cleanupHistory]; // Return copy to prevent mutation
  }

  /**
   * Get last cleanup stats
   */
  getLastCleanupStats(): CleanupStats {
    return this.cleanupHistory[this.cleanupHistory.length - 1] || {
      timestamp: new Date(0),
      refreshTokensDeleted: 0,
      verificationTokensExpired: 0,
      passwordResetTokensExpired: 0,
      totalOperations: 0,
      executionTimeMs: 0
    };
  }

  /**
   * Force manual cleanup (for admin use)
   */
  async forceCleanup(): Promise<CleanupStats> {
    console.info('🧹 Manual token cleanup requested');
    return this.performCleanup();
  }

  /**
   * Get service status
   */
  getStatus(): {
    isRunning: boolean;
    schedulerEnabled: boolean;
    lastCleanup: Date | null;
    totalHistoryEntries: number;
    environment: string;
  } {
    return {
      isRunning: this.isRunning,
      schedulerEnabled: this.schedulerEnabled,
      lastCleanup: this.cleanupHistory.length > 0 
        ? this.cleanupHistory[this.cleanupHistory.length - 1].timestamp 
        : null,
      totalHistoryEntries: this.cleanupHistory.length,
      environment: config.NODE_ENV
    };
  }

  /**
   * Health check for monitoring systems
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    lastCleanupAge: number; // hours since last cleanup
    issue?: string;
  }> {
    const lastCleanup = this.getLastCleanupStats();
    const hoursSinceLastCleanup = (Date.now() - lastCleanup.timestamp.getTime()) / (1000 * 60 * 60);
    
    // Consider unhealthy if no cleanup in last 25 hours (allowing for some delay)
    const maxHoursSinceCleanup = config.NODE_ENV === 'production' ? 25 : 150; // 6+ days for dev
    
    if (hoursSinceLastCleanup > maxHoursSinceCleanup) {
      return {
        healthy: false,
        lastCleanupAge: hoursSinceLastCleanup,
        issue: `No cleanup in ${Math.round(hoursSinceLastCleanup)} hours`
      };
    }

    return {
      healthy: true,
      lastCleanupAge: hoursSinceLastCleanup
    };
  }
}

// Export singleton instance
export const tokenCleanupService = new TokenCleanupService();
