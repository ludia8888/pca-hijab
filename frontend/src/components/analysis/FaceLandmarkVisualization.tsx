import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import '@tensorflow/tfjs-backend-webgl';
import * as tf from '@tensorflow/tfjs';

interface FaceLandmarkVisualizationProps {
  imageUrl: string;
  onLandmarksDetected?: (landmarks: any[]) => void;
  className?: string;
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
  className = ''
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
      try {
        console.log('🔧 Initializing TensorFlow.js backend...');
        await tf.ready();
        
        console.log('🔧 Loading MediaPipe Face Mesh model...');
        const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
        const detectorConfig = {
          runtime: 'tfjs' as const,
          refineLandmarks: true,
        };
        
        const faceDetector = await faceLandmarksDetection.createDetector(model, detectorConfig);
        setDetector(faceDetector);
        console.log('✅ Face landmark detector initialized');
      } catch (err) {
        console.error('❌ Failed to initialize face detector:', err);
        setError('Failed to load face detection model');
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

      // Define landmark groups for different analysis phases
      const landmarkGroups = {
        detecting: {
          points: face.keypoints.filter((_, i) => i % 8 === 0), // Sparse points
          color: '#00FF9F',
          size: 3,
          label: 'Face Detection'
        },
        extracting: {
          points: face.keypoints.filter((_, i) => 
            // Eyes, nose, mouth key points
            (i >= 33 && i <= 133) || // Right eye
            (i >= 362 && i <= 398) || // Left eye  
            (i >= 1 && i <= 97) || // Nose
            (i >= 61 && i <= 291) // Mouth
          ),
          color: '#FF6B9D',
          size: 2,
          label: 'Feature Extraction'
        },
        analyzing: {
          points: face.keypoints, // All points
          color: '#FFD93D',
          size: 1.5,
          label: 'Color Analysis'
        },
        complete: {
          points: face.keypoints.filter((_, i) => 
            // Key beauty points for personal color analysis
            i === 10 || i === 151 || i === 9 || i === 175 || // Forehead
            i === 93 || i === 132 || i === 58 || i === 172 || // Cheeks
            i === 150 || i === 176 || i === 148 || i === 152 // Jaw/chin
          ),
          color: '#8B5CF6',
          size: 4,
          label: 'Personal Color Points'
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

  // Detect face landmarks
  const detectLandmarks = useCallback(async () => {
    if (!detector || !imageRef.current) return;

    try {
      console.log('🔍 Starting face landmark detection...');
      setAnimationPhase('detecting');
      
      const faces = await detector.estimateFaces(imageRef.current);
      console.log(`✅ Detected ${faces.length} face(s)`);

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
      
      // Animate through different phases
      const phases = ['detecting', 'extracting', 'analyzing', 'complete'] as const;
      for (let i = 0; i < phases.length; i++) {
        setAnimationPhase(phases[i]);
        drawLandmarks(detectedFaces, phases[i]);
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      if (onLandmarksDetected) {
        onLandmarksDetected(detectedFaces);
      }

    } catch (err) {
      console.error('❌ Face detection failed:', err);
      setError('Face detection failed');
    }
  }, [detector, drawLandmarks, onLandmarksDetected]);

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

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center p-8">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-600">Loading AI face detection model...</p>
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
      
      {/* Analysis phase indicator */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm font-medium">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
          <span className="capitalize">{animationPhase.replace('_', ' ')}</span>
          {landmarks.length > 0 && (
            <span className="text-gray-300">
              ({landmarks[0]?.keypoints.length || 0} landmarks)
            </span>
          )}
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