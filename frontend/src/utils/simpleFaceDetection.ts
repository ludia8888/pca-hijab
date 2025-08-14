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
  console.log('🔧 [FaceDetector] Checking browser support...');
  console.log('🔧 [FaceDetector] Window object:', typeof window);
  console.log('🔧 [FaceDetector] FaceDetector available:', 'FaceDetector' in window);
  
  try {
    // Check if browser supports FaceDetector API
    if ('FaceDetector' in window) {
      console.log('🔧 [FaceDetector] Attempting to create FaceDetector instance...');
      // @ts-ignore - FaceDetector is experimental
      faceDetector = new window.FaceDetector();
      console.log('✅ [FaceDetector] Native FaceDetector API initialized successfully');
      console.log('✅ [FaceDetector] FaceDetector instance:', faceDetector);
      return true;
    }
    console.log('ℹ️ [FaceDetector] FaceDetector API not available, will use fallback');
    return false;
  } catch (error) {
    console.error('❌ [FaceDetector] Failed to initialize face detector:', error);
    return false;
  }
};

/**
 * Detect faces in video element
 */
export const detectFaceInVideo = async (video: HTMLVideoElement): Promise<FaceRect | null> => {
  console.log('🎯 [detectFaceInVideo] Called with video:', {
    videoWidth: video.videoWidth,
    videoHeight: video.videoHeight,
    readyState: video.readyState,
    paused: video.paused
  });
  
  try {
    // If native FaceDetector is available, use it
    if (faceDetector) {
      console.log('🔍 [detectFaceInVideo] Using native FaceDetector...');
      const faces = await faceDetector.detect(video);
      console.log('📊 [detectFaceInVideo] FaceDetector results:', faces);
      
      if (faces.length > 0) {
        const face = faces[0].boundingBox;
        const result = {
          x: face.x,
          y: face.y,
          width: face.width,
          height: face.height,
          confidence: 0.9
        };
        console.log('✅ [detectFaceInVideo] Face detected with native API:', result);
        return result;
      } else {
        console.log('❌ [detectFaceInVideo] No faces detected by native API');
      }
    } else {
      console.log('⚠️ [detectFaceInVideo] FaceDetector not available, using fallback');
    }
    
    // Fallback: Simple center detection
    // Assume face is in center of video
    console.log('🔄 [detectFaceInVideo] Using fallback detection...');
    const centerX = video.videoWidth / 2;
    const centerY = video.videoHeight / 2;
    const faceWidth = video.videoWidth * 0.3; // Assume face is 30% of frame width
    const faceHeight = video.videoHeight * 0.4; // Assume face is 40% of frame height
    
    const fallbackResult = {
      x: centerX - faceWidth / 2,
      y: centerY - faceHeight / 2,
      width: faceWidth,
      height: faceHeight,
      confidence: 0.7 // Increase confidence for fallback to enable auto-capture
    };
    
    console.log('📦 [detectFaceInVideo] Fallback result:', fallbackResult);
    return fallbackResult;
  } catch (error) {
    console.error('❌ [detectFaceInVideo] Face detection error:', error);
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
  
  // Check confidence (lower threshold for fallback mode)
  const isConfident = face.confidence >= 0.5; // Accept fallback confidence
  
  const result = isXCentered && isYCentered && isSizeGood && isConfident;
  
  console.log('📏 [isFaceWellPositioned] Position check:', {
    centerX,
    centerY,
    isXCentered,
    isYCentered,
    faceAreaRatio,
    isSizeGood,
    confidence: face.confidence,
    isConfident,
    result
  });
  
  return result;
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
  
  const totalScore = Math.round(centeringScore + sizeScore + confidenceScore);
  
  console.log('💯 [getFaceQualityScore] Quality calculation:', {
    centerX,
    centerY,
    xOffset,
    yOffset,
    centeringScore,
    faceAreaRatio,
    sizeScore,
    confidence: face.confidence,
    confidenceScore,
    totalScore
  });
  
  return totalScore;
};