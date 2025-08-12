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
      // Simplified landmark visualization - just key points, no labels
      const simplePhases = {
        detecting: {
          // Just eyes and mouth - friendly face scanning
          points: [
            face.keypoints[33], face.keypoints[133],   // Eyes
            face.keypoints[362], face.keypoints[263],  // Eyes
            face.keypoints[13], face.keypoints[14],    // Lips
          ].filter(Boolean),
          color: '#00FF9F'
        },
        extracting: {
          // Color sampling points - forehead, cheeks, chin
          points: [
            face.keypoints[10],   // Forehead
            face.keypoints[50], face.keypoints[280],  // Cheeks
            face.keypoints[152],  // Chin
          ].filter(Boolean),
          color: '#FF6B9D'
        },
        analyzing: {
          // Analysis progress - just center points
          points: [
            face.keypoints[1],    // Nose tip
            face.keypoints[17],   // Lower lip
          ].filter(Boolean),
          color: '#FFD93D'
        },
        complete: {
          // Completion - smiley face pattern
          points: [
            face.keypoints[33], face.keypoints[263],   // Eyes
            face.keypoints[13],   // Mouth
          ].filter(Boolean),
          color: '#8B5CF6'
        }
      };

      const currentPhase = simplePhases[phase as keyof typeof simplePhases] || simplePhases.detecting;
      
      // Draw simple dots for landmarks
      currentPhase.points.forEach((landmark) => {
        if (!landmark) return;
        
        const x = landmark.x * canvas.width;
        const y = landmark.y * canvas.height;
        
        // Simple glowing dot
        ctx.fillStyle = currentPhase.color;
        ctx.shadowColor = currentPhase.color;
        ctx.shadowBlur = 10;
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
      });

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

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg ${className}`}>
        <div className="text-center p-8">
          <div className="relative">
            {/* Main loading spinner */}
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            {/* Inner spinning dot */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full animate-pulse" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-800">AI 얼굴 인식 엔진 초기화 중...</p>
            <p className="text-xs text-gray-500">MediaPipe Face Mesh 모델 로딩</p>
            <div className="flex items-center justify-center space-x-1 text-xs text-gray-400">
              <span className="animate-bounce">🧠</span>
              <span>TensorFlow.js + WebGL 가속</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
      {/* Hidden image for detection */}
      <img
        ref={imageRef}
        src={imageUrl}
        alt="Face analysis"
        onLoad={handleImageLoad}
        className="hidden"
        crossOrigin="anonymous"
      />
      
      {/* Canvas for landmark visualization */}
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain rounded-lg"
        style={{ backgroundColor: 'transparent' }}
      />
    </div>
  );
};

export default FaceLandmarkVisualization;