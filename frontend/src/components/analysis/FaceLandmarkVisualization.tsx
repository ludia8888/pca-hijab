import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import '@tensorflow/tfjs-backend-webgl';
import * as tf from '@tensorflow/tfjs';
import { COLOR_PALETTES } from '@/utils/constants';

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
  const [animationPhase, setAnimationPhase] = useState<'detecting' | 'extracting' | 'warm-cool' | 'season' | 'complete'>('detecting');

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

  // Create inverted face mask (everything except face)
  const createInverseFaceMask = (ctx: CanvasRenderingContext2D, face: DetectedFace, canvas: HTMLCanvasElement) => {
    // Start with full canvas
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    
    // MediaPipe 468 face landmarks - use silhouette points for accurate boundary
    // These are the actual face contour points from MediaPipe Face Mesh
    const faceContourIndices = [
      // Silhouette points (face oval)
      10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 340, 346, 347, 348, 349, 350, 451, 452, 453, 464, 435, 410, 287, 273, 335, 321, 308, 324, 318,
      // Forehead line
      9, 10, 151, 337, 299, 333, 298, 301, 368, 264, 447, 366, 401, 435, 367, 364, 394, 395, 369, 396, 400, 377, 152, 148,
      // Jaw line from left to right
      172, 136, 150, 149, 176, 148, 152, 377, 400, 378, 379, 365, 397, 288, 361, 340, 346, 347, 348, 349, 350, 451, 452, 453, 464, 435, 410, 287, 273, 335, 321, 308, 324, 318,
      // Chin line
      18, 175, 199, 200, 9, 10, 151, 337, 299, 333, 298, 301
    ];
    
    // Remove duplicates and sort
    const uniqueIndices = [...new Set(faceContourIndices)].filter(i => i < face.keypoints.length);
    
    if (uniqueIndices.length > 0) {
      // Create smooth face contour path
      ctx.moveTo(face.keypoints[10].x * canvas.width, face.keypoints[10].y * canvas.height);
      
      // Draw face silhouette using quadratic curves for smoother outline
      const silhouettePoints = [
        10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 340, 346, 347, 348, 349, 350, 
        451, 452, 453, 464, 435, 410, 287, 273, 335, 321, 308, 324, 318, 402, 317, 14, 87, 
        178, 88, 95, 78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 272, 271, 268, 269, 270, 
        267, 264, 447, 366, 401, 435, 367, 364, 394, 395, 369, 396, 400, 377, 152, 148, 176, 
        149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109, 10
      ];
      
      for (let i = 0; i < silhouettePoints.length; i++) {
        const idx = silhouettePoints[i];
        if (idx < face.keypoints.length) {
          const point = face.keypoints[idx];
          ctx.lineTo(point.x * canvas.width, point.y * canvas.height);
        }
      }
      
      ctx.closePath();
    }
    
    // Use even-odd fill rule to create inverse mask
    ctx.clip('evenodd');
  };

  // Draw color draping overlay as background
  const drawColorDraping = (
    ctx: CanvasRenderingContext2D, 
    canvas: HTMLCanvasElement, 
    colors: string[], 
    side: 'left' | 'right' | 'full',
    face: DetectedFace
  ) => {
    // Calculate face center for split
    const faceKeypoints = face.keypoints;
    const xs = faceKeypoints.map(kp => kp.x * canvas.width);
    const faceCenterX = xs.reduce((sum, x) => sum + x, 0) / xs.length;
    
    // Determine which side to apply color
    let rectX = 0;
    let rectWidth = canvas.width;
    
    if (side === 'left') {
      rectWidth = faceCenterX;
    } else if (side === 'right') {
      rectX = faceCenterX;
      rectWidth = canvas.width - faceCenterX;
    }
    
    // Draw solid color background for the entire side
    const mainColor = colors[Math.floor(colors.length / 2)];
    ctx.fillStyle = mainColor;
    ctx.fillRect(rectX, 0, rectWidth, canvas.height);
  };

  // Draw face landmarks on canvas with new effects
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

    // Handle different visualization phases
    if (phase === 'warm-cool') {
      // Draw warm-cool comparison with face masking
      faces.forEach((face) => {
        // Save state
        ctx.save();
        
        // Create inverse face mask (everything except face)
        createInverseFaceMask(ctx, face, canvas);
        
        // Draw colors only outside face area
        // Left side - Warm tones
        drawColorDraping(ctx, canvas, COLOR_PALETTES.warm.base, 'left', face);
        
        // Right side - Cool tones  
        drawColorDraping(ctx, canvas, COLOR_PALETTES.cool.base, 'right', face);
        
        ctx.restore();
        
        // Add dividing line at face center
        const faceCenterX = face.keypoints.reduce((sum, kp) => sum + kp.x * canvas.width, 0) / face.keypoints.length;
        
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(faceCenterX, 0);
        ctx.lineTo(faceCenterX, canvas.height);
        ctx.stroke();
        ctx.restore();
        
        // Add labels
        ctx.save();
        ctx.fillStyle = 'white';
        ctx.font = 'bold 18px sans-serif';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 4;
        ctx.textAlign = 'center';
        ctx.fillText('웜톤', faceCenterX - 80, 40);
        ctx.fillText('쿨톤', faceCenterX + 80, 40);
        ctx.restore();
      });
      return;
    }
    
    if (phase === 'season') {
      // Draw seasonal comparison
      faces.forEach((face) => {
        // TODO: Determine if warm or cool based on analysis
        const isWarm = true; // This should come from actual analysis
        
        const faceCenterX = face.keypoints.reduce((sum, kp) => sum + kp.x * canvas.width, 0) / face.keypoints.length;
        
        // Save state and create face mask
        ctx.save();
        
        // Create inverse face mask (everything except face)
        createInverseFaceMask(ctx, face, canvas);
        
        if (isWarm) {
          // Spring vs Autumn
          drawColorDraping(ctx, canvas, COLOR_PALETTES.warm.spring.colors, 'left', face);
          drawColorDraping(ctx, canvas, COLOR_PALETTES.warm.autumn.colors, 'right', face);
          
          ctx.save();
          ctx.fillStyle = 'white';
          ctx.font = 'bold 18px sans-serif';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
          ctx.shadowBlur = 4;
          ctx.textAlign = 'center';
          ctx.fillText('봄 웜톤', faceCenterX - 80, 40);
          ctx.fillText('가을 웜톤', faceCenterX + 80, 40);
          ctx.restore();
        } else {
          // Summer vs Winter
          drawColorDraping(ctx, canvas, COLOR_PALETTES.cool.summer.colors, 'left', face);
          drawColorDraping(ctx, canvas, COLOR_PALETTES.cool.winter.colors, 'right', face);
          
          ctx.save();
          ctx.fillStyle = 'white';
          ctx.font = 'bold 18px sans-serif';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
          ctx.shadowBlur = 4;
          ctx.textAlign = 'center';
          ctx.fillText('여름 쿨톤', faceCenterX - 80, 40);
          ctx.fillText('겨울 쿨톤', faceCenterX + 80, 40);
          ctx.restore();
        }
        
        ctx.restore(); // Restore from face masking
        
        // Add dividing line at face center
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(faceCenterX, 0);
        ctx.lineTo(faceCenterX, canvas.height);
        ctx.stroke();
        ctx.restore();
      });
      return;
    }
    
    // Original landmark visualization for other phases
    faces.forEach((face, faceIndex) => {
      const simplePhases = {
        detecting: {
          points: face.keypoints.filter((_, i) => 
            (i >= 33 && i <= 46) || (i >= 263 && i <= 276) ||
            (i >= 1 && i <= 6) || (i >= 195 && i <= 197) ||
            (i >= 13 && i <= 17) || (i >= 269 && i <= 271) ||
            i % 15 === 0
          ).filter(Boolean),
          color: '#00FF9F'
        },
        extracting: {
          points: face.keypoints.filter((_, i) => 
            (i >= 9 && i <= 10) || (i >= 67 && i <= 69) || (i >= 107 && i <= 109) ||
            (i >= 35 && i <= 36) || (i >= 116 && i <= 117) || 
            (i >= 213 && i <= 214) || (i >= 192 && i <= 193) ||
            (i >= 1 && i <= 6) || (i >= 19 && i <= 20) || (i >= 94 && i <= 125) ||
            (i >= 17 && i <= 18) || (i >= 172 && i <= 175) ||
            i % 20 === 0
          ).filter(Boolean),
          color: '#FF6B9D'
        },
        complete: {
          points: face.keypoints.filter((_, i) => 
            (i >= 9 && i <= 10) || (i >= 1 && i <= 6) ||
            (i >= 35 && i <= 36) || (i >= 266 && i <= 267) ||
            (i >= 116 && i <= 117) || (i >= 345 && i <= 346) ||
            (i >= 46 && i <= 53) || (i >= 276 && i <= 283) ||
            (i >= 13 && i <= 14) || (i >= 17 && i <= 18) ||
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
  const getAnimationPhaseForStep = (step: number): 'detecting' | 'extracting' | 'warm-cool' | 'season' | 'complete' => {
    const phaseMap = {
      0: 'detecting' as const,    // face-detection
      1: 'extracting' as const,   // color-extraction
      2: 'warm-cool' as const,    // warm-cool-comparison
      3: 'season' as const,       // season-comparison
      4: 'complete' as const,     // final-result
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