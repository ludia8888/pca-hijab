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
      // Draw face bounding box
      ctx.strokeStyle = '#00FF9F';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        face.box.xMin * canvas.width,
        face.box.yMin * canvas.height,
        face.box.width * canvas.width,
        face.box.height * canvas.height
      );

      // Define landmark groups for different analysis phases (synchronized with character messages)
      const landmarkGroups = {
        detecting: {
          points: face.keypoints.filter((_, i) => i % 6 === 0), // Dense detection grid
          color: '#00FF9F',
          size: 3,
          label: '478개 3D 랜드마크 스캔'
        },
        extracting: {
          points: face.keypoints.filter((_, i) => 
            // 16,000 pixels color extraction areas
            (i >= 33 && i <= 133) || // Right eye region
            (i >= 362 && i <= 398) || // Left eye region  
            (i >= 1 && i <= 97) || // Nose region
            (i >= 61 && i <= 291) || // Mouth region
            (i >= 10 && i <= 151) || // Forehead region
            (i >= 172 && i <= 175) // Cheek regions
          ),
          color: '#FF6B9D',
          size: 2.5,
          label: '16,000개 픽셀 색상 추출'
        },
        analyzing: {
          points: face.keypoints, // All points for comprehensive analysis
          color: '#FFD93D',
          size: 1.8,
          label: '다차원 색공간 매트릭스 변환'
        },
        complete: {
          points: face.keypoints.filter((_, i) => 
            // Final personal color analysis points
            i === 10 || i === 151 || i === 9 || i === 175 || // Forehead
            i === 93 || i === 132 || i === 58 || i === 172 || // Cheeks
            i === 150 || i === 176 || i === 148 || i === 152 || // Jaw/chin
            i === 1 || i === 2 || i === 61 || i === 291 // Key facial points
          ),
          color: '#8B5CF6',
          size: 4,
          label: '2,847개 색상 DB 매칭 완료'
        }
      };

      const currentGroup = landmarkGroups[phase as keyof typeof landmarkGroups] || landmarkGroups.detecting;
      
      // Draw landmarks
      ctx.fillStyle = currentGroup.color;
      currentGroup.points.forEach((landmark, i) => {
        const x = landmark.x * canvas.width;
        const y = landmark.y * canvas.height;
        
        // Add subtle glow effect
        ctx.shadowColor = currentGroup.color;
        ctx.shadowBlur = 8;
        
        ctx.beginPath();
        ctx.arc(x, y, currentGroup.size, 0, 2 * Math.PI);
        ctx.fill();
        
        // Add connecting lines for certain phases
        if (phase === 'complete' && i > 0) {
          ctx.strokeStyle = currentGroup.color + '40';
          ctx.lineWidth = 1;
          ctx.setLineDash([2, 2]);
          const prevLandmark = currentGroup.points[i - 1];
          ctx.beginPath();
          ctx.moveTo(prevLandmark.x * canvas.width, prevLandmark.y * canvas.height);
          ctx.lineTo(x, y);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });

      // Reset shadow
      ctx.shadowBlur = 0;

      // Draw label
      ctx.font = '14px Inter, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(
        `${currentGroup.label} (${currentGroup.points.length} points)`,
        face.box.xMin * canvas.width,
        face.box.yMin * canvas.height - 10
      );
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
      
      // Use tf.tidy for memory management
      const faces = await tf.tidy(async () => {
        const detectionResult = await detector.estimateFaces(imageRef.current!);
        console.log(`✅ [Synchronized] Detected ${detectionResult.length} face(s)`);
        return detectionResult;
      });

      if (faces.length === 0) {
        setError('No faces detected in the image');
        return;
      }

      // Convert to our interface format
      const detectedFaces: DetectedFace[] = faces.map(face => ({
        keypoints: face.keypoints.map(kp => ({
          x: kp.x / imageRef.current!.width,
          y: kp.y / imageRef.current!.height,
          z: (kp as any).z || 0,
          name: (kp as any).name
        })),
        box: {
          xMin: face.box.xMin / imageRef.current!.width,
          yMin: face.box.yMin / imageRef.current!.height,
          xMax: face.box.xMax / imageRef.current!.width,
          yMax: face.box.yMax / imageRef.current!.height,
          width: face.box.width / imageRef.current!.width,
          height: face.box.height / imageRef.current!.height,
        }
      }));

      setLandmarks(detectedFaces);
      console.log('🎯 [Synchronized] Face landmarks ready - waiting for character sync');

      if (onLandmarksDetected) {
        onLandmarksDetected(detectedFaces);
      }

    } catch (err) {
      console.error('❌ Face detection failed:', err);
      setError('Face detection failed');
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
        className="w-full h-full object-contain rounded-lg border-2 border-primary-200"
        style={{ backgroundColor: '#f9fafb' }}
      />
      
      {/* Analysis phase indicator - synchronized with character */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-80 text-white px-4 py-2 rounded-lg text-sm font-medium border border-primary-400">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-ping"></div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-300">Step {currentAnalysisStep + 1}/5</span>
            <span className="capitalize font-semibold">{
              landmarks.length > 0 && animationPhase ? 
              (['detecting', 'extracting', 'analyzing', 'complete'].includes(animationPhase) ? 
                {
                  'detecting': '478개 3D 랜드마크 스캔',
                  'extracting': '16,000개 픽셀 색상 추출', 
                  'analyzing': '다차원 색공간 변환',
                  'complete': '2,847개 색상 DB 매칭'
                }[animationPhase] : 'AI 분석 중'
              ) : 'AI 초기화 중'
            }</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      {landmarks.length > 0 && (
        <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white p-3 rounded-lg text-xs">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              <span>Face Detection</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-pink-400"></div>
              <span>Feature Extraction</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <span>Color Analysis</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-purple-400"></div>
              <span>Personal Color Points</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FaceLandmarkVisualization;