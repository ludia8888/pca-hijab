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
  const [animationPhase, setAnimationPhase] = useState<'detecting' | 'extracting' | 'analyzing' | 'warm-cool' | 'season' | 'complete'>('detecting');
  const frameCountRef = useRef<number>(0);
  const animationStartTimeRef = useRef<number>(0);
  const scanCompleteRef = useRef<boolean>(false);

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

  // Define face landmark groups for 3D mesh effect (Step 1 only)
  const getFaceLandmarkGroups = (keypoints: FaceLandmark[]) => {
    // Create mesh-like grid of points across face
    return {
      // Face outline - forms the outer mesh boundary
      outline: keypoints.filter((_, i) => 
        // Jaw line (bottom contour)
        i === 172 || i === 136 || i === 150 || i === 149 || i === 176 || i === 148 ||
        i === 152 || i === 377 || i === 400 || i === 378 || i === 379 || i === 365 ||
        // Forehead line (top contour)  
        i === 10 || i === 338 || i === 297 || i === 332 || i === 284 || i === 251 ||
        i === 389 || i === 356 || i === 454 || i === 323 || i === 361 || i === 340 ||
        i === 346 || i === 347 || i === 348 || i === 349 || i === 350 || i === 103
      ),
      // Eyes - mesh grid around eye area
      eyes: keypoints.filter((_, i) => 
        // Right eye mesh
        i === 33 || i === 7 || i === 163 || i === 144 || i === 145 || i === 153 ||
        i === 154 || i === 155 || i === 133 || i === 173 || i === 157 || i === 158 ||
        // Left eye mesh
        i === 362 || i === 398 || i === 384 || i === 385 || i === 386 || i === 387 ||
        i === 388 || i === 466 || i === 263 || i === 249 || i === 390 || i === 373
      ),
      // Nose - vertical and horizontal mesh lines
      nose: keypoints.filter((_, i) => 
        // Central vertical line
        i === 9 || i === 10 || i === 151 || i === 337 || i === 299 || i === 333 ||
        i === 298 || i === 301 || i === 168 || i === 6 || i === 197 || i === 195 ||
        // Nose wings and nostrils
        i === 3 || i === 51 || i === 45 || i === 115 || i === 131 || i === 102 ||
        i === 48 || i === 64 || i === 235 || i === 31 || i === 228 || i === 229
      ),
      // Mouth - mesh around lips
      mouth: keypoints.filter((_, i) => 
        // Upper lip contour
        i === 61 || i === 84 || i === 17 || i === 314 || i === 405 || i === 320 ||
        i === 307 || i === 375 || i === 321 || i === 308 || i === 324 || i === 318 ||
        // Lower lip contour
        i === 14 || i === 87 || i === 178 || i === 88 || i === 95 || i === 78 ||
        i === 191 || i === 80 || i === 81 || i === 82 || i === 13 || i === 312 ||
        i === 311 || i === 310 || i === 415 || i === 316 || i === 403 || i === 319 ||
        i === 325 || i === 292 || i === 272 || i === 271 || i === 268 || i === 269
      ),
    };
  };

  // Draw 3D mesh connections between points (Step 1 only) - unused but kept for reference
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const drawMeshConnections = (ctx: CanvasRenderingContext2D, points: FaceLandmark[], canvas: HTMLCanvasElement, opacity: number = 0.3) => {
    if (points.length < 3) return;
    
    ctx.save();
    ctx.strokeStyle = '#FCA5A5'; // Coral pink
    ctx.lineWidth = 0.8;
    ctx.lineCap = 'round';
    
    // Create mesh by connecting nearby points
    for (let i = 0; i < points.length; i++) {
      const p1 = points[i];
      const x1 = p1.x * canvas.width;
      const y1 = p1.y * canvas.height;
      
      // Connect to nearby points to form triangular mesh
      for (let j = i + 1; j < points.length; j++) {
        const p2 = points[j];
        const x2 = p2.x * canvas.width;
        const y2 = p2.y * canvas.height;
        
        const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        
        // Only connect points within reasonable distance to form mesh
        if (distance < 60 && distance > 10) {
          // Fade lines based on distance
          ctx.globalAlpha = opacity * (1 - distance / 60) * 0.7;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }
    }
    
    ctx.restore();
  };
  
  // Draw Delaunay-style triangulation for 3D mesh effect - unused but kept for reference
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const drawDelaunayMesh = (ctx: CanvasRenderingContext2D, points: FaceLandmark[], canvas: HTMLCanvasElement, opacity: number = 0.3) => {
    if (points.length < 3) return;
    
    ctx.save();
    ctx.strokeStyle = '#FCA5A5';
    ctx.lineWidth = 0.6;
    ctx.shadowColor = '#FCA5A5';
    ctx.shadowBlur = 2;
    
    // Simple triangulation - connect each point to its 2-3 nearest neighbors
    const drawn = new Set();
    
    points.forEach((p1, i) => {
      const x1 = p1.x * canvas.width;
      const y1 = p1.y * canvas.height;
      
      // Find nearest neighbors
      const neighbors = points
        .map((p2, j) => {
          if (i === j) return null;
          const x2 = p2.x * canvas.width;
          const y2 = p2.y * canvas.height;
          const dist = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
          return { point: p2, distance: dist, index: j };
        })
        .filter(n => n !== null && n.distance < 80)
        .sort((a, b) => (a?.distance ?? 0) - (b?.distance ?? 0))
        .slice(0, 3); // Connect to 3 nearest neighbors
      
      neighbors.forEach(neighbor => {
        if (!neighbor) return;
        const edgeKey = `${Math.min(i, neighbor.index)}-${Math.max(i, neighbor.index)}`;
        if (!drawn.has(edgeKey)) {
          drawn.add(edgeKey);
          
          const x2 = neighbor.point.x * canvas.width;
          const y2 = neighbor.point.y * canvas.height;
          
          ctx.globalAlpha = opacity * (1 - neighbor.distance / 80);
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      });
    });
    
    ctx.restore();
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
    faces.forEach((face) => {
      const simplePhases = {
        detecting: {
          // More comprehensive points for better triangulation
          points: face.keypoints.filter((_, i) => {
            // Eye regions
            if ((i >= 33 && i <= 46) || (i >= 263 && i <= 276)) return true;
            // Nose
            if ((i >= 1 && i <= 6) || (i >= 195 && i <= 197)) return true;
            // Mouth
            if ((i >= 13 && i <= 17) || (i >= 269 && i <= 271)) return true;
            // Face contour
            if ((i >= 10 && i <= 234 && i % 12 === 0) || 
                (i >= 356 && i <= 454 && i % 12 === 0)) return true;
            // Additional key points
            if (i % 10 === 0) return true;
            return false;
          }).filter(Boolean),
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
      
      // Enhanced scanning effect with 3D mesh for detecting phase (Step 1 only)
      if (phase === 'detecting') {
        const elapsed = Date.now() - animationStartTimeRef.current;
        const scanDuration = 2000; // 2 seconds for one complete cycle
        const scanProgress = Math.min(elapsed / scanDuration, 1);
        
        // Mark scan as complete after one cycle
        if (scanProgress >= 1 && !scanCompleteRef.current) {
          scanCompleteRef.current = true;
          console.log('🎯 [FaceLandmark] Scan complete, triggering callback');
          // Trigger callback to enable continue button if provided
          if (onLandmarksDetected) {
            onLandmarksDetected([{ scanComplete: true, keypoints: [] }]);
          }
        }
        
        // Only show scan animation if not complete
        if (scanProgress < 1) {
          // Single scan cycle: top to bottom to top ONCE
          let scanY;
          if (scanProgress < 0.5) {
            // First half: top to bottom
            const downProgress = scanProgress * 2; // 0 to 1
            scanY = downProgress * canvas.height;
          } else {
            // Second half: bottom to top
            const upProgress = (scanProgress - 0.5) * 2; // 0 to 1
            scanY = (1 - upProgress) * canvas.height;
          }
          
          const scanRange = 80; // Range of mesh visibility around scan line
          
          // Get all landmark groups for mesh
          const groups = getFaceLandmarkGroups(face.keypoints);
          const allMeshPoints = [...groups.outline, ...groups.eyes, ...groups.nose, ...groups.mouth];
          
          // Filter points based on scan position - only show mesh near scan line
          const activePoints = allMeshPoints.filter(point => {
            const pointY = point.y * canvas.height;
            const distFromScan = Math.abs(pointY - scanY);
            return distFromScan < scanRange;
          });
          
          // Draw scan line effect
          ctx.save();
          
          // Main scan line
          const scanGradient = ctx.createLinearGradient(0, scanY - 30, 0, scanY + 30);
          scanGradient.addColorStop(0, 'rgba(252, 165, 165, 0)');
          scanGradient.addColorStop(0.5, 'rgba(252, 165, 165, 0.4)');
          scanGradient.addColorStop(1, 'rgba(252, 165, 165, 0)');
          
          ctx.fillStyle = scanGradient;
          ctx.fillRect(0, scanY - 30, canvas.width, 60);
          
          // Bright scan line
          ctx.strokeStyle = '#FCA5A5';
          ctx.lineWidth = 2;
          ctx.shadowColor = '#FCA5A5';
          ctx.shadowBlur = 10;
          ctx.globalAlpha = 0.8;
          ctx.beginPath();
          ctx.moveTo(0, scanY);
          ctx.lineTo(canvas.width, scanY);
          ctx.stroke();
          
          // Secondary scan lines
          ctx.lineWidth = 0.5;
          ctx.globalAlpha = 0.3;
          ctx.shadowBlur = 5;
          ctx.beginPath();
          ctx.moveTo(0, scanY - 15);
          ctx.lineTo(canvas.width, scanY - 15);
          ctx.moveTo(0, scanY + 15);
          ctx.lineTo(canvas.width, scanY + 15);
          ctx.stroke();
          
          ctx.restore();
        
          // Draw 3D mesh for points near scan line with fade effect
          activePoints.forEach((point, i) => {
            const pointY = point.y * canvas.height;
            const distFromScan = Math.abs(pointY - scanY);
            const fadeOpacity = 1 - (distFromScan / scanRange);
            
            // Draw connections to nearby points
            activePoints.forEach((otherPoint, j) => {
              if (i >= j) return; // Avoid duplicate lines
              
              const x1 = point.x * canvas.width;
              const y1 = point.y * canvas.height;
              const x2 = otherPoint.x * canvas.width;
              const y2 = otherPoint.y * canvas.height;
              
              const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
              
              if (distance < 60 && distance > 10) {
                ctx.save();
                ctx.strokeStyle = '#FCA5A5';
                ctx.lineWidth = 0.6;
                ctx.globalAlpha = fadeOpacity * 0.3 * (1 - distance / 60);
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
                ctx.restore();
              }
            });
          });
          
          // Override current phase points to show active mesh points
          currentPhase.points = activePoints;
        } else {
          // Scan complete - no points to show
          currentPhase.points = [];
        }
        
      } else {
        // Original mesh for other phases
        ctx.strokeStyle = currentPhase.color;
        ctx.lineWidth = 0.5;
        ctx.globalAlpha = 0.2;
        
        currentPhase.points.forEach((point1, i) => {
          if (!point1) return;
          
          const x1 = point1.x * canvas.width;
          const y1 = point1.y * canvas.height;
          
          for (let j = i + 1; j < Math.min(i + 4, currentPhase.points.length); j++) {
            const point2 = currentPhase.points[j];
            if (!point2) continue;
            
            const x2 = point2.x * canvas.width;
            const y2 = point2.y * canvas.height;
            
            const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            
            if (distance < 50) {
              ctx.globalAlpha = Math.max(0.1, 0.3 - (distance / 100));
              
              ctx.beginPath();
              ctx.moveTo(x1, y1);
              ctx.lineTo(x2, y2);
              ctx.stroke();
            }
          }
        });
      }
      
      // Reset alpha for dots
      ctx.globalAlpha = 1;
      
      // Draw dots on top of lines
      currentPhase.points.forEach((landmark, index) => {
        if (!landmark) return;
        
        const x = landmark.x * canvas.width;
        const y = landmark.y * canvas.height;
        
        if (phase === 'detecting') {
          // Mesh vertices with scan-based visibility
          const elapsed = Date.now() - animationStartTimeRef.current;
          const scanDuration = 2000;
          const scanProgress = Math.min(elapsed / scanDuration, 1);
          
          // Only show dots if scan is still running
          if (scanProgress < 1) {
            let scanY;
            if (scanProgress < 0.5) {
              // First half: top to bottom
              const downProgress = scanProgress * 2;
              scanY = downProgress * canvas.height;
            } else {
              // Second half: bottom to top
              const upProgress = (scanProgress - 0.5) * 2;
              scanY = (1 - upProgress) * canvas.height;
            }
            const distFromScan = Math.abs(y - scanY);
            const scanRange = 80;
            
            if (distFromScan < scanRange) {
            const fadeOpacity = 1 - (distFromScan / scanRange);
            const baseSize = 2.5;
            const size = baseSize;
            
            // Outer glow
            ctx.save();
            const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
            glowGradient.addColorStop(0, `rgba(252, 165, 165, ${fadeOpacity * 0.8})`);
            glowGradient.addColorStop(1, 'rgba(252, 165, 165, 0)');
            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(x, y, size * 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();
            
            // Main vertex dot
            ctx.fillStyle = '#FCA5A5';
            ctx.shadowColor = '#FCA5A5';
            ctx.shadowBlur = 5;
            ctx.globalAlpha = fadeOpacity * 0.9;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, 2 * Math.PI);
            ctx.fill();
            
            // Bright center
            ctx.fillStyle = '#FFFFFF';
            ctx.shadowBlur = 0;
            ctx.globalAlpha = fadeOpacity;
            ctx.beginPath();
            ctx.arc(x, y, size * 0.3, 0, 2 * Math.PI);
            ctx.fill();
            }
          }
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
  const getAnimationPhaseForStep = (step: number): 'detecting' | 'extracting' | 'analyzing' | 'warm-cool' | 'season' | 'complete' => {
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
    
    // Ensure image is fully loaded
    if (!imageRef.current.complete || imageRef.current.naturalWidth === 0) {
      console.warn('⚠️ Image not fully loaded, retrying...');
      setTimeout(() => detectLandmarks(), 500);
      return;
    }

    try {
      console.log('🔍 [Synchronized] Starting face landmark detection...');
      console.log(`📐 Image dimensions: ${imageRef.current.width}x${imageRef.current.height}`);
      
      // Ensure TensorFlow is ready
      const tf = await getTensorFlow();
      if (!tf || !tf.engine()) {
        console.error('❌ TensorFlow engine not initialized');
        setError('AI engine not ready. Please refresh the page.');
        return;
      }
      
      // Async operations cannot be wrapped with tf.tidy - use manual cleanup
      const faces = await detector.estimateFaces(imageRef.current);
      console.log(`✅ [Synchronized] Detected ${faces.length} face(s)`);

      // Manually clean up any tensors that might have been created
      // tf is already declared above
      if (tf && tf.engine) {
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
      
      // Check if it's a TensorFlow initialization error
      if (err instanceof Error && (err.message.includes('is not a function') || err.message.includes('tf.'))) {
        console.error('🔄 TensorFlow initialization error detected, reinitializing...');
        setError('AI model initialization failed. Reloading page...');
        
        // Clear service worker cache and reload
        if ('caches' in window) {
          caches.keys().then(names => {
            names.forEach(name => caches.delete(name));
          });
        }
        
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
      animationStartTimeRef.current = Date.now(); // Record animation start time for Step 1
      scanCompleteRef.current = false; // Reset scan complete flag
      detectLandmarks();
    }
  }, [detector, detectLandmarks]);

  // Start detection when detector is ready and image is loaded
  useEffect(() => {
    if (detector && imageRef.current?.complete) {
      animationStartTimeRef.current = Date.now(); // Record animation start time for Step 1
      scanCompleteRef.current = false; // Reset scan complete flag
      detectLandmarks();
    }
  }, [detector, detectLandmarks]);

  // Animation loop for detecting phase with performance optimization
  useEffect(() => {
    let animationId: number;
    
    const animate = () => {
      if (animationPhase === 'detecting' && landmarks.length > 0) {
        const elapsed = Date.now() - animationStartTimeRef.current;
        const scanDuration = 2000;
        
        // Stop animation after scan completes
        if (elapsed >= scanDuration) {
          if (!scanCompleteRef.current) {
            scanCompleteRef.current = true;
            console.log('🎯 [Animation Loop] Scan complete after', elapsed, 'ms');
            // Draw one final frame with scan complete
            drawLandmarks(landmarks, 'detecting');
            if (onLandmarksDetected) {
              onLandmarksDetected([{ scanComplete: true, keypoints: [] }]);
            }
          }
          // Don't continue animation after scan completes
          return;
        }
        
        // Update every 2 frames for balance between smoothness and performance
        if (frameCountRef.current % 2 === 0) {
          drawLandmarks(landmarks, 'detecting');
        }
        frameCountRef.current++;
        animationId = requestAnimationFrame(animate);
      }
    };
    
    if (animationPhase === 'detecting' && landmarks.length > 0) {
      if (animationStartTimeRef.current === 0) {
        animationStartTimeRef.current = Date.now();
        scanCompleteRef.current = false;
      }
      frameCountRef.current = 0;
      animate();
    }
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [animationPhase, landmarks, drawLandmarks, onLandmarksDetected]);

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