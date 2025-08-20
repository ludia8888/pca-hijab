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
  keypoints?: any[]; // MediaPipe keypoints for facial landmarks
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
      
      // Filter out low confidence detections to avoid false positives
      if (face.score && face.score < 0.7) {
        console.log('⚠️ [FaceDetection] Low confidence detection ignored:', (face.score * 100).toFixed(1) + '%');
        return null;
      }
      
      const box = face.box;
      
      // Additional sanity check - face should be reasonable size
      const faceArea = (box.width * box.height) / (video.videoWidth * video.videoHeight);
      if (faceArea < 0.02 || faceArea > 0.8) {
        console.log('⚠️ [FaceDetection] Unrealistic face size ignored:', (faceArea * 100).toFixed(1) + '%');
        return null;
      }
      
      // MediaPipe provides xMin, yMin, width, height
      const faceRect: FaceRect = {
        x: box.xMin,
        y: box.yMin,
        width: box.width,
        height: box.height,
        confidence: face.score || 0.5,
        // Store keypoints if available for landmark checking
        keypoints: face.keypoints
      };

      console.log('🎯 [FaceDetection] MediaPipe detected face:', {
        confidence: (faceRect.confidence * 100).toFixed(1) + '%',
        area: ((box.width * box.height) / (video.videoWidth * video.videoHeight) * 100).toFixed(1) + '%',
        hasKeypoints: !!face.keypoints
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
    // IMPORTANT: The video stream (frameWidth x frameHeight) is different from display size
    // We need to calculate the visible area that matches what user sees
    
    // The display container is 348.345 x 667 (aspect ratio)
    const displayAspectRatio = 348.345 / 667; // ~0.522
    const videoAspectRatio = frameWidth / frameHeight;
    
    let visibleWidth = frameWidth;
    let visibleHeight = frameHeight;
    let offsetX = 0;
    let offsetY = 0;
    
    // Calculate the actual visible area (object-fit: cover behavior)
    if (videoAspectRatio > displayAspectRatio) {
      // Video is wider - crop sides
      visibleWidth = frameHeight * displayAspectRatio;
      offsetX = (frameWidth - visibleWidth) / 2;
    } else {
      // Video is taller - crop top/bottom
      visibleHeight = frameWidth / displayAspectRatio;
      offsetY = (frameHeight - visibleHeight) / 2;
    }
    
    // Calculate oval center and radius in the visible area
    // Ellipse position: 34px from top, 143px from bottom
    // Center Y = 34 + 490/2 = 34 + 245 = 279 (in 667px height)
    const ovalCenterX = offsetX + visibleWidth / 2;
    const ovalCenterY = offsetY + (34 / 667) * visibleHeight + (490 / 667) * visibleHeight / 2;
    // Ellipse dimensions: 299px width, 490px height in 348.345px x 667px container
    const ovalRadiusX = (299 / 348.345) * visibleWidth / 2; 
    const ovalRadiusY = (490 / 667) * visibleHeight / 2;
    
    // Check face size (should fill 7-10% of frame - allows both close and medium distance)
    const faceAreaRatio = (face.width * face.height) / (frameWidth * frameHeight);
    const isSizeGood = faceAreaRatio > 0.07 && faceAreaRatio < 0.10;
    
    // MediaPipe confidence check
    const isConfident = face.confidence >= 0.5;
    
    // Check if ALL key facial features (both eyes, nose, mouth) are within the oval
    // ALL FOUR features must be inside - if even one is outside, don't capture
    let areFeaturesInOval = false;
    let featureStatus = { rightEye: false, leftEye: false, nose: false, mouth: false };
    
    if (face.keypoints && face.keypoints.length >= 4) {
      // MediaPipe provides 6 keypoints:
      // 0: right eye, 1: left eye, 2: nose tip, 3: mouth center, 4: right ear, 5: left ear
      
      // STRICT CHECK: Ensure ALL critical keypoints exist
      if (!face.keypoints[0] || !face.keypoints[1] || !face.keypoints[2] || !face.keypoints[3]) {
        console.log('⚠️ [FaceDetectionService] Missing critical keypoints - cannot verify face position');
        return false;
      }
      
      const criticalKeypoints = [
        { name: 'rightEye', kp: face.keypoints[0] },
        { name: 'leftEye', kp: face.keypoints[1] },
        { name: 'nose', kp: face.keypoints[2] },
        { name: 'mouth', kp: face.keypoints[3] }
      ];
      
      // Check each feature individually - must be STRICTLY WITHIN the oval (using 0.80 for even stricter boundary)
      criticalKeypoints.forEach(({ name, kp }) => {
        if (kp) {
          // Adjust keypoint coordinates to match visible area
          const adjustedX = kp.x - offsetX;
          const adjustedY = kp.y - offsetY;
          
          // Check if the keypoint is even within the visible area
          if (adjustedX < 0 || adjustedX > visibleWidth || adjustedY < 0 || adjustedY > visibleHeight) {
            featureStatus[name] = false;
            console.log(`    🔴 ${name}: OUTSIDE visible camera frame`);
            return;
          }
          
          const normalizedX = (adjustedX - (visibleWidth / 2)) / ovalRadiusX;
          const normalizedY = (adjustedY - (visibleHeight / 2)) / ovalRadiusY;
          const distance = normalizedX * normalizedX + normalizedY * normalizedY;
          // Use 0.80 for VERY STRICT boundary checking - features must be well inside
          featureStatus[name] = distance <= 0.80;
          
          // Log exact distances for debugging
          if (distance > 0.80) {
            console.log(`    🔴 ${name}: distance=${distance.toFixed(3)} (>${0.80}) - OUTSIDE ellipse boundary`);
          }
        } else {
          console.log(`    ⚠️ ${name}: keypoint missing`);
        }
      });
      
      // ALL features must be inside the oval - STRICT REQUIREMENT
      areFeaturesInOval = featureStatus.rightEye && featureStatus.leftEye && 
                          featureStatus.nose && featureStatus.mouth;
      
      if (!areFeaturesInOval) {
        const outsideFeatures = [];
        if (!featureStatus.rightEye) outsideFeatures.push('right eye');
        if (!featureStatus.leftEye) outsideFeatures.push('left eye');
        if (!featureStatus.nose) outsideFeatures.push('nose');
        if (!featureStatus.mouth) outsideFeatures.push('mouth');
        console.log('🚫 [FaceDetectionService] CAPTURE BLOCKED - Features outside oval:', outsideFeatures.join(', '));
      } else {
        console.log('✅ [FaceDetectionService] ALL 4 features verified inside ellipse boundary');
      }
    } else {
      // Fallback: if no keypoints, estimate facial feature positions based on face box
      // ALL estimated features must be within the oval
      const estimatedFeatures = [
        { name: 'leftEye', x: face.x + face.width * 0.3, y: face.y + face.height * 0.35 },
        { name: 'rightEye', x: face.x + face.width * 0.7, y: face.y + face.height * 0.35 },
        { name: 'nose', x: face.x + face.width * 0.5, y: face.y + face.height * 0.5 },
        { name: 'mouth', x: face.x + face.width * 0.5, y: face.y + face.height * 0.7 }
      ];
      
      // Check each estimated feature - must be STRICTLY WITHIN the oval
      estimatedFeatures.forEach(feature => {
        const normalizedX = (feature.x - ovalCenterX) / ovalRadiusX;
        const normalizedY = (feature.y - ovalCenterY) / ovalRadiusY;
        const distance = normalizedX * normalizedX + normalizedY * normalizedY;
        // Use 0.85 for VERY STRICT boundary checking
        featureStatus[feature.name] = distance <= 0.85;
        
        // Log exact distances for debugging
        if (distance > 0.85) {
          console.log(`    🔴 ${feature.name} (estimated): distance=${distance.toFixed(3)} (>${0.85}) - OUTSIDE`);
        }
      });
      
      // ALL features must be inside
      areFeaturesInOval = featureStatus.rightEye && featureStatus.leftEye && 
                          featureStatus.nose && featureStatus.mouth;
      
      if (!areFeaturesInOval) {
        const outsideFeatures = [];
        if (!featureStatus.rightEye) outsideFeatures.push('right eye');
        if (!featureStatus.leftEye) outsideFeatures.push('left eye');
        if (!featureStatus.nose) outsideFeatures.push('nose');
        if (!featureStatus.mouth) outsideFeatures.push('mouth');
        console.log('⚠️ [FaceDetectionService] CAPTURE BLOCKED - Estimated features outside oval:', outsideFeatures.join(', '));
      }
    }
    
    const result = areFeaturesInOval && isSizeGood && isConfident;
    
    if (!result) {
      console.log('🚫 [FaceDetectionService] CAPTURE BLOCKED - Face position check failed:');
      if (!areFeaturesInOval) {
        console.log('  ❌ Critical: Eyes, nose, or mouth outside ellipse boundary');
        console.log('     Feature status:', {
          rightEye: featureStatus.rightEye ? '✓' : '✗',
          leftEye: featureStatus.leftEye ? '✓' : '✗',
          nose: featureStatus.nose ? '✓' : '✗',
          mouth: featureStatus.mouth ? '✓' : '✗'
        });
      }
      if (!isSizeGood) console.log('  ⚠️ Size issue:', (faceAreaRatio * 100).toFixed(1) + '% (need: 7-10%)');
      if (!isConfident) console.log('  ⚠️ Low confidence:', face.confidence.toFixed(2));
    } else {
      console.log('✅ [FaceDetectionService] Face properly positioned - ALL features within ellipse');
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