import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import '@tensorflow/tfjs-backend-webgl';
import * as tf from '@tensorflow/tfjs';

interface FaceLandmarkVisualizationProps {
  imageUrl: string;
  onLandmarksDetected?: (landmarks: any[]) => void;
  className?: string;
  // External control for synchronization
  currentAnalysisStep?: number;
  forceAnimationPhase?: 'detecting' | 'extracting' | 'analyzing' | 'complete' | null;
}

interface FaceLandmark {
  x: number;
  y: number;
  z?: number;
  name?: string;
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

const FaceLandmarkVisualization: React.FC<FaceLandmarkVisualizationProps> = ({
  imageUrl,
  onLandmarksDetected,
  className = '',
  currentAnalysisStep = 0,
  forceAnimationPhase = null
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [detector, setDetector] = useState<faceLandmarksDetection.FaceLandmarksDetector | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [landmarks, setLandmarks] = useState<DetectedFace[]>([]);
  const [animationPhase, setAnimationPhase] = useState<'detecting' | 'extracting' | 'analyzing' | 'complete'>('detecting');

  // Initialize TensorFlow and face detector
  useEffect(() => {
    const initializeDetector = async () => {
      const startTime = performance.now();
      
      try {
        console.log('🔧 [TensorFlow] Starting initialization at', new Date().toISOString());
        
        console.log('🔧 [TensorFlow] Initializing backend and WebGL...');
        const backendStart = performance.now();
        await tf.ready();
        const backendTime = performance.now() - backendStart;
        console.log(`✅ [TensorFlow] Backend ready in ${Math.round(backendTime)}ms`);
        
        console.log('🔧 [MediaPipe] Loading Face Mesh model weights...');
        const modelStart = performance.now();
        const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
        const detectorConfig = {
          runtime: 'tfjs' as const,
          refineLandmarks: true,
        };
        
        const faceDetector = await faceLandmarksDetection.createDetector(model, detectorConfig);
        const modelTime = performance.now() - modelStart;
        console.log(`✅ [MediaPipe] Face Mesh model loaded in ${Math.round(modelTime)}ms`);
        
        setDetector(faceDetector);
        
        const totalTime = performance.now() - startTime;
        console.log(`🎯 [TensorFlow] Complete initialization in ${Math.round(totalTime)}ms`);
        console.log(`📊 [Performance] Backend: ${Math.round(backendTime)}ms, Model: ${Math.round(modelTime)}ms`);
        
        // Track performance for analytics
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'tensorflow_initialization', {
            'custom_parameter_3': totalTime, // load_time custom parameter
            'backend_time': backendTime,
            'model_time': modelTime
          });
        }
        
      } catch (err) {
        console.error('❌ [TensorFlow] Failed to initialize:', err);
        setError('AI 얼굴 인식 모델 로딩에 실패했습니다. 새로고침을 시도해주세요.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeDetector();
  }, []);

  // Draw face landmarks on canvas
  const drawLandmarks = useCallback((faces: DetectedFace[], phase: string) => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the image
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    faces.forEach((face, faceIndex) => {
      // More points for richer visualization, but still simple style
      const simplePhases = {
        detecting: {
          // Face outline and features - scanning effect
          points: face.keypoints.filter((_, i) => 
            // Eyes area
            (i >= 33 && i <= 46) || (i >= 263 && i <= 276) ||
            // Nose bridge and tip
            (i >= 1 && i <= 6) || (i >= 195 && i <= 197) ||
            // Mouth area
            (i >= 13 && i <= 17) || (i >= 269 && i <= 271) ||
            // Face contour
            i % 15 === 0
          ).filter(Boolean),
          color: '#00FF9F'
        },
        extracting: {
          // Color sampling areas - forehead, cheeks, chin, nose
          points: face.keypoints.filter((_, i) => 
            // Forehead area
            (i >= 9 && i <= 10) || (i >= 67 && i <= 69) || (i >= 107 && i <= 109) ||
            // Cheek areas
            (i >= 35 && i <= 36) || (i >= 116 && i <= 117) || 
            (i >= 213 && i <= 214) || (i >= 192 && i <= 193) ||
            // Nose and around
            (i >= 1 && i <= 6) || (i >= 19 && i <= 20) || (i >= 94 && i <= 125) ||
            // Chin area
            (i >= 17 && i <= 18) || (i >= 172 && i <= 175) ||
            // Jawline
            i % 20 === 0
          ).filter(Boolean),
          color: '#FF6B9D'
        },
        analyzing: {
          // Color space analysis - distributed points
          points: face.keypoints.filter((_, i) => 
            // Even distribution across face
            i % 8 === 0 || 
            // Key facial features
            (i >= 1 && i <= 17) || // Central line
            (i >= 93 && i <= 137) || // Mid face
            (i >= 356 && i <= 389) // Side face
          ).filter(Boolean),
          color: '#FFD93D'
        },
        complete: {
          // Final result - highlight key color zones
          points: face.keypoints.filter((_, i) => 
            // T-zone (forehead and nose)
            (i >= 9 && i <= 10) || (i >= 1 && i <= 6) ||
            // Cheek zones (important for color)
            (i >= 35 && i <= 36) || (i >= 266 && i <= 267) ||
            (i >= 116 && i <= 117) || (i >= 345 && i <= 346) ||
            // Under eye areas
            (i >= 46 && i <= 53) || (i >= 276 && i <= 283) ||
            // Mouth and chin
            (i >= 13 && i <= 14) || (i >= 17 && i <= 18) ||
            // Face outline key points
            i % 25 === 0
          ).filter(Boolean),
          color: '#8B5CF6'
        }
      };

      const currentPhase = simplePhases[phase as keyof typeof simplePhases] || simplePhases.detecting;
      
      // Draw connecting lines first (behind dots)
      ctx.strokeStyle = currentPhase.color;
      ctx.lineWidth = 0.5;
      ctx.globalAlpha = 0.2;
      
      // Connect nearby points to create mesh effect
      currentPhase.points.forEach((point1, i) => {
        if (!point1) return;
        
        const x1 = point1.x * canvas.width;
        const y1 = point1.y * canvas.height;
        
        // Connect to next few points in array
        for (let j = i + 1; j < Math.min(i + 4, currentPhase.points.length); j++) {
          const point2 = currentPhase.points[j];
          if (!point2) continue;
          
          const x2 = point2.x * canvas.width;
          const y2 = point2.y * canvas.height;
          
          // Calculate distance
          const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
          
          // Only connect points that are reasonably close (avoid crossing entire face)
          if (distance < 50) {
            // Fade line based on distance
            ctx.globalAlpha = Math.max(0.1, 0.3 - (distance / 100));
            
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          }
        }
      });
      
      // Reset alpha for dots
      ctx.globalAlpha = 1;
      
      // Draw dots on top of lines
      currentPhase.points.forEach((landmark, index) => {
        if (!landmark) return;
        
        const x = landmark.x * canvas.width;
        const y = landmark.y * canvas.height;
        
        // Vary dot size slightly for visual interest
        const baseSize = 2.5;
        const sizeVariation = Math.sin(index * 0.5) * 0.5 + baseSize;
        
        // Simple glowing dot with subtle animation
        ctx.fillStyle = currentPhase.color;
        ctx.shadowColor = currentPhase.color;
        ctx.shadowBlur = 8;
        
        // Add slight opacity variation for depth
        ctx.globalAlpha = 0.6 + Math.sin(index * 0.3) * 0.4;
        
        ctx.beginPath();
        ctx.arc(x, y, sizeVariation, 0, 2 * Math.PI);
        ctx.fill();
      });
      
      // Reset alpha
      ctx.globalAlpha = 1;

      // Reset shadow
      ctx.shadowBlur = 0;
    });
  }, []);

  // Map analysis steps to animation phases
  const getAnimationPhaseForStep = (step: number): 'detecting' | 'extracting' | 'analyzing' | 'complete' => {
    const phaseMap = {
      0: 'detecting' as const,    // face-detection
      1: 'extracting' as const,  // color-extraction 
      2: 'analyzing' as const,   // color-space-conversion
      3: 'analyzing' as const,   // warm-cool-analysis
      4: 'complete' as const,    // final-classification
    };
    return phaseMap[step as keyof typeof phaseMap] || 'detecting';
  };

  // Detect face landmarks with memory management
  const detectLandmarks = useCallback(async () => {
    if (!detector || !imageRef.current) return;

    try {
      console.log('🔍 [Synchronized] Starting face landmark detection...');
      
      // Async operations cannot be wrapped with tf.tidy - use manual cleanup
      const faces = await detector.estimateFaces(imageRef.current);
      console.log(`✅ [Synchronized] Detected ${faces.length} face(s)`);

      // Manually clean up any tensors that might have been created
      if (typeof tf !== 'undefined' && tf.engine) {
        const numTensorsBeforeCleanup = tf.memory().numTensors;
        tf.engine().startScope();
        tf.engine().endScope();
        const numTensorsAfterCleanup = tf.memory().numTensors;
        
        if (numTensorsBeforeCleanup > numTensorsAfterCleanup) {
          console.log(`🧹 [Memory] Cleaned ${numTensorsBeforeCleanup - numTensorsAfterCleanup} leaked tensors in static detection`);
        }
      }

      if (faces.length === 0) {
        setError('No faces detected in the image');
        return;
      }

      // Convert to our interface format
      const detectedFaces: DetectedFace[] = faces.map(face => {
        // Handle cases where box might be undefined
        let box: DetectedFace['box'];
        
        if (face.box) {
          box = {
            xMin: face.box.xMin / imageRef.current!.width,
            yMin: face.box.yMin / imageRef.current!.height,
            xMax: face.box.xMax / imageRef.current!.width,
            yMax: face.box.yMax / imageRef.current!.height,
            width: face.box.width / imageRef.current!.width,
            height: face.box.height / imageRef.current!.height,
          };
        } else {
          // Calculate bounding box from keypoints if box is not provided
          const xs = face.keypoints.map(kp => kp.x);
          const ys = face.keypoints.map(kp => kp.y);
          const minX = Math.min(...xs) / imageRef.current!.width;
          const maxX = Math.max(...xs) / imageRef.current!.width;
          const minY = Math.min(...ys) / imageRef.current!.height;
          const maxY = Math.max(...ys) / imageRef.current!.height;
          
          box = {
            xMin: minX,
            yMin: minY,
            xMax: maxX,
            yMax: maxY,
            width: maxX - minX,
            height: maxY - minY,
          };
        }
        
        return {
          keypoints: face.keypoints.map(kp => ({
            x: kp.x / imageRef.current!.width,
            y: kp.y / imageRef.current!.height,
            z: (kp as any).z || 0,
            name: (kp as any).name
          })),
          box
        };
      });

      setLandmarks(detectedFaces);
      console.log('🎯 [Synchronized] Face landmarks ready - waiting for character sync');

      if (onLandmarksDetected) {
        onLandmarksDetected(detectedFaces);
      }

    } catch (err) {
      console.error('❌ Face detection failed:', err);
      setError('Face detection failed');
      
      // Force cleanup on error to prevent memory buildup
      if (typeof tf !== 'undefined' && tf.engine) {
        tf.engine().startScope();
        tf.engine().endScope();
      }
    }
  }, [detector, onLandmarksDetected]);

  // Handle image load
  const handleImageLoad = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    // Set canvas dimensions to match image
    canvas.width = image.width;
    canvas.height = image.height;

    // Start detection if detector is ready
    if (detector) {
      detectLandmarks();
    }
  }, [detector, detectLandmarks]);

  // Start detection when detector is ready and image is loaded
  useEffect(() => {
    if (detector && imageRef.current?.complete) {
      detectLandmarks();
    }
  }, [detector, detectLandmarks]);

  // Synchronize animation phase with external analysis step
  useEffect(() => {
    if (landmarks.length > 0 && (forceAnimationPhase || currentAnalysisStep >= 0)) {
      const targetPhase = forceAnimationPhase || getAnimationPhaseForStep(currentAnalysisStep);
      
      if (targetPhase !== animationPhase) {
        console.log(`🎯 [Sync] Character step ${currentAnalysisStep} → Animation phase: ${targetPhase}`);
        setAnimationPhase(targetPhase);
        drawLandmarks(landmarks, targetPhase);
      }
    }
  }, [currentAnalysisStep, forceAnimationPhase, landmarks, animationPhase, drawLandmarks, getAnimationPhaseForStep]);

  // Don't block render, show image with loading overlay instead

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <div className="text-center p-8">
          <p className="text-sm text-red-600">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              detectLandmarks();
            }}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-dark transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Show image immediately, even during loading */}
      {!landmarks.length && (
        <img
          src={imageUrl}
          alt="Face analysis"
          className="w-full rounded-2xl shadow-2xl"
          style={{ 
            aspectRatio: '3/4',
            objectFit: 'cover',
            display: 'block'
          }}
        />
      )}
      
      {/* Hidden image for detection */}
      <img
        ref={imageRef}
        src={imageUrl}
        alt="Face analysis"
        onLoad={handleImageLoad}
        className="hidden"
        crossOrigin="anonymous"
      />
      
      {/* Canvas for landmark visualization - shows after detection */}
      <canvas
        ref={canvasRef}
        className={`w-full rounded-2xl shadow-2xl ${!landmarks.length ? 'hidden' : ''}`}
        style={{ 
          backgroundColor: 'transparent',
          aspectRatio: '3/4',
          objectFit: 'cover',
          display: landmarks.length ? 'block' : 'none'
        }}
      />
      
      {/* Loading overlay - shows while TensorFlow is initializing */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-2xl">
          <div className="bg-white/95 rounded-xl p-4 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
              <div>
                <p className="text-sm font-semibold text-gray-800">AI 얼굴 인식 엔진 준비중</p>
                <p className="text-xs text-gray-500">MediaPipe 모델 로딩...</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FaceLandmarkVisualization;