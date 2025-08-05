/**
 * Client-side Image Validation using face-api.js
 * Provides immediate feedback before sending images to AI API
 */

import * as faceapi from 'face-api.js';
import { ImageAnalysisErrorType } from './imageAnalysisErrors';

// Face-api.js model loading state
let modelsLoaded = false;
let modelsLoading = false;

/**
 * Image validation result
 */
export interface ImageValidationResult {
  isValid: boolean;
  errorType?: ImageAnalysisErrorType;
  confidence?: number;
  details: {
    faceCount: number;
    faceArea?: number;
    facePosition?: { x: number; y: number; width: number; height: number };
    imageQuality: {
      brightness: number;
      contrast: number;
      sharpness: number;
    };
    warnings: string[];
  };
}

/**
 * Load face-api.js models (only once)
 */
export async function loadFaceApiModels(): Promise<void> {
  if (modelsLoaded) return;
  if (modelsLoading) {
    // Wait for existing loading to complete
    while (modelsLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return;
  }

  try {
    modelsLoading = true;
    console.log('Loading face-api.js models...');

    // Load models from CDN for better performance
    const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/model';
    
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);

    modelsLoaded = true;
    console.log('Face-api.js models loaded successfully');
  } catch (error) {
    console.error('Failed to load face-api.js models:', error);
    throw new Error('Face detection models failed to load');
  } finally {
    modelsLoading = false;
  }
}

/**
 * Validate image on client-side before uploading
 */
export async function validateImageClientSide(file: File): Promise<ImageValidationResult> {
  try {
    // Ensure models are loaded
    await loadFaceApiModels();

    // Create image element for processing
    const img = await createImageFromFile(file);
    
    // Analyze image
    const [faceValidation, qualityAnalysis] = await Promise.all([
      analyzeFaces(img),
      analyzeImageQuality(img)
    ]);

    // Combine results
    const result: ImageValidationResult = {
      isValid: true,
      details: {
        faceCount: faceValidation.faceCount,
        faceArea: faceValidation.faceArea,
        facePosition: faceValidation.facePosition,
        imageQuality: qualityAnalysis,
        warnings: []
      }
    };

    // Validate face detection
    if (faceValidation.faceCount === 0) {
      result.isValid = false;
      result.errorType = ImageAnalysisErrorType.NO_FACE_DETECTED;
      return result;
    }

    if (faceValidation.faceCount > 1) {
      result.isValid = false;
      result.errorType = ImageAnalysisErrorType.MULTIPLE_FACES;
      return result;
    }

    // Validate face size (should be at least 10% of image area)
    if (faceValidation.faceArea && faceValidation.faceArea < 0.1) {
      result.isValid = false;
      result.errorType = ImageAnalysisErrorType.FACE_TOO_SMALL;
      return result;
    }

    // Validate face position (should not be too close to edges)
    if (faceValidation.facePosition) {
      const { x, y, width, height } = faceValidation.facePosition;
      const imgWidth = img.width;
      const imgHeight = img.height;
      
      if (x < imgWidth * 0.05 || x + width > imgWidth * 0.95 ||
          y < imgHeight * 0.05 || y + height > imgHeight * 0.95) {
        result.details.warnings.push('Face is too close to image edges');
      }
    }

    // Enhanced lighting validation with more intelligent thresholds
    if (qualityAnalysis.brightness < 60) {
      result.isValid = false;
      result.errorType = ImageAnalysisErrorType.TOO_DARK;
      return result;
    }

    if (qualityAnalysis.brightness > 220) {
      result.isValid = false;
      result.errorType = ImageAnalysisErrorType.TOO_BRIGHT;
      return result;
    }

    // Check for poor lighting conditions (low brightness but not too dark)
    if (qualityAnalysis.brightness < 90 && qualityAnalysis.contrast < 40) {
      result.isValid = false;
      result.errorType = ImageAnalysisErrorType.POOR_LIGHTING;
      return result;
    }

    // Enhanced image quality validation
    if (qualityAnalysis.sharpness < 0.2) {
      result.isValid = false;
      result.errorType = ImageAnalysisErrorType.IMAGE_BLURRY;
      return result;
    }

    // Warn for borderline quality issues
    if (qualityAnalysis.sharpness < 0.4) {
      result.details.warnings.push('Image appears slightly blurry - consider taking a sharper photo');
    }

    if (qualityAnalysis.contrast < 25) {
      result.details.warnings.push('Low contrast detected - try better lighting');
    }

    // Enhanced lighting condition analysis
    const lightingAnalysis = await analyzeLightingConditions(img, qualityAnalysis);
    
    // Check for harsh shadows
    if (lightingAnalysis.harshShadows) {
      result.isValid = false;
      result.errorType = ImageAnalysisErrorType.HARSH_SHADOWS;
      return result;
    }
    
    // Check for overexposure patterns
    if (lightingAnalysis.overexposed) {
      result.details.warnings.push('Image may be overexposed - reduce lighting');
    }
    
    // Check for underexposure patterns
    if (lightingAnalysis.underexposed) {
      result.details.warnings.push('Image appears underexposed - increase lighting');
    }
    
    // Check for uneven lighting
    if (lightingAnalysis.unevenLighting) {
      result.details.warnings.push('Uneven lighting detected - use more diffused light source');
    }

    return result;

  } catch (error) {
    console.error('Client-side validation failed:', error);
    // Return valid result if client-side validation fails
    // This ensures the flow continues even if face-api.js has issues
    return {
      isValid: true,
      details: {
        faceCount: 1, // Assume valid
        imageQuality: {
          brightness: 128,
          contrast: 50,
          sharpness: 0.5
        },
        warnings: ['Client-side validation unavailable']
      }
    };
  }
}

/**
 * Analyze faces in the image
 */
async function analyzeFaces(img: HTMLImageElement): Promise<{
  faceCount: number;
  faceArea?: number;
  facePosition?: { x: number; y: number; width: number; height: number };
}> {
  const detections = await faceapi
    .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks();

  if (detections.length === 0) {
    return { faceCount: 0 };
  }

  if (detections.length > 1) {
    return { faceCount: detections.length };
  }

  // Analyze single face
  const detection = detections[0];
  const box = detection.detection.box;
  const imageArea = img.width * img.height;
  const faceArea = (box.width * box.height) / imageArea;

  return {
    faceCount: 1,
    faceArea,
    facePosition: {
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height
    }
  };
}

/**
 * Analyze image quality metrics with enhanced algorithms
 */
async function analyzeImageQuality(img: HTMLImageElement): Promise<{
  brightness: number;
  contrast: number;
  sharpness: number;
}> {
  // Create canvas for pixel analysis
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  // Use appropriate size for analysis (balance between accuracy and performance)
  const analysisSize = Math.min(300, Math.max(img.width, img.height));
  const aspectRatio = img.width / img.height;
  
  if (aspectRatio > 1) {
    canvas.width = analysisSize;
    canvas.height = Math.round(analysisSize / aspectRatio);
  } else {
    canvas.width = Math.round(analysisSize * aspectRatio);
    canvas.height = analysisSize;
  }
  
  // Draw image scaled
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
  // Get image data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  // Enhanced brightness calculation with histogram analysis
  const histogram = new Array(256).fill(0);
  let totalBrightness = 0;
  const pixelCount = data.length / 4;
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Calculate luminance using ITU-R BT.709 standard
    const brightness = Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);
    totalBrightness += brightness;
    histogram[brightness]++;
  }
  
  const avgBrightness = totalBrightness / pixelCount;
  
  // Calculate contrast using standard deviation method (more accurate than min-max)
  let varianceSum = 0;
  for (let i = 0; i < 256; i++) {
    if (histogram[i] > 0) {
      const diff = i - avgBrightness;
      varianceSum += histogram[i] * diff * diff;
    }
  }
  const contrast = Math.sqrt(varianceSum / pixelCount);
  
  // Enhanced sharpness calculation
  const sharpness = calculateEnhancedSharpness(data, canvas.width, canvas.height);
  
  return {
    brightness: avgBrightness,
    contrast: contrast,
    sharpness: sharpness
  };
}

/**
 * Calculate enhanced image sharpness using multiple methods
 */
function calculateEnhancedSharpness(data: Uint8ClampedArray, width: number, height: number): number {
  let laplacianVariance = 0;
  let sobelVariance = 0;
  let count = 0;
  
  // Process with both Laplacian and Sobel operators for better accuracy
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      
      // Get surrounding grayscale values using ITU-R BT.709 standard
      const getGray = (offset: number) => {
        const i = offset * 4;
        return 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
      };
      
      const center = getGray(y * width + x);
      const top = getGray((y - 1) * width + x);
      const bottom = getGray((y + 1) * width + x);
      const left = getGray(y * width + (x - 1));
      const right = getGray(y * width + (x + 1));
      const topLeft = getGray((y - 1) * width + (x - 1));
      const topRight = getGray((y - 1) * width + (x + 1));
      const bottomLeft = getGray((y + 1) * width + (x - 1));
      const bottomRight = getGray((y + 1) * width + (x + 1));
      
      // Laplacian operator (8-connected)
      const laplacian = Math.abs(
        -8 * center + top + bottom + left + right + topLeft + topRight + bottomLeft + bottomRight
      );
      
      // Sobel operators for edge detection
      const sobelX = Math.abs(
        -1 * topLeft + 1 * topRight +
        -2 * left + 2 * right +
        -1 * bottomLeft + 1 * bottomRight
      );
      
      const sobelY = Math.abs(
        -1 * topLeft - 2 * top - 1 * topRight +
        1 * bottomLeft + 2 * bottom + 1 * bottomRight
      );
      
      const sobelMagnitude = Math.sqrt(sobelX * sobelX + sobelY * sobelY);
      
      laplacianVariance += laplacian * laplacian;
      sobelVariance += sobelMagnitude * sobelMagnitude;
      count++;
    }
  }
  
  if (count === 0) return 0;
  
  // Combine both methods for better accuracy
  const laplacianSharpness = Math.sqrt(laplacianVariance / count) / 255;
  const sobelSharpness = Math.sqrt(sobelVariance / count) / 255;
  
  // Weighted combination (Laplacian is better for blur detection, Sobel for edge detection)
  return (0.7 * laplacianSharpness + 0.3 * sobelSharpness);
}

/**
 * Analyze specific lighting conditions in the image
 */
async function analyzeLightingConditions(img: HTMLImageElement, qualityAnalysis: {
  brightness: number;
  contrast: number;
  sharpness: number;
}): Promise<{
  harshShadows: boolean;
  overexposed: boolean;
  underexposed: boolean;
  unevenLighting: boolean;
}> {
  // Create canvas for detailed lighting analysis
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  // Use moderate size for detailed analysis
  const analysisSize = 150;
  canvas.width = analysisSize;
  canvas.height = analysisSize;
  
  ctx.drawImage(img, 0, 0, analysisSize, analysisSize);
  const imageData = ctx.getImageData(0, 0, analysisSize, analysisSize);
  const data = imageData.data;
  
  // Analyze brightness distribution across image regions
  const regionSize = analysisSize / 3; // Divide into 3x3 grid
  const regionBrightness: number[] = [];
  
  for (let ry = 0; ry < 3; ry++) {
    for (let rx = 0; rx < 3; rx++) {
      let regionSum = 0;
      let regionCount = 0;
      
      const startY = Math.floor(ry * regionSize);
      const endY = Math.floor((ry + 1) * regionSize);
      const startX = Math.floor(rx * regionSize);
      const endX = Math.floor((rx + 1) * regionSize);
      
      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          const idx = (y * analysisSize + x) * 4;
          const brightness = 0.2126 * data[idx] + 0.7152 * data[idx + 1] + 0.0722 * data[idx + 2];
          regionSum += brightness;
          regionCount++;
        }
      }
      
      regionBrightness.push(regionSum / regionCount);
    }
  }
  
  // Calculate lighting metrics
  const avgRegionBrightness = regionBrightness.reduce((a, b) => a + b, 0) / regionBrightness.length;
  const maxRegionBrightness = Math.max(...regionBrightness);
  const minRegionBrightness = Math.min(...regionBrightness);
  const brightnessRange = maxRegionBrightness - minRegionBrightness;
  
  // Detect lighting issues
  const harshShadows = brightnessRange > 100 && minRegionBrightness < 50 && qualityAnalysis.contrast > 70;
  const overexposed = regionBrightness.filter(b => b > 240).length >= 3; // More than 3 regions overexposed
  const underexposed = regionBrightness.filter(b => b < 40).length >= 3; // More than 3 regions underexposed
  const unevenLighting = brightnessRange > 80 && !harshShadows; // Uneven but not harsh shadows
  
  return {
    harshShadows,
    overexposed,
    underexposed,
    unevenLighting
  };
}

/**
 * Create HTML image element from File
 */
function createImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Check if client-side validation is available
 */
export function isClientValidationAvailable(): boolean {
  return typeof window !== 'undefined' && 'createObjectURL' in URL;
}