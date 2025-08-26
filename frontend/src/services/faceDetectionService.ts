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

  isFaceWellPositioned(face: FaceRect, frameWidth: number, frameHeight: number, ellipseBounds?: {
    centerX: number;
    centerY: number;
    radiusX: number;
    radiusY: number;
    videoBounds: DOMRect;
    videoWidth: number;
    videoHeight: number;
  }): boolean {
    // If we have actual ellipse bounds from the screen, use them
    // Otherwise fall back to conservative estimates
    let ovalCenterX: number;
    let ovalCenterY: number;
    let ovalRadiusX: number;
    let ovalRadiusY: number;
    
    if (ellipseBounds) {
      // We have the actual ellipse position on screen!
      // Now we need to map video coordinates to screen coordinates
      const videoBounds = ellipseBounds.videoBounds;
      
      // Calculate how the video is displayed (object-fit: cover)
      const videoAspectRatio = frameWidth / frameHeight;
      const displayAspectRatio = videoBounds.width / videoBounds.height;
      
      let scaleX = 1;
      let scaleY = 1;
      let offsetX = 0;
      let offsetY = 0;
      
      if (videoAspectRatio > displayAspectRatio) {
        // Video is wider - crop sides
        scaleY = videoBounds.height / frameHeight;
        scaleX = scaleY;
        const scaledWidth = frameWidth * scaleX;
        offsetX = (scaledWidth - videoBounds.width) / 2;
      } else {
        // Video is taller - crop top/bottom  
        scaleX = videoBounds.width / frameWidth;
        scaleY = scaleX;
        const scaledHeight = frameHeight * scaleY;
        offsetY = (scaledHeight - videoBounds.height) / 2;
      }
      
      // Convert ellipse screen coordinates to video frame coordinates
      ovalCenterX = (ellipseBounds.centerX - videoBounds.left + offsetX) / scaleX;
      ovalCenterY = (ellipseBounds.centerY - videoBounds.top + offsetY) / scaleY;
      ovalRadiusX = ellipseBounds.radiusX / scaleX;
      ovalRadiusY = ellipseBounds.radiusY / scaleY;
      
      console.log('🎯 [FaceDetection] Using actual ellipse bounds:', {
        screenEllipse: { cx: ellipseBounds.centerX, cy: ellipseBounds.centerY, rx: ellipseBounds.radiusX, ry: ellipseBounds.radiusY },
        videoEllipse: { cx: ovalCenterX, cy: ovalCenterY, rx: ovalRadiusX, ry: ovalRadiusY },
        videoFrame: { width: frameWidth, height: frameHeight },
        videoBounds: { width: videoBounds.width, height: videoBounds.height }
      });
    } else {
      // Fallback to conservative estimates
      ovalCenterX = frameWidth / 2;
      ovalCenterY = frameHeight / 2;
      ovalRadiusX = frameWidth * 0.43;
      ovalRadiusY = frameHeight * 0.30;  
    }
    
    // Check face size (should fill 4-25% of frame - allows wider range of distances)
    const faceAreaRatio = (face.width * face.height) / (frameWidth * frameHeight);
    const isSizeGood = faceAreaRatio > 0.04 && faceAreaRatio < 0.25;
    
    // MediaPipe confidence check
    const isConfident = face.confidence >= 0.5;
    
    // Check if ALL key facial features (both eyes, nose, mouth) are within the oval
    // ALL FOUR features must be inside - if even one is outside, don't capture
    let areFeaturesInOval = false;
    let featureStatus = { rightEye: false, leftEye: false, nose: false, mouth: false };
    
    // Track feature span to ensure eyes, nose, mouth optimally FILL the ellipse
    let featureSpanData = {
      minX: Infinity,
      maxX: -Infinity,
      minY: Infinity,
      maxY: -Infinity,
      widthFillRatio: 0,
      heightFillRatio: 0,
      isOptimalFill: false
    };
    
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
      
      // Debug logging
      console.log(`📐 [FaceDetectionService] Ellipse:`, {
        frameSize: `${frameWidth}x${frameHeight}`,
        ellipseRadii: `${ovalRadiusX.toFixed(0)}x${ovalRadiusY.toFixed(0)}`,
        center: `(${ovalCenterX.toFixed(0)}, ${ovalCenterY.toFixed(0)})`
      });
      
      // Check each feature individually
      criticalKeypoints.forEach(({ name, kp }) => {
        if (kp) {
          // Keypoints are in video frame coordinates
          // Update feature span tracking
          featureSpanData.minX = Math.min(featureSpanData.minX, kp.x);
          featureSpanData.maxX = Math.max(featureSpanData.maxX, kp.x);
          featureSpanData.minY = Math.min(featureSpanData.minY, kp.y);
          featureSpanData.maxY = Math.max(featureSpanData.maxY, kp.y);
          
          // Check if within ellipse
          const distFromCenterX = kp.x - ovalCenterX;
          const distFromCenterY = kp.y - ovalCenterY;
          const normalizedX = distFromCenterX / ovalRadiusX;
          const normalizedY = distFromCenterY / ovalRadiusY;
          const distance = normalizedX * normalizedX + normalizedY * normalizedY;
          // Use 1.0 for boundary checking - features must be inside the ellipse
          featureStatus[name] = distance <= 1.0;
          
          // Log exact distances for debugging
          if (distance > 1.0) {
            console.log(`    🔴 ${name}: distance=${distance.toFixed(3)} (>1.0) - OUTSIDE ellipse boundary`);
          }
        } else {
          console.log(`    ⚠️ ${name}: keypoint missing`);
        }
      });
      
      // ALL features must be inside the oval - STRICT REQUIREMENT
      areFeaturesInOval = featureStatus.rightEye && featureStatus.leftEye && 
                          featureStatus.nose && featureStatus.mouth;
      
      // Calculate feature span fill ratio if all features are inside
      if (areFeaturesInOval && featureSpanData.minX !== Infinity) {
        const featureWidth = featureSpanData.maxX - featureSpanData.minX;
        const featureHeight = featureSpanData.maxY - featureSpanData.minY;
        
        // Calculate fill ratios relative to the ellipse dimensions
        featureSpanData.widthFillRatio = featureWidth / (ovalRadiusX * 2);
        featureSpanData.heightFillRatio = featureHeight / (ovalRadiusY * 2);
        
        // Check if features optimally fill 30-70% of the ellipse (wider range for device variations)
        featureSpanData.isOptimalFill = 
          featureSpanData.widthFillRatio >= 0.30 && featureSpanData.widthFillRatio <= 0.70 &&
          featureSpanData.heightFillRatio >= 0.30 && featureSpanData.heightFillRatio <= 0.70;
        
        console.log(`📏 [FaceDetectionService] Feature span: width=${(featureSpanData.widthFillRatio * 100).toFixed(1)}%, height=${(featureSpanData.heightFillRatio * 100).toFixed(1)}%`);
        
        if (!featureSpanData.isOptimalFill) {
          if (featureSpanData.widthFillRatio < 0.30 || featureSpanData.heightFillRatio < 0.30) {
            console.log('📐 [FaceDetectionService] Move CLOSER - face features only fill', 
              Math.min(featureSpanData.widthFillRatio, featureSpanData.heightFillRatio) * 100, '% of ellipse');
          } else if (featureSpanData.widthFillRatio > 0.70 || featureSpanData.heightFillRatio > 0.70) {
            console.log('📐 [FaceDetectionService] Move BACK - face features exceed optimal size');
          }
        } else {
          console.log('✨ [FaceDetectionService] PERFECT! Face features optimally fill the ellipse - ready for capture!');
        }
      }
      
      if (!areFeaturesInOval) {
        const outsideFeatures = [];
        if (!featureStatus.rightEye) outsideFeatures.push('right eye');
        if (!featureStatus.leftEye) outsideFeatures.push('left eye');
        if (!featureStatus.nose) outsideFeatures.push('nose');
        if (!featureStatus.mouth) outsideFeatures.push('mouth');
        console.log('🚫 [FaceDetectionService] CAPTURE BLOCKED - Features outside oval:', outsideFeatures.join(', '));
      } else if (!featureSpanData.isOptimalFill) {
        console.log('🚫 [FaceDetectionService] CAPTURE BLOCKED - Features do not optimally fill ellipse');
      } else {
        console.log('✅ [FaceDetectionService] ALL conditions met - features inside AND optimally fill ellipse');
      }
    } else {
      // Fallback: if no keypoints, estimate facial feature positions based on face box
      const estimatedFeatures = [
        { name: 'leftEye', x: face.x + face.width * 0.3, y: face.y + face.height * 0.35 },
        { name: 'rightEye', x: face.x + face.width * 0.7, y: face.y + face.height * 0.35 },
        { name: 'nose', x: face.x + face.width * 0.5, y: face.y + face.height * 0.5 },
        { name: 'mouth', x: face.x + face.width * 0.5, y: face.y + face.height * 0.7 }
      ];
      
      // Check each estimated feature
      estimatedFeatures.forEach(feature => {
        // Update feature span tracking
        featureSpanData.minX = Math.min(featureSpanData.minX, feature.x);
        featureSpanData.maxX = Math.max(featureSpanData.maxX, feature.x);
        featureSpanData.minY = Math.min(featureSpanData.minY, feature.y);
        featureSpanData.maxY = Math.max(featureSpanData.maxY, feature.y);
        
        // Check if within ellipse (using frame coordinates)
        const distFromCenterX = feature.x - ovalCenterX;
        const distFromCenterY = feature.y - ovalCenterY;
        const normalizedX = distFromCenterX / ovalRadiusX;
        const normalizedY = distFromCenterY / ovalRadiusY;
        const distance = normalizedX * normalizedX + normalizedY * normalizedY;
        featureStatus[feature.name] = distance <= 1.0;
        
        // Log exact distances for debugging
        if (distance > 1.0) {
          console.log(`    🔴 ${feature.name} (estimated): distance=${distance.toFixed(3)} (>1.0) - OUTSIDE`);
        }
      });
      
      // ALL features must be inside
      areFeaturesInOval = featureStatus.rightEye && featureStatus.leftEye && 
                          featureStatus.nose && featureStatus.mouth;
      
      // Calculate fill ratio for estimated features
      if (areFeaturesInOval && featureSpanData.minX !== Infinity) {
        const featureWidth = featureSpanData.maxX - featureSpanData.minX;
        const featureHeight = featureSpanData.maxY - featureSpanData.minY;
        
        featureSpanData.widthFillRatio = featureWidth / (ovalRadiusX * 2);
        featureSpanData.heightFillRatio = featureHeight / (ovalRadiusY * 2);
        
        featureSpanData.isOptimalFill = 
          featureSpanData.widthFillRatio >= 0.30 && featureSpanData.widthFillRatio <= 0.70 &&
          featureSpanData.heightFillRatio >= 0.30 && featureSpanData.heightFillRatio <= 0.70;
        
        console.log(`📏 [FaceDetectionService] Estimated feature span: width=${(featureSpanData.widthFillRatio * 100).toFixed(1)}%, height=${(featureSpanData.heightFillRatio * 100).toFixed(1)}%`);
      }
      
      if (!areFeaturesInOval) {
        const outsideFeatures = [];
        if (!featureStatus.rightEye) outsideFeatures.push('right eye');
        if (!featureStatus.leftEye) outsideFeatures.push('left eye');
        if (!featureStatus.nose) outsideFeatures.push('nose');
        if (!featureStatus.mouth) outsideFeatures.push('mouth');
        console.log('⚠️ [FaceDetectionService] CAPTURE BLOCKED - Estimated features outside oval:', outsideFeatures.join(', '));
      }
    }
    
    // UPDATED: Result now requires features to be inside AND optimally fill the ellipse
    const result = areFeaturesInOval && featureSpanData.isOptimalFill && isSizeGood && isConfident;
    
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
      if (!featureSpanData.isOptimalFill) {
        console.log('  ❌ Face features do not optimally fill ellipse');
        console.log(`     Width fill: ${(featureSpanData.widthFillRatio * 100).toFixed(1)}% (need 30-70%)`);
        console.log(`     Height fill: ${(featureSpanData.heightFillRatio * 100).toFixed(1)}% (need 30-70%)`);
        if (featureSpanData.widthFillRatio < 0.30 || featureSpanData.heightFillRatio < 0.30) {
          console.log('  💡 Suggestion: Move CLOSER to camera');
        } else if (featureSpanData.widthFillRatio > 0.70 || featureSpanData.heightFillRatio > 0.70) {
          console.log('  💡 Suggestion: Move AWAY from camera');
        }
      }
      if (!isSizeGood) console.log('  ⚠️ Size issue:', (faceAreaRatio * 100).toFixed(1) + '% (need: 7-10%)');
      if (!isConfident) console.log('  ⚠️ Low confidence:', face.confidence.toFixed(2));
    } else {
      console.log('✅ [FaceDetectionService] Face properly positioned - ALL features within ellipse AND optimally fill it');
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