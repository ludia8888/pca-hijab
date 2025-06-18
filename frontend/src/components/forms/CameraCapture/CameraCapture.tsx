import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

export const CameraCapture = ({ onCapture, onClose }: CameraCaptureProps): JSX.Element => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Start camera stream
  const startCamera = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'user', // 'environment' for back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Use promise-based play to handle async properly
        await videoRef.current.play().catch(() => {
          // Video play was interrupted, but this is often expected behavior
        });
      }

      setIsLoading(false);
    } catch {
      setError('Camera access permission is required.');
      setIsLoading(false);
    }
  }, []);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Capture photo
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Mirror the image horizontally (flip)
    context.translate(canvas.width, 0);
    context.scale(-1, 1);

    // Draw video frame to canvas
    context.drawImage(video, 0, 0);

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `photo_${Date.now()}.jpg`, {
          type: 'image/jpeg',
          lastModified: Date.now()
        });
        
        stopCamera();
        onCapture(file);
      }
    }, 'image/jpeg', 0.8);
  }, [onCapture, stopCamera]);

  // Initialize camera on mount
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="relative h-full flex flex-col">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/50 to-transparent">
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 rounded-full bg-white/20 backdrop-blur-sm text-white"
            aria-label="Close"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Camera View */}
        <div className="flex-1 flex items-center justify-center">
          {isLoading && (
            <div className="text-white text-center">
              <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p>Preparing camera...</p>
            </div>
          )}

          {error && (
            <div className="text-white text-center p-4">
              <p className="mb-4">{error}</p>
              <Button onClick={startCamera} variant="secondary">
                Try Again
              </Button>
            </div>
          )}

          <video
            ref={videoRef}
            className={`max-w-full max-h-full ${isLoading || error ? 'hidden' : ''}`}
            style={{ transform: 'scaleX(-1)' }}
            playsInline
            muted
          />
        </div>

        {/* Controls */}
        {!isLoading && !error && (
          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/50 to-transparent">
            <div className="flex justify-center">
              <button
                onClick={capturePhoto}
                className="w-20 h-20 rounded-full bg-white flex items-center justify-center hover:scale-95 transition-transform"
                aria-label="Capture"
              >
                <div className="w-16 h-16 rounded-full bg-primary" />
              </button>
            </div>
          </div>
        )}

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};