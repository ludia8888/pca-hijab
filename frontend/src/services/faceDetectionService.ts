/**
 * Centralized Face Detection Service
 * Uses native browser FaceDetector API if available, 
 * falls back to simple video analysis for basic face detection
 * No external model dependencies for production stability
 */

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
   * Initialize face detection - try native API only
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
    console.log('🔧 [FaceDetectionService] Initializing face detection...');

    // Try native FaceDetector API first (Chrome/Edge experimental feature)
    if ('FaceDetector' in window) {
      try {
        // @ts-ignore - FaceDetector is experimental
        this.nativeFaceDetector = new window.FaceDetector();
        this.initialized = true;
        console.log('✅ [FaceDetectionService] Native FaceDetector API initialized');
        return;
      } catch (error) {
        console.warn('⚠️ [FaceDetectionService] Native FaceDetector failed:', error);
      }
    }

    // No external models - use simple fallback
    console.log('✅ [FaceDetectionService] Using simple fallback detection');
    this.initialized = true;
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
    if (!video) {
      console.error('❌ [FaceDetectionService] Video element is null');
      return null;
    }
    
    if (video.readyState < 2) {
      console.warn('⚠️ [FaceDetectionService] Video not ready, readyState:', video.readyState);
      return null;
    }

    try {
      // Use native API if available
      if (this.nativeFaceDetector) {
        const faces = await this.nativeFaceDetector.detect(video);
        if (faces && faces.length > 0) {
          const face = faces[0].boundingBox;
          console.log('✅ [FaceDetectionService] Native detection found face');
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

      // Simple fallback: Use basic image analysis
      return this.simpleFaceDetection(video);
    } catch (error) {
      console.error('❌ [FaceDetectionService] Detection error:', error);
      return null;
    }
  }

  /**
   * Simple face detection fallback using basic image analysis
   */
  private simpleFaceDetection(video: HTMLVideoElement): FaceRect | null {
    try {
      // Create canvas for analysis
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640; // Fallback dimensions
      canvas.height = video.videoHeight || 480;
      
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        console.error('❌ [FaceDetectionService] Cannot get canvas context');
        return null;
      }

      // Draw current frame
      try {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      } catch (drawError) {
        console.error('❌ [FaceDetectionService] Error drawing video to canvas:', drawError);
        return null;
      }
      
      // Get image data for analysis
      let imageData;
      try {
        imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      } catch (imageError) {
        console.error('❌ [FaceDetectionService] Error getting image data:', imageError);
        return null;
      }
      
      const data = imageData.data;
      
      // Simple skin tone detection for face area
      let minX = canvas.width, minY = canvas.height;
      let maxX = 0, maxY = 0;
      let skinPixelCount = 0;
      
      // Scan center region where face is likely to be
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const scanRadius = Math.min(canvas.width, canvas.height) * 0.4;
      
      for (let y = Math.max(0, centerY - scanRadius); y < Math.min(canvas.height, centerY + scanRadius); y += 2) {
        for (let x = Math.max(0, centerX - scanRadius); x < Math.min(canvas.width, centerX + scanRadius); x += 2) {
          const idx = (y * canvas.width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          
          // Simple skin tone detection (works for various skin tones)
          const isSkinTone = this.isSkinTone(r, g, b);
          
          if (isSkinTone) {
            skinPixelCount++;
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
          }
        }
      }
      
      // Need minimum skin pixels to consider it a face
      const totalScannedPixels = (scanRadius * 2) * (scanRadius * 2) / 4; // Divided by 4 because we skip pixels
      const skinRatio = skinPixelCount / totalScannedPixels;
      
      if (skinRatio > 0.20) { // At least 20% skin pixels (stricter to avoid false positives)
        // Expand the bounding box slightly
        const expansion = 20; // Moderate expansion
        const faceRect: FaceRect = {
          x: Math.max(0, minX - expansion),
          y: Math.max(0, minY - expansion),
          width: Math.min(canvas.width - (minX - expansion), (maxX - minX) + expansion * 2),
          height: Math.min(canvas.height - (minY - expansion), (maxY - minY) + expansion * 2),
          confidence: Math.min(skinRatio * 2, 0.9) // More conservative confidence
        };
        
        // Validate face size - must be substantial
        const faceArea = (faceRect.width * faceRect.height) / (canvas.width * canvas.height);
        if (faceArea > 0.08) { // Face should be at least 8% of frame (stricter)
          return faceRect;
        }
      }
      
      return null;
    } catch (error) {
      console.error('❌ [FaceDetectionService] Fallback detection error:', error);
      return null;
    }
  }

  /**
   * Check if RGB values represent a skin tone
   */
  private isSkinTone(r: number, g: number, b: number): boolean {
    // Multiple skin tone detection rules for inclusivity
    
    // Rule 1: RGB rule (works for lighter skin)
    const rule1 = r > 95 && g > 40 && b > 20 &&
                  Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
                  Math.abs(r - g) > 15 && r > g && r > b;
    
    // Rule 2: Normalized RGB (works for medium skin)
    const sum = r + g + b;
    if (sum > 0) {
      const nr = r / sum;
      const ng = g / sum;
      const rule2 = nr > 0.36 && ng > 0.28 && ng < 0.4;
      
      // Rule 3: HSV-based (works for darker skin)
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const diff = max - min;
      
      let h = 0;
      if (diff > 0) {
        if (max === r) {
          h = ((g - b) / diff) % 6;
        } else if (max === g) {
          h = (b - r) / diff + 2;
        } else {
          h = (r - g) / diff + 4;
        }
        h = h * 60;
        if (h < 0) h += 360;
      }
      
      const s = max === 0 ? 0 : diff / max;
      const v = max / 255;
      
      // Skin hue is typically 0-50 degrees
      const rule3 = (h >= 0 && h <= 50) && s >= 0.15 && s <= 0.8 && v >= 0.2;
      
      return rule1 || rule2 || rule3;
    }
    
    return rule1;
  }

  /**
   * Detect face in image element
   */
  async detectFaceInImage(image: HTMLImageElement): Promise<FaceRect | null> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Create canvas for analysis
      const canvas = document.createElement('canvas');
      canvas.width = image.width || 640; // Fallback dimensions
      canvas.height = image.height || 480;
      
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        console.error('❌ [FaceDetectionService] Cannot get canvas context');
        return null;
      }

      // Draw image to canvas
      try {
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      } catch (drawError) {
        console.error('❌ [FaceDetectionService] Error drawing image to canvas:', drawError);
        return null;
      }
      
      // Get image data for analysis
      let imageData;
      try {
        imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      } catch (imageError) {
        console.error('❌ [FaceDetectionService] Error getting image data:', imageError);
        return null;
      }
      
      const data = imageData.data;
      
      // Simple skin tone detection for face area
      let minX = canvas.width, minY = canvas.height;
      let maxX = 0, maxY = 0;
      let skinPixelCount = 0;
      
      // Scan center region where face is likely to be
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const scanRadius = Math.min(canvas.width, canvas.height) * 0.4;
      
      for (let y = Math.max(0, centerY - scanRadius); y < Math.min(canvas.height, centerY + scanRadius); y += 2) {
        for (let x = Math.max(0, centerX - scanRadius); x < Math.min(canvas.width, centerX + scanRadius); x += 2) {
          const idx = (y * canvas.width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          
          // Simple skin tone detection (works for various skin tones)
          const isSkinTone = this.isSkinTone(r, g, b);
          
          if (isSkinTone) {
            skinPixelCount++;
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
          }
        }
      }
      
      // Need minimum skin pixels to consider it a face
      const totalScannedPixels = (scanRadius * 2) * (scanRadius * 2) / 4; // Divided by 4 because we skip pixels
      const skinRatio = skinPixelCount / totalScannedPixels;
      
      if (skinRatio > 0.20) { // At least 20% skin pixels (stricter to avoid false positives)
        // Expand the bounding box slightly
        const expansion = 20; // Moderate expansion
        const faceRect: FaceRect = {
          x: Math.max(0, minX - expansion),
          y: Math.max(0, minY - expansion),
          width: Math.min(canvas.width - (minX - expansion), (maxX - minX) + expansion * 2),
          height: Math.min(canvas.height - (minY - expansion), (maxY - minY) + expansion * 2),
          confidence: Math.min(skinRatio * 2, 0.9) // More conservative confidence
        };
        
        // Validate face size - must be substantial
        const faceArea = (faceRect.width * faceRect.height) / (canvas.width * canvas.height);
        if (faceArea > 0.08) { // Face should be at least 8% of frame (stricter)
          return faceRect;
        }
      }
      
      return null;
    } catch (error) {
      console.error('❌ [FaceDetectionService] Image detection error:', error);
      return null;
    }
  }

  /**
   * Check if face is well positioned within the oval guide
   */
  isFaceWellPositioned(face: FaceRect, frameWidth: number, frameHeight: number): boolean {
    const faceCenterX = face.x + face.width / 2;
    const faceCenterY = face.y + face.height / 2;
    
    // Oval guide dimensions (60% width, 75% height as per UI)
    const ovalCenterX = frameWidth / 2;
    const ovalCenterY = frameHeight / 2;
    const ovalRadiusX = frameWidth * 0.3; // 60% width = radius of 30%
    const ovalRadiusY = frameHeight * 0.375; // 75% height = radius of 37.5%
    
    // Check if face center is within the oval using ellipse equation
    // (x-h)²/a² + (y-k)²/b² ≤ 1.0 (strict - must be within perfect oval)
    const normalizedX = (faceCenterX - ovalCenterX) / ovalRadiusX;
    const normalizedY = (faceCenterY - ovalCenterY) / ovalRadiusY;
    const distanceFromCenter = normalizedX * normalizedX + normalizedY * normalizedY;
    const isInOval = distanceFromCenter <= 1.0; // Must be within perfect oval (stricter)
    
    // Check face size (should fill a good portion of the oval)
    const faceAreaRatio = (face.width * face.height) / (frameWidth * frameHeight);
    const isSizeGood = faceAreaRatio > 0.08 && faceAreaRatio < 0.45; // 8-45% of frame (stricter bounds)
    
    // Check confidence - require higher confidence to avoid false positives
    const isConfident = face.confidence >= 0.5;
    
    const result = isInOval && isSizeGood && isConfident;
    
    // Only log when position check fails
    if (!result) {
      console.log('⚠️ [FaceDetectionService] Face position check failed:');
      if (!isInOval) console.log('  - Not in oval (distance:', distanceFromCenter.toFixed(2), ')');
      if (!isSizeGood) console.log('  - Size issue:', (faceAreaRatio * 100).toFixed(1) + '% (need: 8-45%)');
      if (!isConfident) console.log('  - Low confidence:', face.confidence.toFixed(2));
    }
    
    return result;
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
  }
}

// Export singleton instance
export const faceDetectionService = FaceDetectionService.getInstance();

// Export types
export type { FaceRect };