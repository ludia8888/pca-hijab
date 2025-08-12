import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import '@tensorflow/tfjs-backend-webgl';
import * as tf from '@tensorflow/tfjs';

interface LiveFaceDetectionProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isActive: boolean;
  onFaceDetected?: (detected: boolean) => void;
  className?: string;
}

interface FaceLandmark {
  x: number;
  y: number;
  z?: number;
}

interface DetectedFace {
  keypoints: FaceLandmark[];
  box: {
    xMin: number;
    yMin: number;
    xMax: number;
    yMax: number;
    width: number;
    height: number;
  };
}

const LiveFaceDetection: React.FC<LiveFaceDetectionProps> = ({
  videoRef,
  isActive,
  onFaceDetected,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [detector, setDetector] = useState<faceLandmarksDetection.FaceLandmarksDetector | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);

  // Initialize TensorFlow detector (reuse existing model if possible)
  useEffect(() => {
    const initializeDetector = async () => {
      try {
        console.log('🔧 [Live Detection] Initializing face detector for AR effects...');
        
        // Initialize TensorFlow.js
        await tf.ready();
        
        const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
        const detectorConfig = {
          runtime: 'tfjs' as const,
          refineLandmarks: false, // Disable for better performance
          maxFaces: 1, // Only detect one face for performance
          // Additional performance optimizations
          modelUrl: undefined, // Use default optimized model
        };
        
        const faceDetector = await faceLandmarksDetection.createDetector(model, detectorConfig);
        setDetector(faceDetector);
        console.log('✅ [Live Detection] Real-time face detector ready');
        
      } catch (err) {
        console.warn('⚠️ [Live Detection] Failed to initialize:', err);
        // Don't show error to user, this is optional enhancement
      }
    };

    if (isActive) {
      initializeDetector();
    }

    return () => {
      console.log('🧹 [Cleanup] Disposing LiveFaceDetection resources...');
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      // Dispose detector if it exists
      if (detector) {
        try {
          detector.dispose();
          console.log('✅ [Cleanup] Face detector disposed');
        } catch (error) {
          console.warn('⚠️ [Cleanup] Failed to dispose detector:', error);
        }
      }
    };
  }, [isActive]);

  // Draw minimal face landmarks for live feedback
  const drawLiveLandmarks = useCallback((faces: DetectedFace[]) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (faces.length === 0) {
      setFaceDetected(false);
      if (onFaceDetected) onFaceDetected(false);
      return;
    }

    setFaceDetected(true);
    if (onFaceDetected) onFaceDetected(true);

    faces.forEach((face) => {
      // Animated pulsing effect
      const pulseIntensity = Math.sin(animationPhase * 0.1) * 0.3 + 0.7;
      
      // Draw face bounding box with pulse
      ctx.strokeStyle = `rgba(0, 255, 159, ${pulseIntensity})`;
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 4]);
      ctx.strokeRect(
        face.box.xMin,
        face.box.yMin, 
        face.box.width,
        face.box.height
      );
      ctx.setLineDash([]);

      // Draw key landmarks only (for performance)
      const keyLandmarks = [
        // Eyes
        ...face.keypoints.slice(33, 42), // Right eye
        ...face.keypoints.slice(362, 374), // Left eye
        // Nose tip
        face.keypoints[1], face.keypoints[2],
        // Mouth corners  
        face.keypoints[61], face.keypoints[291],
        // Face outline key points
        face.keypoints[10], face.keypoints[152], face.keypoints[175]
      ].filter(Boolean);

      // Draw glowing landmarks
      ctx.fillStyle = `rgba(0, 255, 159, ${pulseIntensity})`;
      ctx.shadowColor = '#00FF9F';
      ctx.shadowBlur = 8;
      
      keyLandmarks.forEach((landmark, i) => {
        if (!landmark) return;
        
        const x = landmark.x;
        const y = landmark.y;
        
        // Staggered animation for visual appeal
        const staggerDelay = i * 2;
        const staggeredPulse = Math.sin((animationPhase - staggerDelay) * 0.08) * 0.5 + 1;
        
        ctx.beginPath();
        ctx.arc(x, y, 2 * staggeredPulse, 0, 2 * Math.PI);
        ctx.fill();
      });

      ctx.shadowBlur = 0;

      // AR-style "AI 인식 중" indicator that follows the face
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.fillStyle = 'rgba(0, 255, 159, 0.9)';
      ctx.fillText(
        'AI 얼굴 인식 중...',
        face.box.xMin,
        face.box.yMin - 15
      );

      // AR animation: Orbiting dots around face (like Instagram/Snapchat filters)
      for (let i = 0; i < 6; i++) {
        const angle = (animationPhase * 0.02 + i * Math.PI / 3);
        const radius = Math.min(face.box.width, face.box.height) * 0.6;
        const centerX = face.box.xMin + face.box.width / 2;
        const centerY = face.box.yMin + face.box.height / 2;
        
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        ctx.fillStyle = `rgba(0, 255, 159, ${0.3 + Math.sin(animationPhase * 0.05 + i) * 0.3})`;
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  }, [animationPhase, onFaceDetected, videoRef]);

  // Real-time detection loop with memory management
  const detectFaces = useCallback(async () => {
    if (!detector || !videoRef.current || !isActive) return;

    const video = videoRef.current;
    
    // Check if video is ready
    if (video.readyState !== 4 || video.videoWidth === 0) {
      animationFrameRef.current = requestAnimationFrame(detectFaces);
      return;
    }

    let detectedFaces: DetectedFace[] = [];

    try {
      // Detect faces directly from video element (MediaPipe optimized for this)
      const faces = await detector.estimateFaces(video);
      
      // Convert to our format for AR visualization
      detectedFaces = faces.map(face => ({
        keypoints: face.keypoints.map(kp => ({
          x: kp.x,
          y: kp.y,
          z: (kp as any).z || 0
        })),
        box: {
          xMin: face.box.xMin,
          yMin: face.box.yMin,
          xMax: face.box.xMax,
          yMax: face.box.yMax,
          width: face.box.width,
          height: face.box.height,
        }
      }));

      drawLiveLandmarks(detectedFaces);
      setAnimationPhase(prev => prev + 1);

    } catch (error) {
      console.warn('⚠️ [Live Detection] Frame detection failed:', error);
    }

    // Continue detection loop (throttled to ~8 FPS for better memory management)
    setTimeout(() => {
      if (isActive && detector) {
        animationFrameRef.current = requestAnimationFrame(detectFaces);
      }
    }, 125); // ~8 FPS - better balance for memory management

  }, [detector, isActive, drawLiveLandmarks, videoRef, animationPhase]);

  // Start/stop detection
  useEffect(() => {
    console.log('🔄 [LiveFaceDetection] Detection state changed:', {
      isActive,
      hasDetector: !!detector,
      hasVideoRef: !!videoRef.current
    });
    
    if (isActive && detector && videoRef.current) {
      console.log('▶️ [LiveFaceDetection] Starting face detection');
      setIsDetecting(true);
      detectFaces();
    } else {
      console.log('⏸️ [LiveFaceDetection] Stopping face detection');
      setIsDetecting(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      // Clear canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    }

    return () => {
      // Stop detection loop and clean up resources
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      // Clean up canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
      
    };
  }, [isActive, detector, detectFaces, videoRef]);

  return (
    <>
      {/* Overlay canvas for live face detection */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full pointer-events-none z-50 ${className}`}
        style={{ 
          mixBlendMode: 'normal', // Changed from 'screen' for better visibility
          opacity: isDetecting ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out'
        }}
      />
      
      {/* Status indicator */}
      {isDetecting && faceDetected && (
        <div className="absolute top-4 right-4 z-40 bg-green-500 bg-opacity-90 text-white px-3 py-1 rounded-full text-xs font-medium animate-pulse">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
            <span>AI 인식 중</span>
          </div>
        </div>
      )}
    </>
  );
};

export default LiveFaceDetection;