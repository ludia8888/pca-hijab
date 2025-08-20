import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import { COLOR_PALETTES } from '@/utils/constants';
import { initializeTensorFlow, getTensorFlow } from '@/utils/tensorflowInit';

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
  const animationFrameRef = useRef<number>(0);
  const animationTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const animationStartTimeRef = useRef<number>(0);

  // Initialize TensorFlow and face detector
  useEffect(() => {
    const initializeDetector = async () => {
      const startTime = performance.now();
      
      try {
        console.log('🔧 [FaceLandmark] Starting detector initialization at', new Date().toISOString());
        
        // Initialize TensorFlow using centralized module
        console.log('🔧 [FaceLandmark] Ensuring TensorFlow is initialized...');
        await initializeTensorFlow();
        
        // Get TensorFlow instance
        const tf = await getTensorFlow();
        console.log('✅ [FaceLandmark] TensorFlow ready, backend:', tf.getBackend());
        
        console.log('🔧 [MediaPipe] Loading Face Mesh model weights...');
        const modelStart = performance.now();
        const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
        const detectorConfig = {
          runtime: 'tfjs' as const,
          refineLandmarks: true,
          maxFaces: 1,  // Only detect one face for better performance
        };
        
        const faceDetector = await faceLandmarksDetection.createDetector(model, detectorConfig);
        const modelTime = performance.now() - modelStart;
        console.log(`✅ [MediaPipe] Face Mesh model loaded in ${Math.round(modelTime)}ms`);
        
        setDetector(faceDetector);
        
        const totalTime = performance.now() - startTime;
        console.log(`🎯 [FaceLandmark] Complete initialization in ${Math.round(totalTime)}ms`);
        console.log(`📊 [Performance] Model: ${Math.round(modelTime)}ms, Total: ${Math.round(totalTime)}ms`);
        
        // Track performance for analytics
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'tensorflow_initialization', {
            'custom_parameter_3': totalTime, // load_time custom parameter
            'model_time': modelTime
          });
        }
        
      } catch (err) {
        console.error('❌ [TensorFlow] Failed to initialize:', err);
        setError('Failed to load AI face recognition model. Please try refreshing.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeDetector();
  }, []);

  // Create inverted face mask (everything except face)
  const createInverseFaceMask = (ctx: CanvasRenderingContext2D, face: DetectedFace, canvas: HTMLCanvasElement) => {
    // Calculate face bounds with expansion for safety
    const xs = face.keypoints.map(kp => kp.x * canvas.width);
    const ys = face.keypoints.map(kp => kp.y * canvas.height);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const faceCenterX = (minX + maxX) / 2;
    // Move face center slightly up (reduce Y by 10% of face height)
    const faceCenterY = (minY + maxY) / 2 - (maxY - minY) * 0.1;
    const faceWidth = maxX - minX;
    const faceHeight = maxY - minY;
    
    // Add padding to ensure face is fully protected
    const padding = Math.max(faceWidth, faceHeight) * 0.15;
    
    // Create elliptical face mask (more natural for faces)
    ctx.save();
    
    // Draw the entire canvas first
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    
    // Then subtract the face area (ellipse) - moved up
    ctx.moveTo(faceCenterX + (faceWidth/2 + padding), faceCenterY);
    ctx.ellipse(
      faceCenterX,
      faceCenterY,
      faceWidth/2 + padding,
      faceHeight/2 + padding,
      0,
      0,
      Math.PI * 2,
      true // counterclockwise to create hole
    );
    
    ctx.closePath();
    
    // Use even-odd fill rule to create inverse mask
    ctx.clip('evenodd');
  };

  // Draw color draping overlay as background
  const drawColorDraping = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, colors: string[], side: 'left' | 'right', face: DetectedFace) => {
    const faceCenterX = face.keypoints.reduce((sum, kp) => sum + kp.x * canvas.width, 0) / face.keypoints.length;
    
    colors.forEach((color, i) => {
      const yOffset = (canvas.height / colors.length) * i;
      
      // Create gradient that respects face center
      const gradient = ctx.createLinearGradient(
        side === 'left' ? 0 : canvas.width,
        yOffset,
        side === 'left' ? faceCenterX : faceCenterX,
        yOffset
      );
      
      gradient.addColorStop(0, color);
      gradient.addColorStop(0.8, color + 'CC');
      gradient.addColorStop(1, color + '00');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(
        side === 'left' ? 0 : faceCenterX,
        yOffset,
        side === 'left' ? faceCenterX : canvas.width - faceCenterX,
        canvas.height / colors.length
      );
    });
  };

  // Define face landmark groups for progressive activation
  const getFaceLandmarkGroups = (keypoints: FaceLandmark[]) => {
    // MediaPipe Face Mesh has 468 landmarks - group by facial features
    return {
      // Face outline (jaw and forehead)
      outline: keypoints.filter((_, i) => 
        (i >= 0 && i <= 16) ||     // Jaw line
        (i >= 227 && i <= 233) ||   // Forehead
        (i >= 172 && i <= 176) ||   // Left temple
        (i >= 397 && i <= 401) ||   // Right temple
        (i >= 10 && i <= 234 && i % 15 === 0) // Additional contour points
      ),
      // Eyes region
      eyes: keypoints.filter((_, i) => 
        (i >= 33 && i <= 46) ||     // Right eye area
        (i >= 263 && i <= 276) ||   // Left eye area
        (i >= 133 && i <= 145) ||   // Right eye details
        (i >= 362 && i <= 374)      // Left eye details
      ),
      // Nose region
      nose: keypoints.filter((_, i) => 
        (i >= 1 && i <= 5) ||       // Nose bridge
        (i >= 19 && i <= 20) ||     // Nose tip
        (i >= 48 && i <= 50) ||     // Nostrils
        (i >= 278 && i <= 280) ||   // Nose sides
        (i >= 195 && i <= 197)      // Additional nose points
      ),
      // Mouth region
      mouth: keypoints.filter((_, i) => 
        (i >= 61 && i <= 84) ||     // Lips outer
        (i >= 291 && i <= 307) ||   // Lips inner
        (i >= 312 && i <= 324) ||   // Mouth corners
        (i >= 13 && i <= 17)        // Additional mouth points
      ),
    };
  };

  // Draw curved bezier connections between points
  const drawCurvedConnection = (ctx: CanvasRenderingContext2D, p1: FaceLandmark, p2: FaceLandmark, canvas: HTMLCanvasElement, opacity: number = 0.3) => {
    const x1 = p1.x * canvas.width;
    const y1 = p1.y * canvas.height;
    const x2 = p2.x * canvas.width;
    const y2 = p2.y * canvas.height;
    
    // Calculate control points for bezier curve
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    
    // Create slight curve based on distance
    const curvature = distance * 0.08;
    const angle = Math.atan2(y2 - y1, x2 - x1) + Math.PI / 2;
    const ctrlX = midX + Math.cos(angle) * curvature;
    const ctrlY = midY + Math.sin(angle) * curvature;
    
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.strokeStyle = '#FCA5A5'; // Coral pink
    ctx.lineWidth = 1.2;
    ctx.shadowColor = '#FCA5A5';
    ctx.shadowBlur = 6;
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(ctrlX, ctrlY, x2, y2);
    ctx.stroke();
    ctx.restore();
  };

  // Draw face landmarks on canvas with improved effects
  const drawLandmarks = useCallback((faces: DetectedFace[], phase: string) => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas and redraw image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    
    // Phase-specific visualizations for color comparisons
    if (phase === 'warm-cool') {
      // Draw warm vs cool comparison
      faces.forEach((face) => {
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
        ctx.fillText('Warm', faceCenterX - 80, 40);
        ctx.fillText('Cool', faceCenterX + 80, 40);
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
          points: face.keypoints,
          color: '#FCA5A5' // Coral pink for beauty/care tone
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
      
      // Enhanced progressive visualization for detecting phase
      if (phase === 'detecting') {
        const elapsed = Date.now() - animationStartTimeRef.current;
        const totalDuration = 4000; // 4 seconds for complete sequence
        const progress = Math.min(elapsed / totalDuration, 1);
        
        // Get landmark groups
        const groups = getFaceLandmarkGroups(face.keypoints);
        const activePoints: FaceLandmark[] = [];
        
        // Progressive activation: outline → eyes → nose → mouth
        if (progress > 0) {
          // Phase 1: Face outline (0-30%)
          const outlineProgress = Math.min(progress * 3.33, 1);
          const outlineCount = Math.floor(groups.outline.length * outlineProgress);
          activePoints.push(...groups.outline.slice(0, outlineCount));
        }
        
        if (progress > 0.3) {
          // Phase 2: Eyes (30-55%)
          const eyesProgress = Math.min((progress - 0.3) * 4, 1);
          const eyesCount = Math.floor(groups.eyes.length * eyesProgress);
          activePoints.push(...groups.eyes.slice(0, eyesCount));
        }
        
        if (progress > 0.55) {
          // Phase 3: Nose (55-75%)
          const noseProgress = Math.min((progress - 0.55) * 5, 1);
          const noseCount = Math.floor(groups.nose.length * noseProgress);
          activePoints.push(...groups.nose.slice(0, noseCount));
        }
        
        if (progress > 0.75) {
          // Phase 4: Mouth (75-100%)
          const mouthProgress = Math.min((progress - 0.75) * 4, 1);
          const mouthCount = Math.floor(groups.mouth.length * mouthProgress);
          activePoints.push(...groups.mouth.slice(0, mouthCount));
        }
        
        // Draw curved connections between active points
        activePoints.forEach((point1, i) => {
          if (!point1) return;
          
          // Connect to nearby points with curved lines
          activePoints.slice(Math.max(0, i - 8), i).forEach((point2) => {
            if (!point2) return;
            
            const distance = Math.sqrt(
              Math.pow((point2.x - point1.x) * canvas.width, 2) + 
              Math.pow((point2.y - point1.y) * canvas.height, 2)
            );
            
            if (distance < 50 && distance > 5) {
              const opacity = 0.25 * (1 - distance / 50) * Math.min(progress * 2, 1);
              drawCurvedConnection(ctx, point1, point2, canvas, opacity);
            }
          });
        });
        
        // Override points for dot drawing
        currentPhase.points = activePoints;
        
        // Draw subtle scanning effect
        const time = Date.now() * 0.001;
        ctx.save();
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, 'rgba(252, 165, 165, 0)');
        gradient.addColorStop(0.5, 'rgba(252, 165, 165, 0.1)');
        gradient.addColorStop(1, 'rgba(252, 165, 165, 0)');
        
        ctx.fillStyle = gradient;
        ctx.globalAlpha = 0.3 * Math.sin(time * 2);
        const scanY = (Math.sin(time * 1.5) * 0.5 + 0.5) * canvas.height;
        ctx.fillRect(0, scanY - 20, canvas.width, 40);
        ctx.restore();
      } else {
        // Simple connections for other phases
        ctx.strokeStyle = currentPhase.color;
        ctx.lineWidth = 0.5;
        
        for (let i = 0; i < currentPhase.points.length - 1; i++) {
          const point1 = currentPhase.points[i];
          const point2 = currentPhase.points[i + 1];
          if (!point1 || !point2) continue;
          
          const x1 = point1.x * canvas.width;
          const y1 = point1.y * canvas.height;
          const x2 = point2.x * canvas.width;
          const y2 = point2.y * canvas.height;
          
          const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
          
          if (distance < 40) {
            ctx.globalAlpha = Math.max(0.1, 0.4 - (distance / 100));
            
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          }
        }
      }
      
      // Reset alpha for dots
      ctx.globalAlpha = 1;
      
      // Draw dots on top of lines
      currentPhase.points.forEach((landmark, index) => {
        if (!landmark) return;
        
        const x = landmark.x * canvas.width;
        const y = landmark.y * canvas.height;
        const time = Date.now() * 0.001;
        
        if (phase === 'detecting') {
          // Smooth animated dots with coral pink glow
          const baseSize = 2.5;
          const pulse = Math.sin(time * 2 + index * 0.08) * 0.3 + 1;
          const size = baseSize * pulse;
          
          // Create gradient for each dot
          const dotGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
          dotGradient.addColorStop(0, 'rgba(255, 212, 212, 0.9)'); // Light coral core
          dotGradient.addColorStop(0.3, 'rgba(252, 165, 165, 0.8)'); // Coral pink
          dotGradient.addColorStop(1, 'rgba(252, 165, 165, 0)'); // Transparent edge
          
          // Draw soft glow halo
          ctx.save();
          ctx.fillStyle = dotGradient;
          ctx.globalAlpha = 0.6 * pulse;
          ctx.beginPath();
          ctx.arc(x, y, size * 3, 0, 2 * Math.PI);
          ctx.fill();
          ctx.restore();
          
          // Main dot with coral pink
          ctx.fillStyle = '#FCA5A5';
          ctx.shadowColor = '#FCA5A5';
          ctx.shadowBlur = 10 * pulse;
          ctx.globalAlpha = 0.85;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, 2 * Math.PI);
          ctx.fill();
          
          // Inner bright core for sparkle effect
          ctx.fillStyle = '#FFE5E5';
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 0.95;
          ctx.beginPath();
          ctx.arc(x, y, size * 0.3, 0, 2 * Math.PI);
          ctx.fill();
        } else {
          // Original dots for other phases
          const baseSize = 2.5;
          const sizeVariation = Math.sin(index * 0.5) * 0.5 + baseSize;
          
          ctx.fillStyle = currentPhase.color;
          ctx.shadowColor = currentPhase.color;
          ctx.shadowBlur = 8;
          ctx.globalAlpha = 0.6 + Math.sin(index * 0.3) * 0.4;
          
          ctx.beginPath();
          ctx.arc(x, y, sizeVariation, 0, 2 * Math.PI);
          ctx.fill();
        }
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
      0: 'detecting',
      1: 'extracting',  
      2: 'warm-cool',
      3: 'season',
      4: 'complete'
    } as const;
    
    return phaseMap[step as keyof typeof phaseMap] || 'detecting';
  };

  // Detect face landmarks
  const detectLandmarks = useCallback(async () => {
    if (!detector || !imageRef.current) return;

    try {
      const predictions = await detector.estimateFaces(imageRef.current);
      
      if (predictions.length > 0) {
        const faces: DetectedFace[] = predictions.map(prediction => ({
          keypoints: prediction.keypoints as FaceLandmark[],
          box: prediction.box as any
        }));
        
        setLandmarks(faces);
        
        // Initial draw
        drawLandmarks(faces, animationPhase);
        
        // Notify parent component
        if (onLandmarksDetected) {
          onLandmarksDetected(faces);
        }
      } else {
        console.warn('⚠️ [FaceLandmark] No faces detected in image');
        setError('No face detected. Please ensure your face is clearly visible in the photo.');
      }
    } catch (err) {
      console.error('❌ [FaceLandmark] Detection error:', err);
      
      // Check if it's a memory/WebGL issue
      if (err instanceof Error && err.message.includes('WebGL')) {
        setError('Graphics memory issue. Refreshing page...');
        
        // Force hard reload after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        // For other errors, show generic message
        setError('Face detection failed. Please ensure your face is clearly visible.');
      }
      
      // Force cleanup on error to prevent memory buildup
      try {
        const tf = await getTensorFlow();
        if (tf && tf.engine) {
          tf.engine().startScope();
          tf.engine().endScope();
        }
      } catch (cleanupError) {
        console.warn('Cleanup error:', cleanupError);
      }
    }
  }, [detector, onLandmarksDetected, animationPhase, drawLandmarks]);

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
      animationStartTimeRef.current = Date.now(); // Record animation start time
      detectLandmarks();
    }
  }, [detector, detectLandmarks]);

  // Start detection when detector is ready and image is loaded
  useEffect(() => {
    if (detector && imageRef.current?.complete) {
      animationStartTimeRef.current = Date.now(); // Record animation start time
      detectLandmarks();
    }
  }, [detector, detectLandmarks]);

  // Animation loop for detecting phase with smooth performance
  useEffect(() => {
    let animationId: number;
    
    const animate = () => {
      if (animationPhase === 'detecting' && landmarks.length > 0) {
        // Smooth 60fps animation
        drawLandmarks(landmarks, 'detecting');
        animationId = requestAnimationFrame(animate);
      }
    };
    
    if (animationPhase === 'detecting' && landmarks.length > 0) {
      if (animationStartTimeRef.current === 0) {
        animationStartTimeRef.current = Date.now();
      }
      animate();
    }
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [animationPhase, landmarks, drawLandmarks]);

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
  }, [currentAnalysisStep, forceAnimationPhase, landmarks, animationPhase, drawLandmarks]);

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
                <p className="text-sm font-semibold text-gray-800">Getting AI ready</p>
                <p className="text-xs text-gray-500">Loading face detection...</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FaceLandmarkVisualization;