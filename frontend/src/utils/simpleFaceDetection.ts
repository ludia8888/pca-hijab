/**
 * Simple face detection using browser's built-in face detection API
 * Falls back to basic heuristics if not available
 */

interface FaceRect {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

let faceDetector: any = null;

/**
 * Initialize face detector
 */
export const initFaceDetector = async (): Promise<boolean> => {
  try {
    // Check if browser supports FaceDetector API
    if ('FaceDetector' in window) {
      // @ts-ignore - FaceDetector is experimental
      faceDetector = new window.FaceDetector();
      console.log('✅ Native FaceDetector API initialized');
      return true;
    }
    console.log('ℹ️ FaceDetector API not available, using fallback');
    return false;
  } catch (error) {
    console.error('Failed to initialize face detector:', error);
    return false;
  }
};

/**
 * Detect faces in video element
 */
export const detectFaceInVideo = async (video: HTMLVideoElement): Promise<FaceRect | null> => {
  try {
    // If native FaceDetector is available, use it
    if (faceDetector) {
      const faces = await faceDetector.detect(video);
      if (faces.length > 0) {
        const face = faces[0].boundingBox;
        return {
          x: face.x,
          y: face.y,
          width: face.width,
          height: face.height,
          confidence: 0.9
        };
      }
    }
    
    // Fallback: Simple center detection
    // Assume face is in center of video
    const centerX = video.videoWidth / 2;
    const centerY = video.videoHeight / 2;
    const faceWidth = video.videoWidth * 0.3; // Assume face is 30% of frame width
    const faceHeight = video.videoHeight * 0.4; // Assume face is 40% of frame height
    
    return {
      x: centerX - faceWidth / 2,
      y: centerY - faceHeight / 2,
      width: faceWidth,
      height: faceHeight,
      confidence: 0.5 // Lower confidence for fallback
    };
  } catch (error) {
    console.error('Face detection error:', error);
    return null;
  }
};

/**
 * Check if face is well positioned
 */
export const isFaceWellPositioned = (
  face: FaceRect,
  videoWidth: number,
  videoHeight: number
): boolean => {
  const centerX = face.x + face.width / 2;
  const centerY = face.y + face.height / 2;
  
  // Check if face is centered
  const isXCentered = centerX > videoWidth * 0.3 && centerX < videoWidth * 0.7;
  const isYCentered = centerY > videoHeight * 0.2 && centerY < videoHeight * 0.8;
  
  // Check if face is large enough
  const faceAreaRatio = (face.width * face.height) / (videoWidth * videoHeight);
  const isSizeGood = faceAreaRatio > 0.08; // At least 8% of frame
  
  // Check confidence
  const isConfident = face.confidence > 0.6;
  
  return isXCentered && isYCentered && isSizeGood && isConfident;
};

/**
 * Calculate face quality score (0-100)
 */
export const getFaceQualityScore = (
  face: FaceRect,
  videoWidth: number,
  videoHeight: number
): number => {
  const centerX = face.x + face.width / 2;
  const centerY = face.y + face.height / 2;
  
  // Centering score
  const xOffset = Math.abs(centerX - videoWidth / 2) / (videoWidth / 2);
  const yOffset = Math.abs(centerY - videoHeight / 2) / (videoHeight / 2);
  const centeringScore = (1 - (xOffset + yOffset) / 2) * 40;
  
  // Size score
  const faceAreaRatio = (face.width * face.height) / (videoWidth * videoHeight);
  const sizeScore = Math.min(faceAreaRatio / 0.15, 1) * 30;
  
  // Confidence score
  const confidenceScore = face.confidence * 30;
  
  return Math.round(centeringScore + sizeScore + confidenceScore);
};