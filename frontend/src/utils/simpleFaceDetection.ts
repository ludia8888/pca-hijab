/**
 * Simple face detection wrapper using centralized FaceDetectionService
 */

import { faceDetectionService, type FaceRect } from '@/services/faceDetectionService';

// Re-export FaceRect type for backward compatibility
export type { FaceRect };

/**
 * Initialize face detector
 */
export const initFaceDetector = async (): Promise<boolean> => {
  console.log('🔧 [FaceDetector] Initializing via FaceDetectionService...');
  return await faceDetectionService.initialize();
};

/**
 * Detect faces in video element
 */
export const detectFaceInVideo = async (video: HTMLVideoElement): Promise<FaceRect | null> => {
  console.log('🎯 [detectFaceInVideo] Delegating to FaceDetectionService');
  return await faceDetectionService.detectFaceInVideo(video);
};

/**
 * Check if face is well positioned
 */
export const isFaceWellPositioned = (
  face: FaceRect,
  videoWidth: number,
  videoHeight: number
): boolean => {
  return faceDetectionService.isFaceWellPositioned(face, videoWidth, videoHeight);
};

/**
 * Calculate face quality score (0-100)
 */
export const getFaceQualityScore = (
  face: FaceRect,
  videoWidth: number,
  videoHeight: number
): number => {
  return faceDetectionService.getFaceQualityScore(face, videoWidth, videoHeight);
};