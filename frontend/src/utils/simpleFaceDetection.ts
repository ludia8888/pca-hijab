/**
 * Simple face detection using browser's built-in face detection API
 * Falls back to face-api.js if not available
 */

import * as faceapi from 'face-api.js';

interface FaceRect {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

let faceDetector: any = null;
let faceApiModelsLoaded = false;
let faceApiModelsLoading = false;

/**
 * Load face-api.js models for fallback detection
 */
const loadFaceApiModels = async (): Promise<void> => {
  if (faceApiModelsLoaded) {
    return;
  }
  
  if (faceApiModelsLoading) {
    // Wait for models to load
    while (faceApiModelsLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return;
  }

  try {
    faceApiModelsLoading = true;
    console.log('🔧 [FaceDetector] Loading face-api.js models for fallback...');

    // Load models from CDN
    const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/model';
    
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    
    faceApiModelsLoaded = true;
    console.log('✅ [FaceDetector] face-api.js models loaded successfully');
  } catch (error) {
    console.error('❌ [FaceDetector] Failed to load face-api.js models:', error);
  } finally {
    faceApiModelsLoading = false;
  }
};

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
    console.log('ℹ️ [FaceDetector] FaceDetector API not available, will use face-api.js fallback');
    
    // Pre-load face-api.js models for fallback
    console.log('🔧 [FaceDetector] Pre-loading face-api.js models...');
    await loadFaceApiModels();
    
    return faceApiModelsLoaded;
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
    
    // Use face-api.js as fallback
    console.log('🔄 [detectFaceInVideo] Using face-api.js fallback detection...');
    
    try {
      // Load models if not already loaded
      await loadFaceApiModels();
      
      if (!faceApiModelsLoaded) {
        console.log('❌ [detectFaceInVideo] face-api.js models not loaded');
        return null;
      }
      
      // Create canvas to capture current video frame
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        console.log('❌ [detectFaceInVideo] Could not create canvas context');
        return null;
      }
      
      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Detect faces using face-api.js with stricter threshold
      const detections = await faceapi
        .detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions({
          inputSize: 416,  // Larger input for better accuracy
          scoreThreshold: 0.6  // Stricter threshold to avoid false positives
        }));
      
      console.log(`📊 [detectFaceInVideo] face-api.js detected ${detections.length} face(s)`);
      
      if (detections.length > 0) {
        const face = detections[0];
        const box = face.box;
        
        // Additional validation: check if face is reasonable size
        const faceArea = (box.width * box.height) / (canvas.width * canvas.height);
        if (faceArea < 0.01) { // Face too small (less than 1% of frame)
          console.log('❌ [detectFaceInVideo] Face too small, likely false positive');
          return null;
        }
        
        const result = {
          x: box.x,
          y: box.y,
          width: box.width,
          height: box.height,
          confidence: face.score
        };
        
        console.log('✅ [detectFaceInVideo] Face detected with face-api.js:', result);
        console.log(`📏 [detectFaceInVideo] Face area: ${(faceArea * 100).toFixed(2)}% of frame`);
        return result;
      } else {
        console.log('❌ [detectFaceInVideo] No faces detected by face-api.js');
        return null;
      }
    } catch (error) {
      console.error('❌ [detectFaceInVideo] face-api.js detection error:', error);
      return null;
    }
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