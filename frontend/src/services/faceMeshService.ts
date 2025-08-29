/**
 * FaceMesh Singleton Service
 * Shares a single MediaPipe FaceMesh instance across components
 * This optimizes memory usage while maintaining all functionality
 */

import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import { initializeTensorFlow, getTensorFlow } from '@/utils/tensorflowInit';

class FaceMeshService {
  private static instance: FaceMeshService | null = null;
  private detector: faceLandmarksDetection.FaceLandmarksDetector | null = null;
  private initialized = false;
  private initPromise: Promise<void> | null = null;
  private referenceCount = 0; // Track how many components are using the service

  private constructor() {
    // Private constructor for singleton
  }

  static getInstance(): FaceMeshService {
    if (!FaceMeshService.instance) {
      FaceMeshService.instance = new FaceMeshService();
    }
    return FaceMeshService.instance;
  }

  async initialize(): Promise<boolean> {
    if (this.initialized && this.detector) {
      console.log('✅ [FaceMesh Service] Already initialized, reusing existing instance');
      this.referenceCount++;
      return true;
    }

    if (this.initPromise) {
      console.log('⏳ [FaceMesh Service] Initialization in progress, waiting...');
      try {
        await this.initPromise;
        this.referenceCount++;
        return this.initialized;
      } catch {
        return false;
      }
    }

    this.initPromise = this.initializeInternal();
    
    try {
      await this.initPromise;
      this.referenceCount++;
      return this.initialized;
    } finally {
      this.initPromise = null;
    }
  }

  private async initializeInternal(): Promise<void> {
    console.log('🔧 [FaceMesh Service] Starting FaceMesh initialization...');
    const startTime = performance.now();

    try {
      // Ensure TensorFlow is initialized first
      console.log('🔧 [FaceMesh Service] Ensuring TensorFlow is ready...');
      await initializeTensorFlow();
      
      const tf = await getTensorFlow();
      console.log('✅ [FaceMesh Service] TensorFlow ready, backend:', tf.getBackend());

      // Create MediaPipe FaceMesh detector
      console.log('🔧 [FaceMesh Service] Loading MediaPipe FaceMesh model...');
      const modelStart = performance.now();
      
      const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
      const detectorConfig = {
        runtime: 'tfjs' as const,
        refineLandmarks: true, // Keep refineLandmarks for better accuracy
        maxFaces: 1, // Only detect one face for better performance
      };
      
      this.detector = await faceLandmarksDetection.createDetector(model, detectorConfig);
      
      const modelTime = performance.now() - modelStart;
      const totalTime = performance.now() - startTime;
      
      this.initialized = true;
      
      console.log(`✅ [FaceMesh Service] Model loaded in ${Math.round(modelTime)}ms`);
      console.log(`🎯 [FaceMesh Service] Total initialization in ${Math.round(totalTime)}ms`);
      console.log(`📊 [FaceMesh Service] Memory optimization: Single instance shared across components`);
      
    } catch (error) {
      console.error('❌ [FaceMesh Service] Failed to initialize:', error);
      this.initialized = false;
      throw error;
    }
  }

  async getDetector(): Promise<faceLandmarksDetection.FaceLandmarksDetector | null> {
    if (!this.initialized) {
      const success = await this.initialize();
      if (!success) {
        return null;
      }
    }
    return this.detector;
  }

  /**
   * Estimate faces from an image or video element
   * This method maintains the exact same interface as before
   */
  async estimateFaces(source: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement) {
    const detector = await this.getDetector();
    if (!detector) {
      throw new Error('FaceMesh detector not available');
    }
    return detector.estimateFaces(source);
  }

  /**
   * Release reference to the service
   * When reference count reaches 0, optionally dispose the model
   */
  release(): void {
    this.referenceCount = Math.max(0, this.referenceCount - 1);
    console.log(`📊 [FaceMesh Service] Released, reference count: ${this.referenceCount}`);
    
    // Optional: Auto-dispose when no components are using it
    // For now, we keep it loaded for better performance
    /*
    if (this.referenceCount === 0) {
      console.log('🧹 [FaceMesh Service] No references, scheduling disposal...');
      setTimeout(() => {
        if (this.referenceCount === 0) {
          this.dispose();
        }
      }, 60000); // Wait 1 minute before disposing
    }
    */
  }

  /**
   * Force dispose the detector
   * Should only be called when completely done with face detection
   */
  dispose(): void {
    if (this.detector) {
      try {
        this.detector.dispose();
        console.log('✅ [FaceMesh Service] Detector disposed');
      } catch (error) {
        console.warn('⚠️ [FaceMesh Service] Failed to dispose detector:', error);
      }
      this.detector = null;
    }
    this.initialized = false;
    this.referenceCount = 0;
  }

  /**
   * Get current status for debugging
   */
  getStatus() {
    return {
      initialized: this.initialized,
      hasDetector: !!this.detector,
      referenceCount: this.referenceCount,
      isInitializing: !!this.initPromise
    };
  }
}

// Export singleton instance
export const faceMeshService = FaceMeshService.getInstance();