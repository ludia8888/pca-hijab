/**
 * Centralized Face Detection Service
 * Uses TensorFlow.js face-landmarks-detection directly (no face-api.js)
 * Implements proper singleton pattern and resource management
 */

import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

interface FaceRect {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

class FaceDetectionService {
  private static instance: FaceDetectionService | null = null;
  private detector: faceLandmarksDetection.FaceLandmarksDetector | null = null;
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Get singleton instance
   */
  static getInstance(): FaceDetectionService {
    if (!FaceDetectionService.instance) {
      FaceDetectionService.instance = new FaceDetectionService();
    }
    return FaceDetectionService.instance;
  }

  /**
   * Initialize face detection with TensorFlow.js
   */
  async initialize(): Promise<boolean> {
    if (this.initialized) {
      return true;
    }

    // Return existing promise if initialization is in progress
    if (this.initPromise) {
      try {
        await this.initPromise;
        return this.initialized;
      } catch {
        return false;
      }
    }

    // Start new initialization
    this.initPromise = this.initializeInternal();
    
    try {
      await this.initPromise;
      return this.initialized;
    } finally {
      this.initPromise = null;
    }
  }

  /**
   * Internal initialization logic
   */
  private async initializeInternal(): Promise<void> {
    console.log('🔧 [FaceDetectionService] Initializing TensorFlow.js face detection...');

    try {
      // Ensure TensorFlow.js is ready
      await tf.ready();
      console.log('✅ [FaceDetectionService] TensorFlow.js ready');

      // Create MediaPipeFaceMesh detector for better accuracy and performance
      const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
      const detectorConfig: faceLandmarksDetection.MediaPipeFaceMeshTfjsModelConfig = {
        runtime: 'tfjs',
        refineLandmarks: false, // Disable for better performance
        maxFaces: 1, // Only detect one face
        modelUrl: undefined, // Use default CDN model
      };

      this.detector = await faceLandmarksDetection.createDetector(model, detectorConfig);
      this.initialized = true;
      console.log('✅ [FaceDetectionService] Face detector initialized successfully');
    } catch (error) {
      console.error('❌ [FaceDetectionService] Failed to initialize:', error);
      this.initialized = false;
      throw error;
    }
  }

  /**
   * Detect face in video element
   */
  async detectFaceInVideo(video: HTMLVideoElement): Promise<FaceRect | null> {
    if (!this.initialized) {
      console.warn('⚠️ [FaceDetectionService] Not initialized, initializing now...');
      const success = await this.initialize();
      if (!success) {
        console.error('❌ [FaceDetectionService] Initialization failed');
        return null;
      }
    }

    // Validate video element
    if (!video || video.readyState < 2) {
      console.warn('⚠️ [FaceDetectionService] Video not ready');
      return null;
    }

    if (!this.detector) {
      console.error('❌ [FaceDetectionService] Detector not available');
      return null;
    }

    try {
      // Detect faces using MediaPipeFaceMesh
      const predictions = await this.detector.estimateFaces(video);
      
      if (!predictions || predictions.length === 0) {
        return null;
      }

      const face = predictions[0];
      
      // MediaPipeFaceMesh provides a bounding box
      if (face.box) {
        const box = face.box;
        
        // Calculate confidence based on number of detected keypoints
        // MediaPipeFaceMesh has 468 keypoints when fully detected
        const confidence = face.keypoints ? 
          Math.min(face.keypoints.length / 468, 1.0) : 0.8;
        
        return {
          x: box.xMin,
          y: box.yMin,
          width: box.xMax - box.xMin,
          height: box.yMax - box.yMin,
          confidence: confidence
        };
      }
      
      // Fallback: calculate bounding box from keypoints if box not provided
      if (face.keypoints && face.keypoints.length > 0) {
        const points = face.keypoints;
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;
        
        for (const point of points) {
          minX = Math.min(minX, point.x);
          minY = Math.min(minY, point.y);
          maxX = Math.max(maxX, point.x);
          maxY = Math.max(maxY, point.y);
        }
        
        return {
          x: minX,
          y: minY,
          width: maxX - minX,
          height: maxY - minY,
          confidence: 0.8
        };
      }

      return null;
    } catch (error) {
      console.error('❌ [FaceDetectionService] Detection error:', error);
      return null;
    }
  }

  /**
   * Detect face in image element
   */
  async detectFaceInImage(image: HTMLImageElement): Promise<FaceRect | null> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.detector) {
      console.error('❌ [FaceDetectionService] Detector not available');
      return null;
    }

    try {
      const predictions = await this.detector.estimateFaces(image);
      
      if (!predictions || predictions.length === 0) {
        return null;
      }

      const face = predictions[0];
      
      if (face.box) {
        const box = face.box;
        const confidence = face.keypoints ? 
          Math.min(face.keypoints.length / 468, 1.0) : 0.8;
        
        return {
          x: box.xMin,
          y: box.yMin,
          width: box.xMax - box.xMin,
          height: box.yMax - box.yMin,
          confidence: confidence
        };
      }

      return null;
    } catch (error) {
      console.error('❌ [FaceDetectionService] Image detection error:', error);
      return null;
    }
  }

  /**
   * Check if face is well positioned
   */
  isFaceWellPositioned(face: FaceRect, frameWidth: number, frameHeight: number): boolean {
    const centerX = face.x + face.width / 2;
    const centerY = face.y + face.height / 2;
    
    // Check centering
    const isXCentered = centerX > frameWidth * 0.3 && centerX < frameWidth * 0.7;
    const isYCentered = centerY > frameHeight * 0.2 && centerY < frameHeight * 0.8;
    
    // Check size
    const faceAreaRatio = (face.width * face.height) / (frameWidth * frameHeight);
    const isSizeGood = faceAreaRatio > 0.08; // At least 8% of frame
    
    // Check confidence
    const isConfident = face.confidence >= 0.5;
    
    return isXCentered && isYCentered && isSizeGood && isConfident;
  }

  /**
   * Calculate face quality score
   */
  getFaceQualityScore(face: FaceRect, frameWidth: number, frameHeight: number): number {
    const centerX = face.x + face.width / 2;
    const centerY = face.y + face.height / 2;
    
    // Centering score
    const xOffset = Math.abs(centerX - frameWidth / 2) / (frameWidth / 2);
    const yOffset = Math.abs(centerY - frameHeight / 2) / (frameHeight / 2);
    const centeringScore = (1 - (xOffset + yOffset) / 2) * 40;
    
    // Size score
    const faceAreaRatio = (face.width * face.height) / (frameWidth * frameHeight);
    const sizeScore = Math.min(faceAreaRatio / 0.15, 1) * 30;
    
    // Confidence score
    const confidenceScore = face.confidence * 30;
    
    return Math.round(centeringScore + sizeScore + confidenceScore);
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    if (this.detector) {
      this.detector.dispose();
      this.detector = null;
    }
    this.initialized = false;
  }
}

// Export singleton instance
export const faceDetectionService = FaceDetectionService.getInstance();

// Export types
export type { FaceRect };