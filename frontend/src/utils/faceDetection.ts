import * as faceapi from 'face-api.js';

let modelsLoaded = false;

/**
 * Load face detection models
 */
export const loadFaceDetectionModels = async (): Promise<void> => {
  if (modelsLoaded) return;
  
  try {
    // Load only the tiny face detector model for faster performance
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    modelsLoaded = true;
    console.log('✅ Face detection models loaded');
  } catch (error) {
    console.error('❌ Failed to load face detection models:', error);
    throw error;
  }
};

/**
 * Detect faces in video stream
 */
export const detectFaces = async (video: HTMLVideoElement): Promise<faceapi.FaceDetection[]> => {
  if (!modelsLoaded) {
    await loadFaceDetectionModels();
  }
  
  const detections = await faceapi.detectAllFaces(
    video,
    new faceapi.TinyFaceDetectorOptions({
      inputSize: 320, // Smaller size for faster detection
      scoreThreshold: 0.5
    })
  );
  
  return detections;
};

/**
 * Check if face is properly positioned for capture
 */
export const isFaceWellPositioned = (
  detection: faceapi.FaceDetection,
  videoWidth: number,
  videoHeight: number
): boolean => {
  const box = detection.box;
  
  // Face should be roughly centered
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;
  
  const isXCentered = centerX > videoWidth * 0.3 && centerX < videoWidth * 0.7;
  const isYCentered = centerY > videoHeight * 0.2 && centerY < videoHeight * 0.8;
  
  // Face should be large enough (at least 20% of frame height)
  const isSizeGood = box.height > videoHeight * 0.2;
  
  // Face detection confidence should be high enough
  const isConfident = detection.score > 0.7;
  
  return isXCentered && isYCentered && isSizeGood && isConfident;
};

/**
 * Calculate face quality score (0-100)
 */
export const getFaceQualityScore = (
  detection: faceapi.FaceDetection,
  videoWidth: number,
  videoHeight: number
): number => {
  const box = detection.box;
  
  // Calculate centering score
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;
  
  const xOffset = Math.abs(centerX - videoWidth / 2) / (videoWidth / 2);
  const yOffset = Math.abs(centerY - videoHeight / 2) / (videoHeight / 2);
  const centeringScore = (1 - (xOffset + yOffset) / 2) * 40; // Max 40 points
  
  // Calculate size score
  const faceAreaRatio = (box.width * box.height) / (videoWidth * videoHeight);
  const idealRatio = 0.15; // 15% of frame
  const sizeScore = Math.min(faceAreaRatio / idealRatio, 1) * 30; // Max 30 points
  
  // Detection confidence score
  const confidenceScore = detection.score * 30; // Max 30 points
  
  return Math.round(centeringScore + sizeScore + confidenceScore);
};