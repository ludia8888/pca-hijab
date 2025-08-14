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
import { initFaceDetector, detectFaceInVideo, isFaceWellPositioned, getFaceQualityScore } from '@/utils/simpleFaceDetection';

const UploadPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { sessionId, setUploadedImage, setLoading, setError, error } = useAppStore();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [showPrivacyPopup, setShowPrivacyPopup] = useState(false);
  const [isValidatingFace, setIsValidatingFace] = useState(false);
  const [showPrivacyAssurance, setShowPrivacyAssurance] = useState(true);
  
  // Camera states
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const streamRef = useRef<MediaStream | null>(null); // Add ref to avoid closure issues
  const [isCameraActive, setIsCameraActive] = useState(false);
  const isCameraActiveRef = useRef(false); // Add ref to avoid closure issues
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  // Face detection states
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceQuality, setFaceQuality] = useState(0);
  const [captureCountdown, setCaptureCountdown] = useState<number | null>(null);
  const [isProcessingFace, setIsProcessingFace] = useState(false);
  const isProcessingFaceRef = useRef(false); // Add ref to avoid closure issues
  const faceDetectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const captureTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const detectionCountRef = useRef(0); // Add ref for detection count to avoid closure
  let faceDetector: any = null; // Face detector for validating uploaded images

  // Redirect if no session
  useEffect(() => {
    console.log('🔍 [UploadPage] Checking session, sessionId:', sessionId);
    console.log('🔍 [UploadPage] Page load time:', new Date().toISOString());
    
    if (!sessionId) {
      console.log('❌ [UploadPage] No session found, redirecting to home...');
      trackDropOff('upload_page', 'no_session');
      navigate(ROUTES.HOME);
    } else {
      console.log('✅ [UploadPage] Session found, user can upload image');
      // Track successful page entry
      trackEvent('page_enter', {
        page: 'upload',
        user_flow_step: 'upload_page_entered',
        has_session: true,
        timestamp: new Date().toISOString()
      });
    }
  }, [sessionId, navigate]);

  // Initialize face detector on mount
  useEffect(() => {
    console.log('🚀 [FACE DETECTION] Initializing face detector...');
    initFaceDetector()
      .then(result => {
        console.log('✅ [FACE DETECTION] Face detector initialized, result:', result);
      })
      .catch(err => {
        console.error('❌ [FACE DETECTION] Failed to initialize face detector:', err);
      });
  }, []);

  // Start camera on component mount
  useEffect(() => {
    console.log('🚀 [Camera API] Component mounted, starting camera...');
    console.log('🚀 [Camera API] Browser info:', {
      userAgent: navigator.userAgent,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine
    });
    
    // Check device capabilities
    if (navigator.mediaDevices) {
      navigator.mediaDevices.enumerateDevices()
        .then(devices => {
          const videoDevices = devices.filter(device => device.kind === 'videoinput');
          console.log('📹 [Camera API] Available video devices:', videoDevices.length);
          videoDevices.forEach((device, index) => {
            console.log(`📹 [Camera API] Video device ${index + 1}:`, {
              deviceId: device.deviceId,
              label: device.label || 'Unknown Camera',
              kind: device.kind
            });
          });
        })
        .catch(err => {
          console.error('🚨 [Camera API] Error enumerating devices:', err);
        });
    }
    
    // Wait for refs to be available before starting camera
    const startCameraWhenReady = () => {
      console.log('🔍 [Camera API] Checking refs availability...', {
        videoRef: !!videoRef.current,
        canvasRef: !!canvasRef.current
      });
      
      if (videoRef.current && canvasRef.current) {
        console.log('✅ [Camera API] Refs are ready, starting camera');
        startCamera();
      } else {
        console.log('⏳ [Camera API] Refs not ready yet, waiting...');
        setTimeout(startCameraWhenReady, 100);
      }
    };
    
    startCameraWhenReady();
    
    // Cleanup camera on unmount
    return () => {
      console.log('🔚 [Camera API] Component unmounting, cleaning up...');
      stopCamera();
      stopFaceDetection();
    };
  }, []);

  // Restart camera when facing mode changes
  useEffect(() => {
    console.log('🔄 [Camera API] Facing mode changed to:', facingMode);
    
    if (isCameraActive) {
      console.log('🔄 [Camera API] Restarting camera with new facing mode...');
      stopCamera();
      
      // Wait for refs to be available before restarting camera
      const restartCameraWhenReady = () => {
        console.log('🔍 [Camera API] Checking refs for restart...', {
          videoRef: !!videoRef.current,
          canvasRef: !!canvasRef.current
        });
        
        if (videoRef.current && canvasRef.current) {
          console.log('✅ [Camera API] Refs ready for restart, starting camera');
          startCamera();
        } else {
          console.log('⏳ [Camera API] Refs not ready for restart, waiting...');
          setTimeout(restartCameraWhenReady, 100);
        }
      };
      
      restartCameraWhenReady();
    } else {
      console.log('ℹ️ [Camera API] Camera not active, skipping restart');
    }
  }, [facingMode]);

  const startCamera = async (): Promise<void> => {
    console.log('🎥 [Camera API] Starting camera initialization...');
    console.log('🎥 [Camera API] Requested facing mode:', facingMode);
    
    // Double-check refs are available
    if (!videoRef.current || !canvasRef.current) {
      console.error('🚨 [Camera API] Video or canvas ref is null at start!', {
        videoRef: !!videoRef.current,
        canvasRef: !!canvasRef.current
      });
      setCameraError('Camera elements not ready');
      setIsCameraActive(false);
      return;
    }
    
    // Check if getUserMedia is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('🚨 [Camera API] getUserMedia not supported in this browser');
      setCameraError('Camera not supported in this browser');
      setIsCameraActive(false);
      isCameraActiveRef.current = false;
      return;
    }
    
    console.log('✅ [Camera API] getUserMedia is available');
    
    try {
      setCameraError(null);
      console.log('🎥 [Camera API] Requesting media stream with constraints:', {
        video: { 
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      const startTime = performance.now();
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      const initTime = performance.now() - startTime;
      
      console.log('✅ [Camera API] Media stream obtained successfully');
      console.log('⏱️ [Camera API] Initialization time:', Math.round(initTime), 'ms');
      console.log('🎥 [Camera API] Media stream details:', {
        id: mediaStream.id,
        active: mediaStream.active,
        videoTracks: mediaStream.getVideoTracks().length,
        audioTracks: mediaStream.getAudioTracks().length
      });
      
      // Log video track details
      const videoTracks = mediaStream.getVideoTracks();
      if (videoTracks.length > 0) {
        const videoTrack = videoTracks[0];
        const settings = videoTrack.getSettings();
        console.log('📹 [Camera API] Video track settings:', {
          width: settings.width,
          height: settings.height,
          frameRate: settings.frameRate,
          facingMode: settings.facingMode,
          deviceId: settings.deviceId,
          label: videoTrack.label
        });
      }
      
      if (videoRef.current) {
        console.log('🎥 [Camera API] Setting video element source...');
        const video = videoRef.current;
        
        // Create promise to wait for video to be ready
        const videoReadyPromise = new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Video loading timeout'));
          }, 10000);
          
          const onLoadedMetadata = () => {
            console.log('📺 [Camera API] Video metadata loaded');
            console.log('📺 [Camera API] Video dimensions:', {
              videoWidth: video.videoWidth,
              videoHeight: video.videoHeight
            });
            if (video.videoWidth > 0 && video.videoHeight > 0) {
              clearTimeout(timeout);
              resolve();
            }
          };
          
          const onPlay = () => {
            console.log('▶️ [Camera API] Video started playing');
          };
          
          const onError = (e: Event) => {
            console.error('🚨 [Camera API] Video element error:', e);
            clearTimeout(timeout);
            reject(new Error('Video element error'));
          };
          
          video.onloadedmetadata = onLoadedMetadata;
          video.onplay = onPlay;
          video.onerror = onError;
        });
        
        video.srcObject = mediaStream;
        
        try {
          await video.play();
          console.log('✅ [Camera API] Video element play() called successfully');
          
          // Wait for video to be fully ready
          await videoReadyPromise;
          console.log('✅ [Camera API] Video is fully ready for capture');
        } catch (playError) {
          console.error('🚨 [Camera API] Video play error:', playError);
          throw playError;
        }
      } else {
        console.error('🚨 [Camera API] Video ref is null!');
        throw new Error('Video element not available');
      }
      
      setStream(mediaStream);
      streamRef.current = mediaStream; // Update ref as well
      setIsCameraActive(true);
      isCameraActiveRef.current = true; // Update ref as well
      
      console.log('🎉 [Camera API] Camera initialization completed successfully');
      
      // Start face detection immediately (no closure issue with ref)
      startFaceDetection();
      console.log('👤 [Camera API] Face detection started');
      
      // Track camera access
      trackEvent('camera_access', {
        facing_mode: facingMode,
        status: 'granted',
        page: 'upload',
        init_time_ms: Math.round(initTime),
        video_width: mediaStream.getVideoTracks()[0]?.getSettings().width,
        video_height: mediaStream.getVideoTracks()[0]?.getSettings().height
      });
    } catch (error) {
      console.error('🚨 [Camera API] Camera access error:', error);
      
      // Log detailed error information
      if (error instanceof Error) {
        console.error('🚨 [Camera API] Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
        
        // Specific error types
        switch (error.name) {
          case 'NotAllowedError':
            console.error('🚨 [Camera API] User denied camera permission');
            break;
          case 'NotFoundError':
            console.error('🚨 [Camera API] No camera device found');
            break;
          case 'NotReadableError':
            console.error('🚨 [Camera API] Camera is already in use by another application');
            break;
          case 'OverconstrainedError':
            console.error('🚨 [Camera API] Camera constraints cannot be satisfied');
            break;
          case 'SecurityError':
            console.error('🚨 [Camera API] Security error - HTTPS required');
            break;
          default:
            console.error('🚨 [Camera API] Unknown camera error type:', error.name);
        }
      }
      
      setCameraError('Camera access denied or not available');
      setIsCameraActive(false);
      isCameraActiveRef.current = false;
      
      // Track camera error
      trackError('camera_access_denied', error instanceof Error ? error.message : 'Camera not available', 'upload_page');
    }
  };

  // Face detection logic
  const startFaceDetection = (): void => {
    console.log('🎯 [FACE DETECTION] startFaceDetection called');
    console.log('🎯 [FACE DETECTION] Current state:', {
      videoRef: !!videoRef.current,
      isCameraActive: isCameraActiveRef.current, // Use ref value
      isProcessingFace,
      captureCountdown
    });
    
    if (faceDetectionIntervalRef.current) {
      console.log('🔄 [FACE DETECTION] Clearing existing interval');
      clearInterval(faceDetectionIntervalRef.current);
    }
    
    console.log('👤 [FACE DETECTION] Starting face detection interval...');
    
    detectionCountRef.current = 0; // Reset detection count
    faceDetectionIntervalRef.current = setInterval(async () => {
      detectionCountRef.current++;
      
      if (!videoRef.current || !isCameraActiveRef.current || isProcessingFaceRef.current || captureCountdown !== null) {
        console.log(`⏭️ [FACE DETECTION] Skipping detection #${detectionCountRef.current}:`, {
          hasVideo: !!videoRef.current,
          isCameraActive: isCameraActiveRef.current,
          isProcessingFace: isProcessingFaceRef.current, // Use ref value
          captureCountdown
        });
        return;
      }
      
      console.log(`🔍 [FACE DETECTION] Running detection #${detectionCountRef.current}`);
      setIsProcessingFace(true);
      isProcessingFaceRef.current = true; // Update ref as well
      
      try {
        console.log(`📷 [FACE DETECTION] Calling detectFaceInVideo...`);
        const face = await detectFaceInVideo(videoRef.current);
        console.log(`📊 [FACE DETECTION] Detection #${detectionCountRef.current} result:`, face);
        
        if (face) {
          // Simplified logic for fallback mode - always trigger after 2 seconds
          const isWellPositioned = isFaceWellPositioned(
            face,
            videoRef.current.videoWidth,
            videoRef.current.videoHeight
          );
          
          const quality = getFaceQualityScore(
            face,
            videoRef.current.videoWidth,
            videoRef.current.videoHeight
          );
          
          console.log(`✨ [FACE DETECTION] Face found:`, {
            isWellPositioned,
            quality,
            face
          });
          
          setFaceDetected(true);
          setFaceQuality(quality);
          
          // Simplified: In fallback mode, always trigger after detecting for 1 second (5 detections)
          if (detectionCountRef.current >= 5 && !captureCountdown) {
            console.log('✅ [FACE DETECTION] Auto-capturing after 1 second of detection...');
            startCaptureCountdown();
          } else if (!captureCountdown) {
            console.log(`⏳ [FACE DETECTION] Waiting... ${detectionCountRef.current}/5 detections before auto-capture`);
          }
        } else {
          console.log(`❌ [FACE DETECTION] No face detected in #${detectionCountRef.current}`);
          setFaceDetected(false);
          setFaceQuality(0);
          
          // Cancel countdown if face is lost
          if (captureCountdown !== null) {
            console.log('🚫 [FACE DETECTION] Canceling countdown - face lost');
            cancelCaptureCountdown();
          }
        }
      } catch (error) {
        console.error(`❌ [FACE DETECTION] Error in detection #${detectionCountRef.current}:`, error);
        console.error(`❌ [FACE DETECTION] Error stack:`, error instanceof Error ? error.stack : 'No stack');
      } finally {
        setIsProcessingFace(false);
        isProcessingFaceRef.current = false; // Reset ref as well
      }
    }, 200); // Check every 200ms
    
    console.log('✅ [FACE DETECTION] Interval started');
  };
  
  const stopFaceDetection = (): void => {
    console.log('🛑 [FACE DETECTION] Stopping face detection...');
    if (faceDetectionIntervalRef.current) {
      clearInterval(faceDetectionIntervalRef.current);
      faceDetectionIntervalRef.current = null;
      console.log('✅ [FACE DETECTION] Face detection interval cleared');
    } else {
      console.log('ℹ️ [FACE DETECTION] No active interval to stop');
    }
    setFaceDetected(false);
    setFaceQuality(0);
  };
  
  const startCaptureCountdown = (): void => {
    let countdown = 3;
    setCaptureCountdown(countdown);
    
    // Stop face detection while counting down
    console.log('⏸️ [FACE DETECTION] Pausing detection during countdown...');
    stopFaceDetection();
    
    const countdownInterval = setInterval(() => {
      countdown--;
      
      if (countdown > 0) {
        setCaptureCountdown(countdown);
      } else {
        clearInterval(countdownInterval);
        setCaptureCountdown(null);
        
        // Take photo
        console.log('📸 Auto-capturing photo...');
        capturePhoto();
        
        // Track auto capture
        trackEvent('auto_capture', {
          face_quality: faceQuality,
          page: 'upload'
        });
      }
    }, 1000);
    
    captureTimeoutRef.current = countdownInterval;
  };
  
  const cancelCaptureCountdown = (): void => {
    if (captureTimeoutRef.current) {
      clearInterval(captureTimeoutRef.current);
      captureTimeoutRef.current = null;
    }
    setCaptureCountdown(null);
  };

  const stopCamera = (): void => {
    console.log('🛑 [Camera API] Stopping camera...');
    
    stopFaceDetection();
    cancelCaptureCountdown();
    
    if (stream) {
      const tracks = stream.getTracks();
      console.log('🛑 [Camera API] Stopping', tracks.length, 'media tracks');
      
      tracks.forEach((track, index) => {
        console.log(`🛑 [Camera API] Stopping track ${index + 1}:`, {
          kind: track.kind,
          label: track.label,
          readyState: track.readyState
        });
        track.stop();
      });
      
      setStream(null);
      streamRef.current = null; // Clear ref as well
      console.log('✅ [Camera API] All tracks stopped and stream cleared');
    } else {
      console.log('ℹ️ [Camera API] No active stream to stop');
    }
    
    setIsCameraActive(false);
    isCameraActiveRef.current = false;
    console.log('✅ [Camera API] Camera stopped successfully');
  };

  const capturePhoto = async (): Promise<void> => {
    console.log('📸 [Camera API] Starting photo capture...');
    console.log('📸 [Camera API] Current camera state:', {
      isCameraActive: isCameraActiveRef.current,
      hasStream: !!streamRef.current,  // Use ref instead of state
      videoRef: !!videoRef.current,
      canvasRef: !!canvasRef.current
    });
    
    // Pre-capture validation
    if (!videoRef.current) {
      console.error('🚨 [Camera API] Video ref is null - cannot capture');
      handleImageError('Camera not ready for capture');
      return;
    }
    if (!canvasRef.current) {
      console.error('🚨 [Camera API] Canvas ref is null - cannot capture');
      handleImageError('Canvas not available for capture');
      return;
    }
    // Use streamRef to avoid closure issues
    if (!streamRef.current) {
      console.error('🚨 [Camera API] No stream available - cannot capture');
      handleImageError('Camera stream not available');
      return;
    }
    
    console.log('✅ [Camera API] Pre-capture validation passed');

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) {
        console.error('🚨 [Camera API] Cannot get 2D context from canvas');
        handleImageError('Canvas context not available');
        return;
      }
      
      // Wait for video to be ready if needed
      if (video.videoWidth === 0 || video.videoHeight === 0 || video.readyState < 2) {
        console.log('⏳ [Camera API] Waiting for video to be ready...');
        
        // Wait up to 3 seconds for video to be ready
        const waitForVideo = new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Video not ready within timeout'));
          }, 3000);
          
          const checkReady = () => {
            if (video.videoWidth > 0 && video.videoHeight > 0 && video.readyState >= 2) {
              clearTimeout(timeout);
              console.log('✅ [Camera API] Video is now ready');
              resolve();
            } else {
              setTimeout(checkReady, 100);
            }
          };
          
          checkReady();
        });
        
        try {
          await waitForVideo;
        } catch (waitError) {
          console.error('🚨 [Camera API] Video not ready for capture:', waitError);
          handleImageError('Camera video not ready');
          return;
        }
      }
      
      console.log('📸 [Camera API] Video element state:', {
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        readyState: video.readyState,
        currentTime: video.currentTime,
        paused: video.paused
      });

      // Validate video dimensions
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        console.error('🚨 [Camera API] Invalid video dimensions');
        handleImageError('Invalid camera video dimensions');
        return;
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      console.log('📸 [Camera API] Canvas dimensions set:', {
        width: canvas.width,
        height: canvas.height
      });

      const drawStartTime = performance.now();
      
      // Handle front camera mirroring when drawing to canvas
      if (facingMode === 'user') {
        // Flip horizontally for front camera
        context.scale(-1, 1);
        context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
        context.scale(-1, 1); // Reset transformation
      } else {
        // Draw normally for back camera
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      
      const drawTime = performance.now() - drawStartTime;
      
      console.log('✅ [Camera API] Video frame drawn to canvas in', Math.round(drawTime), 'ms');

      // Validate canvas has content
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const hasContent = imageData.data.some(pixel => pixel !== 0);
      
      if (!hasContent) {
        console.error('🚨 [Camera API] Canvas appears to be empty');
        handleImageError('Failed to capture image - empty frame');
        return;
      }

      const blobStartTime = performance.now();
      // Convert to blob with promise wrapper
      const blobPromise = new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/jpeg', 0.8);
      });
      
      const blob = await blobPromise;
      const blobTime = performance.now() - blobStartTime;
      console.log('⏱️ [Camera API] Canvas to blob conversion time:', Math.round(blobTime), 'ms');
      
      if (blob && blob.size > 0) {
        console.log('📸 [Camera API] Photo blob created:', {
          size: blob.size,
          type: blob.type,
          sizeKB: Math.round(blob.size / 1024)
        });
        
        const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
        const preview = URL.createObjectURL(file);
        
        console.log('📸 [Camera API] Photo file created:', {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        });
        
        await handleImageUpload(file, preview);
        
        console.log('✅ [Camera API] Photo uploaded successfully');
        
        // Stop camera after capture
        stopCamera();
      } else {
        console.error('🚨 [Camera API] Failed to create blob from canvas or blob is empty');
        handleImageError('Failed to capture photo - image processing failed');
        return;
      }

      // Track photo capture
      trackEvent('photo_capture', {
        method: 'camera',
        facing_mode: facingMode,
        page: 'upload',
        canvas_width: canvas.width,
        canvas_height: canvas.height,
        draw_time_ms: Math.round(drawTime),
        blob_size_kb: blob ? Math.round(blob.size / 1024) : 0
      });
      
      console.log('🎉 [Camera API] Photo capture process completed successfully');
    } catch (error) {
      console.error('🚨 [Camera API] Photo capture error:', error);
      
      if (error instanceof Error) {
        console.error('🚨 [Camera API] Capture error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
      
      handleImageError('Failed to capture photo');
    }
  };

  const switchCamera = (): void => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    console.log('🔄 [Camera API] Switching camera from', facingMode, 'to', newFacingMode);
    
    setFacingMode(newFacingMode);
    
    // Track camera switch
    trackEvent('camera_switch', {
      from_facing_mode: facingMode,
      to_facing_mode: newFacingMode,
      page: 'upload'
    });
  };

  // Camera API testing function for development
  const testCameraAPI = (): void => {
    console.log('\n🧪 [Camera API Test] Starting comprehensive camera API test...');
    console.log('=' .repeat(50));
    
    // Test 1: Browser support
    console.log('🧪 [Test 1] Browser support check:');
    console.log('   - navigator.mediaDevices:', !!navigator.mediaDevices);
    console.log('   - getUserMedia:', !!navigator.mediaDevices?.getUserMedia);
    console.log('   - enumerateDevices:', !!navigator.mediaDevices?.enumerateDevices);
    
    // Test 2: Current state
    console.log('🧪 [Test 2] Current camera state:');
    console.log('   - isCameraActive:', isCameraActive);
    console.log('   - facingMode:', facingMode);
    console.log('   - cameraError:', cameraError);
    console.log('   - stream:', stream ? 'Active' : 'None');
    console.log('   - videoRef.current:', !!videoRef.current);
    console.log('   - canvasRef.current:', !!canvasRef.current);
    
    // Test 3: Video element details
    if (videoRef.current) {
      const video = videoRef.current;
      console.log('🧪 [Test 3] Video element details:');
      console.log('   - videoWidth:', video.videoWidth);
      console.log('   - videoHeight:', video.videoHeight);
      console.log('   - readyState:', video.readyState);
      console.log('   - currentTime:', video.currentTime);
      console.log('   - paused:', video.paused);
      console.log('   - srcObject:', !!video.srcObject);
    }
    
    // Test 4: Stream details
    if (stream) {
      console.log('🧪 [Test 4] Media stream details:');
      console.log('   - id:', stream.id);
      console.log('   - active:', stream.active);
      console.log('   - videoTracks:', stream.getVideoTracks().length);
      
      stream.getVideoTracks().forEach((track, index) => {
        const settings = track.getSettings();
        console.log(`   - Track ${index + 1}:`, {
          label: track.label,
          readyState: track.readyState,
          width: settings.width,
          height: settings.height,
          facingMode: settings.facingMode
        });
      });
    }
    
    // Test 5: Device enumeration
    if (navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices()
        .then(devices => {
          const videoDevices = devices.filter(d => d.kind === 'videoinput');
          console.log('🧪 [Test 5] Available video devices:');
          console.log('   - Total devices:', devices.length);
          console.log('   - Video devices:', videoDevices.length);
          videoDevices.forEach((device, index) => {
            console.log(`   - Device ${index + 1}:`, {
              deviceId: device.deviceId.substring(0, 20) + '...',
              label: device.label || 'Unknown Camera'
            });
          });
        })
        .catch(err => console.error('   - Device enumeration failed:', err));
    }
    
    console.log('=' .repeat(50));
    console.log('🧪 [Camera API Test] Test completed. Check logs above for details.\n');
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
    setIsValidatingFace(true);
    
    try {
      // Initialize face detector if not already done
      if (!faceDetector && 'FaceDetector' in window) {
        try {
          // @ts-ignore - FaceDetector is experimental
          faceDetector = new window.FaceDetector();
          console.log('✅ [Face Validation] FaceDetector initialized for image validation');
        } catch (error) {
          console.warn('⚠️ [Face Validation] Could not initialize FaceDetector:', error);
        }
      }
      
      // Validate face in image
      const img = new Image();
      img.src = preview;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      
      // Create canvas to extract image data
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not create canvas context');
      }
      ctx.drawImage(img, 0, 0);
      
      // Check for face using FaceDetector API if available
      let faceDetected = false;
      if (faceDetector) {
        try {
          const faces = await faceDetector.detect(canvas);
          faceDetected = faces && faces.length > 0;
          console.log('🔍 [Face Validation] Detected faces in uploaded image:', faces.length);
          
          if (!faceDetected) {
            // No face detected - reject the image
            setError('얼굴이 감지되지 않았습니다. 얼굴이 잘 보이는 사진을 업로드해주세요.');
            setSelectedFile(null);
            setPreviewUrl(null);
            trackImageUpload(false, file.size, file.type, 'no_face_detected');
            trackError('no_face_in_upload', 'No face detected in uploaded image', 'upload_page');
            return;
          }
        } catch (error) {
          console.warn('⚠️ [Face Validation] FaceDetector failed, accepting image with warning:', error);
          // Fallback: Accept the image but warn the user
          faceDetected = true;
        }
      } else {
        // No FaceDetector available, accept with warning
        console.warn('⚠️ [Face Validation] No FaceDetector available, accepting image without validation');
        faceDetected = true;
      }
      
      // Track image upload success
      trackImageUpload(true, file.size, file.type);
    } catch (error) {
      console.error('❌ [Face Validation] Error validating face:', error);
      // On error, accept the image but log the issue
      trackImageUpload(true, file.size, file.type, 'face_validation_error');
    } finally {
      setIsValidatingFace(false);
    }
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

  // Disable body scroll on mount
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  return (
    <PageLayout>
      <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="text-center pt-4 pb-0">
          <h1 className="text-xl font-bold text-gray-900">
            Upload Your Photo
          </h1>
        </div>

        {/* Main Photo Area */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 min-h-0">
          {/* Photo Preview/Camera Area */}
          <div className="relative w-full max-w-sm aspect-[3/4] mb-4">
            {/* Always render video and canvas elements outside conditional rendering for refs */}
            <video
              ref={videoRef}
              className={`absolute inset-0 w-full h-full object-cover rounded-3xl ${
                !previewUrl && isCameraActive && !cameraError ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none'
              } ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              autoPlay
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="absolute opacity-0 pointer-events-none" />
            
            {/* Face detection guide overlay - Always show when no preview */}
            {!previewUrl && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                <div 
                  className={`border-4 ${faceDetected ? 'border-green-500' : 'border-gray-400'} border-dashed opacity-70 ${faceDetected ? '' : 'animate-pulse'}`}
                  style={{
                    width: '60%',
                    height: '75%',
                    borderStyle: 'dashed',
                    borderWidth: '3px',
                    borderRadius: '50%'
                  }}
                />
              </div>
            )}
            
            {/* Face detection status */}
            {!previewUrl && isCameraActive && (
              <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center gap-2 z-30">
                {/* Auto capture countdown */}
                {captureCountdown !== null && (
                  <div className="bg-primary-600 text-white px-4 py-2 rounded-full text-lg font-bold animate-pulse">
                    {captureCountdown}초 후 촬영...
                  </div>
                )}
              </div>
            )}
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
                    className="border-4 border-white border-dashed opacity-80"
                    style={{
                      width: '60%',
                      height: '75%',
                      borderStyle: 'dashed',
                      borderWidth: '3px',
                      borderRadius: '50%'
                    }}
                  />
                </div>
                {/* Face validation loading overlay */}
                {isValidatingFace && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center rounded-3xl z-40">
                    <div className="bg-white rounded-xl p-4 shadow-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">얼굴 인식 확인중</p>
                          <p className="text-xs text-gray-500">잠시만 기다려주세요...</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Show live camera feed
              <div className="relative w-full h-full rounded-3xl overflow-hidden bg-black shadow-lg">
                {isCameraActive && !cameraError ? (
                  <>
                    {/* Camera status indicator */}
                    <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2 z-30">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      Live
                    </div>

                    {/* Camera mode indicator */}
                    <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm z-30">
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
          <div className="bg-white rounded-2xl p-3 mx-4 mb-4 shadow-sm border border-gray-100 max-w-sm w-full">
            <div className="grid grid-cols-3 gap-4">
              {/* No filters */}
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-2 bg-black rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
                <p className="text-xs font-medium text-gray-700">No filters</p>
              </div>

              {/* Natural lighting */}
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-2 bg-black rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <p className="text-xs font-medium text-gray-700">Natural lighting</p>
              </div>

              {/* Front facing */}
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-2 bg-black rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <p className="text-xs font-medium text-gray-700">Front facing</p>
              </div>
            </div>
          </div>
        </div>

        {/* Debug Controls (Development only) */}
        {import.meta.env.DEV && (
          <div className="fixed top-4 left-4 z-50">
            <button
              onClick={testCameraAPI}
              className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
            >
              🧪 Test Camera API
            </button>
          </div>
        )}

        {/* Bottom Controls */}
        <div className="pb-20 pb-[env(safe-area-inset-bottom)]" style={{ paddingBottom: 'max(5rem, env(safe-area-inset-bottom))' }}>
          <div className="flex items-center justify-center gap-4 px-8">
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
              className="w-14 h-14 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>

            {/* Analyze Button - Only show when photo is captured */}
            {previewUrl && (
              <button
                onClick={handleAnalyze}
                disabled={isCompressing}
                className="bg-primary-600 text-white px-6 py-3 rounded-full font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isCompressing ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    <span>처리 중...</span>
                  </>
                ) : (
                  <>
                    <span>분석 시작</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            )}

            {/* Flip Camera Button */}
            <button
              onClick={switchCamera}
              disabled={!isCameraActive || cameraError !== null || previewUrl !== null}
              className="w-14 h-14 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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