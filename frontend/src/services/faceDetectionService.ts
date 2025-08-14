/**
 * Centralized Face Detection Service
 * Manages face detection using native FaceDetector API or face-api.js fallback
 * Implements proper singleton pattern and resource management
 */

import * as faceapi from 'face-api.js';

interface FaceRect {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

class FaceDetectionService {
  private static instance: FaceDetectionService | null = null;
  private nativeFaceDetector: any = null;
  private modelsLoaded = false;
  private modelsLoading = false;
  private modelLoadPromise: Promise<void> | null = null;
  private initialized = false;

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
   * Initialize face detection (native API or face-api.js)
   */
  async initialize(): Promise<boolean> {
    if (this.initialized) {
      return true;
    }

    console.log('🔧 [FaceDetectionService] Initializing...');

    // Try native FaceDetector API first
    if ('FaceDetector' in window) {
      try {
        // @ts-ignore - FaceDetector is experimental
        this.nativeFaceDetector = new window.FaceDetector();
        this.initialized = true;
        console.log('✅ [FaceDetectionService] Native FaceDetector API initialized');
        return true;
      } catch (error) {
        console.warn('⚠️ [FaceDetectionService] Native FaceDetector failed:', error);
      }
    }

    // Fall back to face-api.js
    try {
      await this.loadFaceApiModels();
      this.initialized = true;
      console.log('✅ [FaceDetectionService] face-api.js initialized as fallback');
      return true;
    } catch (error) {
      console.error('❌ [FaceDetectionService] Failed to initialize:', error);
      this.initialized = false;
      return false;
    }
  }

  /**
   * Load face-api.js models (singleton pattern)
   */
  private async loadFaceApiModels(): Promise<void> {
    // Return if already loaded
    if (this.modelsLoaded) {
      return;
    }

    // Return existing promise if loading in progress
    if (this.modelLoadPromise) {
      return this.modelLoadPromise;
    }

    // Create new loading promise
    this.modelLoadPromise = this.loadModelsInternal();
    
    try {
      await this.modelLoadPromise;
    } finally {
      this.modelLoadPromise = null;
    }
  }

  /**
   * Internal model loading logic
   */
  private async loadModelsInternal(): Promise<void> {
    console.log('🔧 [FaceDetectionService] Loading face-api.js models...');
    
    try {
      // Models must be loaded from external files
      const modelPath = '/models';
      
      // Load from local models (required for face-api.js to work)
      await faceapi.nets.tinyFaceDetector.loadFromUri(modelPath);
      console.log('✅ [FaceDetectionService] Loaded models from local path');
      
      this.modelsLoaded = true;
      console.log('✅ [FaceDetectionService] face-api.js models ready');
    } catch (error) {
      console.error('❌ [FaceDetectionService] Failed to load models:', error);
      console.error('❌ [FaceDetectionService] Make sure model files exist in /public/models directory');
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

    try {
      // Use native API if available
      if (this.nativeFaceDetector) {
        const faces = await this.nativeFaceDetector.detect(video);
        if (faces && faces.length > 0) {
          const face = faces[0].boundingBox;
          return {
            x: face.x,
            y: face.y,
            width: face.width,
            height: face.height,
            confidence: 0.9
          };
        }
        return null;
      }

      // Use face-api.js fallback
      if (this.modelsLoaded) {
        return await this.detectWithFaceApi(video);
      }

      console.error('❌ [FaceDetectionService] No detection method available');
      return null;
    } catch (error) {
      console.error('❌ [FaceDetectionService] Detection error:', error);
      return null;
    }
  }

  /**
   * Detect face using face-api.js
   */
  private async detectWithFaceApi(video: HTMLVideoElement): Promise<FaceRect | null> {
    // Create canvas for video frame
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      console.error('❌ [FaceDetectionService] Failed to create canvas context');
      return null;
    }

    // Draw current frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Detect faces
    const detections = await faceapi.detectAllFaces(
      canvas,
      new faceapi.TinyFaceDetectorOptions({
        inputSize: 416,
        scoreThreshold: 0.5
      })
    );

    if (detections.length === 0) {
      return null;
    }

    const face = detections[0];
    const box = face.box;
    
    // Validate face size (at least 2% of frame)
    const faceArea = (box.width * box.height) / (canvas.width * canvas.height);
    if (faceArea < 0.02) {
      console.log('⚠️ [FaceDetectionService] Face too small:', faceArea);
      return null;
    }

    return {
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height,
      confidence: face.score
    };
  }

  /**
   * Detect face in image element
   */
  async detectFaceInImage(image: HTMLImageElement): Promise<FaceRect | null> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.modelsLoaded) {
      console.error('❌ [FaceDetectionService] Models not loaded for image detection');
      return null;
    }

    try {
      const detections = await faceapi.detectAllFaces(
        image,
        new faceapi.TinyFaceDetectorOptions({
          inputSize: 416,
          scoreThreshold: 0.5
        })
      );

      if (detections.length === 0) {
        return null;
      }

      const face = detections[0];
      const box = face.box;
      
      return {
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
        confidence: face.score
      };
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
    this.nativeFaceDetector = null;
    this.initialized = false;
    // Note: face-api.js models stay in memory for reuse
  }
}

// Export singleton instance
export const faceDetectionService = FaceDetectionService.getInstance();

// Export types
export type { FaceRect };