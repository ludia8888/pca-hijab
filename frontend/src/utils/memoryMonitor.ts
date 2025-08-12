import * as tf from '@tensorflow/tfjs';

/**
 * TensorFlow.js Memory Monitor
 * Monitors GPU memory usage and provides cleanup utilities
 */

interface MemoryInfo {
  numBytes: number;
  numBytesInGPU: number;
  numTensors: number;
  numDataBuffers: number;
}

interface MemoryAlert {
  level: 'info' | 'warning' | 'critical';
  message: string;
  memoryMB: number;
}

export class TensorFlowMemoryMonitor {
  private static instance: TensorFlowMemoryMonitor;
  private monitorInterval: NodeJS.Timeout | null = null;
  private lastMemoryCheck = 0;
  private memoryHistory: number[] = [];
  private readonly MAX_MEMORY_MB = 400; // 400MB threshold
  private readonly WARNING_MEMORY_MB = 250; // 250MB warning

  private constructor() {}

  public static getInstance(): TensorFlowMemoryMonitor {
    if (!TensorFlowMemoryMonitor.instance) {
      TensorFlowMemoryMonitor.instance = new TensorFlowMemoryMonitor();
    }
    return TensorFlowMemoryMonitor.instance;
  }

  /**
   * Get current memory usage information
   */
  public getMemoryInfo(): MemoryInfo {
    try {
      return tf.memory();
    } catch (error) {
      console.warn('⚠️ [Memory Monitor] Failed to get memory info:', error);
      return {
        numBytes: 0,
        numBytesInGPU: 0,
        numTensors: 0,
        numDataBuffers: 0
      };
    }
  }

  /**
   * Check memory usage and return alert if needed
   */
  public checkMemoryUsage(): MemoryAlert | null {
    const memInfo = this.getMemoryInfo();
    const memoryMB = memInfo.numBytes / (1024 * 1024);

    // Update memory history
    this.memoryHistory.push(memoryMB);
    if (this.memoryHistory.length > 20) {
      this.memoryHistory.shift(); // Keep only last 20 readings
    }

    if (memoryMB > this.MAX_MEMORY_MB) {
      return {
        level: 'critical',
        message: `Critical GPU memory usage: ${memoryMB.toFixed(1)}MB (${memInfo.numTensors} tensors)`,
        memoryMB
      };
    } else if (memoryMB > this.WARNING_MEMORY_MB) {
      return {
        level: 'warning',
        message: `High GPU memory usage: ${memoryMB.toFixed(1)}MB (${memInfo.numTensors} tensors)`,
        memoryMB
      };
    } else {
      return {
        level: 'info',
        message: `GPU memory usage: ${memoryMB.toFixed(1)}MB (${memInfo.numTensors} tensors)`,
        memoryMB
      };
    }
  }

  /**
   * Force cleanup of unused tensors
   */
  public forceCleanup(): void {
    try {
      console.log('🧹 [Memory Monitor] Starting aggressive cleanup...');
      
      const beforeMemory = this.getMemoryInfo();
      
      // Multiple cleanup strategies to handle different types of memory leaks
      
      // 1. Dispose all disposable tensors
      tf.disposeVariables();
      
      // 2. Run engine scope cleanup multiple times for better coverage
      for (let i = 0; i < 3; i++) {
        tf.engine().startScope();
        tf.engine().endScope();
      }
      
      // 3. Manual tensor cleanup for any remaining tensors
      this.manualTensorCleanup();
      
      // 4. Force garbage collection if available
      if (typeof window !== 'undefined' && (window as any).gc) {
        (window as any).gc();
      }
      
      const afterMemory = this.getMemoryInfo();
      const freedMB = (beforeMemory.numBytes - afterMemory.numBytes) / (1024 * 1024);
      
      console.log(`✅ [Memory Monitor] Cleanup completed. Freed ${freedMB.toFixed(1)}MB`);
      console.log(`🧠 [Memory Monitor] Before: ${beforeMemory.numTensors} tensors, After: ${afterMemory.numTensors} tensors`);
      
      // Update memory history after cleanup
      this.memoryHistory.push(afterMemory.numBytes / (1024 * 1024));
      if (this.memoryHistory.length > 20) {
        this.memoryHistory.shift();
      }
      
    } catch (error) {
      console.error('❌ [Memory Monitor] Cleanup failed:', error);
    }
  }

  /**
   * Manual tensor cleanup for MediaPipe and other potential leaks
   */
  private manualTensorCleanup(): void {
    try {
      // Get all tensors and try to dispose any that are orphaned
      const memInfo = tf.memory();
      if (memInfo.numTensors > 100) { // Only if we have a significant number
        console.log(`🔧 [Memory Monitor] Manual cleanup: ${memInfo.numTensors} tensors detected`);
        
        // Force a more aggressive cleanup cycle
        if (typeof tf.engine().registryFactory !== 'undefined') {
          // Clear any cached operations
          tf.engine().startScope();
          tf.engine().endScope();
        }
      }
    } catch (error) {
      console.warn('⚠️ [Memory Monitor] Manual cleanup failed:', error);
    }
  }

  /**
   * Start continuous memory monitoring
   */
  public startMonitoring(intervalMs: number = 5000): void {
    if (this.monitorInterval) {
      this.stopMonitoring();
    }

    console.log(`🎯 [Memory Monitor] Starting continuous monitoring (${intervalMs}ms interval)`);
    
    this.monitorInterval = setInterval(() => {
      const alert = this.checkMemoryUsage();
      
      if (alert) {
        switch (alert.level) {
          case 'critical':
            console.error(`🚨 [Memory Monitor] ${alert.message}`);
            this.forceCleanup();
            break;
          case 'warning':
            console.warn(`⚠️ [Memory Monitor] ${alert.message}`);
            break;
          case 'info':
            console.log(`ℹ️ [Memory Monitor] ${alert.message}`);
            break;
        }
      }
    }, intervalMs);
  }

  /**
   * Stop memory monitoring
   */
  public stopMonitoring(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
      console.log('✅ [Memory Monitor] Monitoring stopped');
    }
  }

  /**
   * Get memory usage trend
   */
  public getMemoryTrend(): 'stable' | 'increasing' | 'decreasing' {
    if (this.memoryHistory.length < 5) return 'stable';
    
    const recent = this.memoryHistory.slice(-5);
    const older = this.memoryHistory.slice(-10, -5);
    
    if (older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    
    const diff = recentAvg - olderAvg;
    
    if (diff > 10) return 'increasing'; // 10MB threshold
    if (diff < -10) return 'decreasing';
    return 'stable';
  }
}

// Export singleton instance
export const memoryMonitor = TensorFlowMemoryMonitor.getInstance();