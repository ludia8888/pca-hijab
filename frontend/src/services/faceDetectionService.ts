/**
 * Face Detection Service using MediaPipe
 * STRICT face detection - no fallbacks to weaker methods
 */

import * as faceDetection from '@tensorflow-models/face-detection';
import '@mediapipe/face_detection';

interface FaceRect {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

class FaceDetectionService {
  private static instance: FaceDetectionService | null = null;
  private detector: faceDetection.FaceDetector | null = null;
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  private constructor() {
    // Private constructor for singleton
  }

  static getInstance(): FaceDetectionService {
    if (!FaceDetectionService.instance) {
      FaceDetectionService.instance = new FaceDetectionService();
    }
    return FaceDetectionService.instance;
  }

  async initialize(): Promise<boolean> {
    if (this.initialized) {
      return true;
    }

    if (this.initPromise) {
      try {
        await this.initPromise;
        return this.initialized;
      } catch {
        return false;
      }
    }

    this.initPromise = this.initializeInternal();
    
    try {
      await this.initPromise;
      return this.initialized;
    } finally {
      this.initPromise = null;
    }
  }

  private async initializeInternal(): Promise<void> {
    console.log('🔧 [FaceDetectionService] Initializing MediaPipe face detection...');

    try {
      // Create MediaPipe face detector - NO FALLBACK
      const model = faceDetection.SupportedModels.MediaPipeFaceDetector;
      this.detector = await faceDetection.createDetector(model, {
        runtime: 'mediapipe',
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_detection',
        modelType: 'short', // short range model for selfies
        minDetectionConfidence: 0.5
      });
      
      this.initialized = true;
      console.log('✅ [FaceDetectionService] MediaPipe face detection initialized');
    } catch (error) {
      console.error('❌ [FaceDetectionService] Failed to initialize MediaPipe:', error);
      // NO FALLBACK - face detection is unavailable
      this.initialized = false;
      throw new Error('Face detection unavailable. Please use a modern browser.');
    }
  }

  async detectFaceInVideo(video: HTMLVideoElement): Promise<FaceRect | null> {
    if (!this.initialized) {
      console.warn('⚠️ [FaceDetectionService] Not initialized, initializing now...');
      const success = await this.initialize();
      if (!success) {
        console.error('❌ [FaceDetectionService] Initialization failed');
        return null;
      }
    }

    if (!video || video.readyState < 2) {
      console.warn('⚠️ [FaceDetectionService] Video not ready');
      return null;
    }

    if (!this.detector) {
      console.error('❌ [FaceDetectionService] No detector available');
      return null;
    }

    try {
      // Use MediaPipe to detect faces
      const predictions = await this.detector.estimateFaces(video);
      
      if (predictions.length === 0) {
        return null;
      }

      // Get the first (most prominent) face
      const face = predictions[0];
      const box = face.box;
      
      // MediaPipe provides xMin, yMin, width, height
      const faceRect: FaceRect = {
        x: box.xMin,
        y: box.yMin,
        width: box.width,
        height: box.height,
        confidence: face.score || 0.5
      };

      console.log('🎯 [FaceDetection] MediaPipe detected face:', {
        confidence: (faceRect.confidence * 100).toFixed(1) + '%',
        area: ((box.width * box.height) / (video.videoWidth * video.videoHeight) * 100).toFixed(1) + '%'
      });

      return faceRect;
    } catch (error) {
      console.error('❌ [FaceDetectionService] Detection error:', error);
      return null;
    }
  }

  async detectFaceInImage(image: HTMLImageElement): Promise<FaceRect | null> {
    if (!this.initialized) {
      const success = await this.initialize();
      if (!success) {
        return null;
      }
    }

    if (!this.detector) {
      console.error('❌ [FaceDetectionService] No detector available');
      return null;
    }

    try {
      const predictions = await this.detector.estimateFaces(image);
      
      if (predictions.length === 0) {
        return null;
      }

      const face = predictions[0];
      const box = face.box;
      
      return {
        x: box.xMin,
        y: box.yMin,
        width: box.width,
        height: box.height,
        confidence: face.score || 0.5
      };
    } catch (error) {
      console.error('❌ [FaceDetectionService] Image detection error:', error);
      return null;
    }
  }

  isFaceWellPositioned(face: FaceRect, frameWidth: number, frameHeight: number): boolean {
    const faceCenterX = face.x + face.width / 2;
    const faceCenterY = face.y + face.height / 2;
    
    // Oval guide dimensions (60% width, 75% height as per UI)
    const ovalCenterX = frameWidth / 2;
    const ovalCenterY = frameHeight / 2;
    const ovalRadiusX = frameWidth * 0.3;
    const ovalRadiusY = frameHeight * 0.375;
    
    // Check if face center is within the oval
    const normalizedX = (faceCenterX - ovalCenterX) / ovalRadiusX;
    const normalizedY = (faceCenterY - ovalCenterY) / ovalRadiusY;
    const distanceFromCenter = normalizedX * normalizedX + normalizedY * normalizedY;
    const isInOval = distanceFromCenter <= 1.0;
    
    // Check face size (should fill 10-40% of frame)
    const faceAreaRatio = (face.width * face.height) / (frameWidth * frameHeight);
    const isSizeGood = faceAreaRatio > 0.10 && faceAreaRatio < 0.40;
    
    // MediaPipe confidence check
    const isConfident = face.confidence >= 0.5;
    
    const result = isInOval && isSizeGood && isConfident;
    
    if (!result) {
      console.log('⚠️ [FaceDetectionService] Face position check failed:');
      if (!isInOval) console.log('  - Not in oval (distance:', distanceFromCenter.toFixed(2), ')');
      if (!isSizeGood) console.log('  - Size issue:', (faceAreaRatio * 100).toFixed(1) + '% (need: 10-40%)');
      if (!isConfident) console.log('  - Low confidence:', face.confidence.toFixed(2));
    }
    
    return result;
  }

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