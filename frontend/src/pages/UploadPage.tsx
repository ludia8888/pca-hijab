import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';
import { compressImage } from '@/utils/helpers';
import { useAppStore } from '@/store';
import { Button, Card, PrivacyPopup, PrivacyAssurance } from '@/components/ui';
import { ImageUpload } from '@/components/forms';
import { PageLayout } from '@/components/layout/PageLayout';
import { PersonalColorAPI } from '@/services/api/personalColor';
import { trackImageUpload, trackEvent, trackEngagement, trackError, trackDropOff } from '@/utils/analytics';

const UploadPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { sessionId, setUploadedImage, setLoading, setError, error } = useAppStore();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [showPrivacyPopup, setShowPrivacyPopup] = useState(false);
  const [showPrivacyAssurance, setShowPrivacyAssurance] = useState(true);
  
  // Camera states
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Redirect if no session
  useEffect(() => {
    console.log('[UploadPage] Checking session, sessionId:', sessionId);
    if (!sessionId) {
      console.log('[UploadPage] No session found, redirecting to home...');
      trackDropOff('upload_page', 'no_session');
      navigate(ROUTES.HOME);
    } else {
      console.log('[UploadPage] Session found, user can upload image');
      // Track successful page entry
      trackEvent('page_enter', {
        page: 'upload',
        user_flow_step: 'upload_page_entered',
        has_session: true
      });
    }
  }, [sessionId, navigate]);

  // Start camera on component mount
  useEffect(() => {
    startCamera();
    
    // Cleanup camera on unmount
    return () => {
      stopCamera();
    };
  }, []);

  // Restart camera when facing mode changes
  useEffect(() => {
    if (isCameraActive) {
      stopCamera();
      startCamera();
    }
  }, [facingMode]);

  const startCamera = async (): Promise<void> => {
    try {
      setCameraError(null);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      
      setStream(mediaStream);
      setIsCameraActive(true);
      
      // Track camera access
      trackEvent('camera_access', {
        facing_mode: facingMode,
        status: 'granted',
        page: 'upload'
      });
    } catch (error) {
      console.error('Camera access error:', error);
      setCameraError('Camera access denied or not available');
      setIsCameraActive(false);
      
      // Track camera error
      trackError('camera_access_denied', error instanceof Error ? error.message : 'Camera not available', 'upload_page');
    }
  };

  const stopCamera = (): void => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhoto = async (): Promise<void> => {
    if (!videoRef.current || !canvasRef.current || !isCameraActive) return;

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) return;

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to blob
      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
          const preview = URL.createObjectURL(file);
          
          await handleImageUpload(file, preview);
          
          // Stop camera after capture
          stopCamera();
        }
      }, 'image/jpeg', 0.8);

      // Track photo capture
      trackEvent('photo_capture', {
        method: 'camera',
        facing_mode: facingMode,
        page: 'upload'
      });
    } catch (error) {
      console.error('Photo capture error:', error);
      handleImageError('Failed to capture photo');
    }
  };

  const switchCamera = (): void => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  // Pre-warm API on component mount (production only)
  useEffect(() => {
    if (import.meta.env.PROD) {
      // Skip health check for now to avoid 404 errors
      // PersonalColorAPI.healthCheck().catch(err => {
      //   console.log('API pre-warming failed:', err);
      // });
    }
  }, []);

  const handleImageUpload = async (file: File, preview: string): Promise<void> => {
    setSelectedFile(file);
    setPreviewUrl(preview);
    setError(null);
    
    // Track image upload success
    trackImageUpload(true, file.size, file.type);
  };

  const handleImageError = (error: string): void => {
    setError(error);
    
    // Track image upload failure with detailed error
    trackImageUpload(false, undefined, undefined, error);
    trackError('image_upload_error', error, 'upload_page');
  };

  const handleAnalyze = async (): Promise<void> => {
    if (!selectedFile || !previewUrl) return;

    try {
      setIsCompressing(true);
      setLoading(true);

      // Track AI analysis start with enhanced data
      trackEvent('button_click', {
        button_name: 'analyze_my_colors',
        page: 'upload',
        file_size_mb: Math.round(selectedFile.size / (1024 * 1024) * 100) / 100,
        file_type: selectedFile.type,
        user_flow_step: 'analysis_button_clicked'
      });

      trackEngagement('button_click', 'analyze_my_colors_button');

      // Compress image before storing
      const compressedFile = await compressImage(selectedFile);
      
      // Store compressed image and preview
      setUploadedImage(previewUrl, compressedFile);
      
      // Navigate to analysis page
      navigate(ROUTES.ANALYZING);
    } catch (error) {
      const errorMessage = 'An error occurred while processing the image. Please try again.';
      setError(errorMessage);
      trackError('image_compression_error', error instanceof Error ? error.message : 'Unknown error', 'upload_page');
    } finally {
      setIsCompressing(false);
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="text-center pt-12 pb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Upload Your Photo
          </h1>
        </div>

        {/* Main Photo Area */}
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          {/* Photo Preview/Camera Area */}
          <div className="relative w-full max-w-sm aspect-[3/4] mb-8">
            {previewUrl ? (
              // Show captured photo with face detection guide
              <div className="relative w-full h-full rounded-3xl overflow-hidden bg-white shadow-lg">
                <img 
                  src={previewUrl} 
                  alt="Captured photo" 
                  className="w-full h-full object-cover"
                />
                {/* Face detection guide overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div 
                    className="border-4 border-white border-dashed rounded-full opacity-80"
                    style={{
                      width: '70%',
                      aspectRatio: '1',
                      borderStyle: 'dashed',
                      borderWidth: '3px'
                    }}
                  />
                </div>
              </div>
            ) : (
              // Show live camera feed
              <div className="relative w-full h-full rounded-3xl overflow-hidden bg-black shadow-lg">
                {isCameraActive && !cameraError ? (
                  <>
                    {/* Live camera video */}
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      autoPlay
                      playsInline
                      muted
                    />
                    
                    {/* Face detection guide overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div 
                        className="border-4 border-white border-dashed rounded-full opacity-70 animate-pulse"
                        style={{
                          width: '70%',
                          aspectRatio: '1',
                          borderStyle: 'dashed',
                          borderWidth: '3px'
                        }}
                      />
                    </div>

                    {/* Camera status indicator */}
                    <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      Live
                    </div>

                    {/* Camera mode indicator */}
                    <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      {facingMode === 'user' ? 'Front' : 'Back'}
                    </div>
                  </>
                ) : cameraError ? (
                  // Camera error state
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <div className="text-center text-white px-6">
                      <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                      </svg>
                      <h3 className="text-lg font-semibold mb-2">Camera Not Available</h3>
                      <p className="text-sm text-gray-300 mb-4">{cameraError}</p>
                      <button
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = async (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) {
                              try {
                                const preview = URL.createObjectURL(file);
                                await handleImageUpload(file, preview);
                              } catch (error) {
                                handleImageError('Failed to process image');
                              }
                            }
                          };
                          input.click();
                        }}
                        className="bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        Upload Photo Instead
                      </button>
                    </div>
                  </div>
                ) : (
                  // Loading camera state
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <div className="text-center text-white">
                      <svg className="animate-spin w-8 h-8 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      <p className="text-sm">Starting camera...</p>
                    </div>
                  </div>
                )}
                
                {/* Hidden canvas for photo capture */}
                <canvas ref={canvasRef} className="hidden" />
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl max-w-sm w-full">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Guidelines */}
          <div className="bg-white rounded-2xl p-6 mx-4 mb-8 shadow-sm border border-gray-100 max-w-sm w-full">
            <div className="grid grid-cols-3 gap-6">
              {/* No filters */}
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-black rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-700">No filters</p>
              </div>

              {/* Natural lighting */}
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-black rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-700">Natural lighting</p>
              </div>

              {/* Front facing */}
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-black rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-700">Front facing</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="pb-safe-area-inset-bottom pb-8">
          <div className="flex items-center justify-center gap-8 px-8">
            {/* Gallery/Upload Button */}
            <button
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = async (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    try {
                      const preview = URL.createObjectURL(file);
                      await handleImageUpload(file, preview);
                    } catch (error) {
                      handleImageError('Failed to process image');
                    }
                  }
                };
                input.click();
              }}
              disabled={isCompressing}
              className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>

            {/* Capture Photo Button */}
            <button
              onClick={previewUrl ? handleAnalyze : capturePhoto}
              disabled={isCompressing || (!isCameraActive && !previewUrl)}
              className="w-16 h-16 bg-white border-4 border-black rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCompressing ? (
                <svg className="animate-spin w-6 h-6 text-black" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
              ) : previewUrl ? (
                // Show analyze icon when photo is captured
                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              ) : (
                // Show shutter button when camera is active
                <div className="w-12 h-12 bg-white rounded-full"></div>
              )}
            </button>

            {/* Flip Camera Button */}
            <button
              onClick={switchCamera}
              disabled={!isCameraActive || cameraError !== null}
              className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

        </div>
        
        {/* Privacy Popup */}
        <PrivacyPopup 
          isOpen={showPrivacyPopup} 
          onClose={() => setShowPrivacyPopup(false)} 
        />
        
        {/* Privacy Assurance - Auto popup */}
        {showPrivacyAssurance && (
          <PrivacyAssurance 
            onClose={() => setShowPrivacyAssurance(false)}
            autoClose={true}
            autoCloseDelay={7000}
          />
        )}
      </div>
    </PageLayout>
  );
};

export default UploadPage;