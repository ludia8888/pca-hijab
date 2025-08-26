import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';
import { compressImage } from '@/utils/helpers';
import { useAppStore } from '@/store';
import { PageLayout } from '@/components/layout/PageLayout';
import { PersonalColorAPI } from '@/services/api/personalColor';
import { trackImageUpload, trackEvent, trackEngagement, trackError, trackDropOff } from '@/utils/analytics';
import { faceDetectionService } from '@/services/faceDetectionService';
import arrowBack from '@/assets/arrow_back.png';
import ellipse from '@/assets/Ellipse 7.svg';
import xIcon from '@/assets/X.png';
import checkIcon from '@/assets/check.png';

const UploadPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { sessionId, setUploadedImage, setLoading, setError, error } = useAppStore();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isValidatingFace, setIsValidatingFace] = useState(false);
  const [scaleFactor, setScaleFactor] = useState(1);
  
  // Camera states
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const streamRef = useRef<MediaStream | null>(null); // Add ref to avoid closure issues
  const [isCameraActive, setIsCameraActive] = useState(false);
  const isCameraActiveRef = useRef(false); // Add ref to avoid closure issues
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraInitialized, setCameraInitialized] = useState(false);
  
  // Face detection states
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceWellPositioned, setFaceWellPositioned] = useState(false);
  const faceDetectedRef = useRef(false); // Add ref to avoid closure issues in setTimeout/setInterval
  const isWellPositionedRef = useRef(false); // Track if face is well positioned in oval
  const [faceQuality, setFaceQuality] = useState(0);
  const [faceDistance, setFaceDistance] = useState<'too_far' | 'too_close' | 'good' | null>(null);
  const [facePosition, setFacePosition] = useState<'left' | 'right' | 'up' | 'down' | 'centered' | null>(null);
  const [captureCountdown, setCaptureCountdown] = useState<number | null>(null);
  const countdownValueRef = useRef<number | null>(null); // Track actual countdown value to prevent multiple timers
  const [isProcessingFace, setIsProcessingFace] = useState(false);
  const isProcessingFaceRef = useRef(false); // Add ref to avoid closure issues
  const faceDetectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const captureTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [aiInitializing, setAiInitializing] = useState(true); // Track AI initialization state
  let faceDetector: any = null; // Face detector for validating uploaded images

  // Calculate responsive scale factor
  useEffect(() => {
    const calculateScale = () => {
      const BASE_W = 402;
      const BASE_H = 874;
      
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      
      const scaleX = vw / BASE_W;
      const scaleY = vh / BASE_H;
      
      const scale = Math.min(scaleX, scaleY) * 0.95;
      
      setScaleFactor(scale);
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    
    return () => {
      window.removeEventListener('resize', calculateScale);
    };
  }, []);

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
    faceDetectionService.initialize()
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
    console.log('🚀 [Camera API] Current URL:', window.location.href);
    console.log('🚀 [Camera API] Session ID:', sessionId);
    console.log('🚀 [Camera API] Browser info:', {
      userAgent: navigator.userAgent,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      language: navigator.language,
      platform: navigator.platform,
      vendor: navigator.vendor
    });
    
    // Check document state
    console.log('📄 [Camera API] Document state:', {
      readyState: document.readyState,
      visibilityState: document.visibilityState,
      hasFocus: document.hasFocus()
    });
    
    // Check security context
    console.log('🔒 [Camera API] Security context:', {
      isSecureContext: window.isSecureContext,
      protocol: window.location.protocol,
      hostname: window.location.hostname,
      origin: window.location.origin
    });
    
    // Add global debug command for production
    if (window.location.hostname.includes('vercel.app') || window.location.hostname.includes('pca-hijab')) {
      console.log('💡 [DEBUG] To show camera debug panel, run this in console:');
      console.log('     document.getElementById("camera-debug-panel").style.display = "block"');
      
      // Make debug functions globally available
      (window as any).debugCamera = {
        showPanel: () => {
          const panel = document.getElementById('camera-debug-panel');
          if (panel) panel.style.display = 'block';
        },
        hidePanel: () => {
          const panel = document.getElementById('camera-debug-panel');
          if (panel) panel.style.display = 'none';
        },
        getState: () => ({
          sessionId,
          isCameraActive,
          cameraInitialized,
          cameraError,
          stream: !!stream,
          videoRef: !!videoRef.current,
          canvasRef: !!canvasRef.current
        })
      };
      console.log('💡 [DEBUG] Also available: window.debugCamera.showPanel(), window.debugCamera.getState()');
    }
    
    // Check device capabilities
    if (navigator.mediaDevices) {
      console.log('✅ [Camera API] MediaDevices API exists');
      navigator.mediaDevices.enumerateDevices()
        .then(devices => {
          const videoDevices = devices.filter(device => device.kind === 'videoinput');
          console.log('📹 [Camera API] Available video devices:', videoDevices.length);
          videoDevices.forEach((device, index) => {
            console.log(`📹 [Camera API] Video device ${index + 1}:`, {
              deviceId: device.deviceId,
              label: device.label || 'Unknown Camera',
              kind: device.kind,
              groupId: device.groupId
            });
          });
          
          if (videoDevices.length === 0) {
            console.error('❌ [Camera API] No video input devices found!');
          }
        })
        .catch(err => {
          console.error('🚨 [Camera API] Error enumerating devices:', err);
          console.error('🚨 [Camera API] Enumerate error details:', {
            name: (err as Error).name,
            message: (err as Error).message,
            stack: (err as Error).stack
          });
        });
    } else {
      console.error('❌ [Camera API] MediaDevices API not available!');
    }
    
    // Guard against initialization if no session
    if (!sessionId) {
      console.log('⏸️ [Camera API] Skipping camera init - no session, will redirect');
      return;
    }
    
    let isMounted = true; // Track if component is still mounted
    
    // Small delay to ensure DOM is ready
    const initTimeout = setTimeout(() => {
      // Wait for refs to be available before starting camera
      const startCameraWhenReady = () => {
        // Stop if component unmounted
        if (!isMounted) {
          console.log('🛑 [Camera API] Component unmounted, stopping initialization loop');
          return;
        }
        
        console.log('🔍 [Camera API] Checking refs availability...', {
          videoRef: !!videoRef.current,
          canvasRef: !!canvasRef.current,
          isMounted
        });
        
        if (videoRef.current && canvasRef.current) {
          console.log('✅ [Camera API] Refs are ready, starting camera');
          startCamera();
        } else if (isMounted) {
          console.log('⏳ [Camera API] Refs not ready yet, waiting...');
          setTimeout(startCameraWhenReady, 100);
        }
      };
      
      startCameraWhenReady();
    }, 100);
    
    // Cleanup camera on unmount
    return () => {
      console.log('🔚 [Camera API] Component unmounting, cleaning up...');
      isMounted = false; // Mark as unmounted to stop initialization loop
      clearTimeout(initTimeout); // Clear the initialization timeout
      stopCamera();
      stopFaceDetection();
    };
  }, [sessionId]); // Add sessionId dependency

  // Restart camera when facing mode changes
  useEffect(() => {
    console.log('🔄 [Camera API] Facing mode changed to:', facingMode);
    
    // Don't restart if no session
    if (!sessionId) {
      console.log('⏸️ [Camera API] Skipping camera restart - no session');
      return;
    }
    
    if (isCameraActive) {
      console.log('🔄 [Camera API] Restarting camera with new facing mode...');
      stopCamera();
      
      let isMounted = true; // Track if this effect is still active
      
      // Wait for refs to be available before restarting camera
      const restartCameraWhenReady = () => {
        // Stop if effect was cleaned up
        if (!isMounted) {
          console.log('🛑 [Camera API] Effect cleaned up, stopping restart loop');
          return;
        }
        
        console.log('🔍 [Camera API] Checking refs for restart...', {
          videoRef: !!videoRef.current,
          canvasRef: !!canvasRef.current,
          isMounted
        });
        
        if (videoRef.current && canvasRef.current) {
          console.log('✅ [Camera API] Refs ready for restart, starting camera');
          startCamera();
        } else if (isMounted) {
          console.log('⏳ [Camera API] Refs not ready for restart, waiting...');
          setTimeout(restartCameraWhenReady, 100);
        }
      };
      
      restartCameraWhenReady();
      
      // Cleanup function to stop restart loop if component unmounts
      return () => {
        isMounted = false;
      };
    } else {
      console.log('ℹ️ [Camera API] Camera not active, skipping restart');
    }
  }, [facingMode, sessionId]); // Add sessionId dependency

  const startCamera = async (): Promise<void> => {
    console.log('🎥 [Camera API] Starting camera initialization...');
    console.log('🎥 [Camera API] Requested facing mode:', facingMode);
    console.log('🌐 [Camera API] Environment details:', {
      url: window.location.href,
      hostname: window.location.hostname,
      protocol: window.location.protocol,
      isSecureContext: window.isSecureContext,
      isLocalhost: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
      isProduction: window.location.hostname.includes('vercel.app') || window.location.hostname.includes('pca-hijab')
    });
    
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
    console.log('🔍 [Camera API] Checking MediaDevices API:', {
      'navigator.mediaDevices': !!navigator.mediaDevices,
      'navigator.mediaDevices.getUserMedia': !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      'window.MediaStream': !!window.MediaStream,
      'window.RTCPeerConnection': !!window.RTCPeerConnection
    });
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('🚨 [Camera API] getUserMedia not supported in this browser');
      console.error('🚨 [Camera API] MediaDevices details:', {
        mediaDevices: navigator.mediaDevices,
        getUserMedia: navigator.mediaDevices?.getUserMedia
      });
      setCameraError('Camera not supported in this browser');
      setIsCameraActive(false);
      isCameraActiveRef.current = false;
      return;
    }
    
    console.log('✅ [Camera API] getUserMedia is available');
    
    // IMPORTANT: Skip permission pre-check - it may incorrectly report 'denied'
    // Instead, try getUserMedia directly and handle errors
    console.log('🎯 [Camera API] Attempting direct camera access without permission pre-check...');
    console.log('📝 [Camera API] Note: Browser permission API may incorrectly report denied status');
    
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
      console.log('🎬 [Camera API] Calling getUserMedia at:', new Date().toISOString());
      
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
          // Don't throw error for AbortError - it happens when component re-mounts quickly
          if (playError instanceof Error && playError.name === 'AbortError') {
            console.log('⚠️ [Camera API] Play was interrupted (likely component re-mount), ignoring...');
            // Still set camera as active since stream is valid
            setStream(mediaStream);
            streamRef.current = mediaStream;
            setIsCameraActive(true);
            isCameraActiveRef.current = true;
            setCameraInitialized(true);
            setCameraError(null);
            return; // Exit without setting error
          }
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
      setCameraInitialized(true); // Mark camera as initialized
      setCameraError(null); // Clear any previous errors
      
      console.log('🎉 [Camera API] Camera initialization completed successfully');
      
      // Delay face detection by 2 seconds to show gray overlay initially
      console.log('⏱️ [Camera API] Waiting 2 seconds before starting face detection...');
      setTimeout(() => {
        startFaceDetection();
        console.log('👤 [Camera API] Face detection started after 2 second delay');
      }, 2000);
      
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
      console.error('🚨 [Camera API] Error occurred at:', new Date().toISOString());
      console.error('🚨 [Camera API] Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      
      // Log detailed error information
      if (error instanceof Error) {
        console.error('🚨 [Camera API] Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack,
          toString: error.toString()
        });
        
        // Log specific error types
        if (error.name === 'NotAllowedError') {
          console.error('❌ [Camera API] NotAllowedError - Permission denied by user or system');
          console.error('❌ [Camera API] Possible causes:', [
            '1. User explicitly denied permission',
            '2. Browser security policy blocks camera',
            '3. Missing HTTPS in production',
            '4. Missing Permissions-Policy headers',
            '5. Browser settings block camera for this site'
          ]);
          
          // Now check permissions AFTER the error to get accurate status
          if (navigator.permissions && navigator.permissions.query) {
            try {
              const permStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
              console.log('📷 [Camera API] Permission status after error:', permStatus.state);
              
              if (permStatus.state === 'prompt') {
                console.log('💡 [Camera API] Permission is actually "prompt" - user may have dismissed dialog');
                console.log('💡 [Camera API] User needs to click camera icon in address bar');
              } else if (permStatus.state === 'denied') {
                console.log('⛔ [Camera API] Permission is truly denied in browser settings');
                console.log('💡 [Camera API] Go to chrome://settings/content/camera to check site settings');
              }
            } catch (e) {
              console.log('⚠️ [Camera API] Could not check permission status after error');
            }
          }
        } else if (error.name === 'NotFoundError') {
          console.error('❌ [Camera API] NotFoundError - No camera device found');
        } else if (error.name === 'NotReadableError') {
          console.error('❌ [Camera API] NotReadableError - Camera is being used by another application');
        } else if (error.name === 'OverconstrainedError') {
          console.error('❌ [Camera API] OverconstrainedError - Constraints cannot be satisfied');
        } else if (error.name === 'SecurityError') {
          console.error('❌ [Camera API] SecurityError - Page not served over HTTPS or other security issue');
        } else if (error.name === 'TypeError') {
          console.error('❌ [Camera API] TypeError - Invalid constraints or API usage');
        }
        
        let errorMessage = 'Camera access denied or not available';
        
        // Detect browser for specific instructions
        const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
        const isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor) && !/Chrome/.test(navigator.userAgent);
        const isFirefox = /Firefox/.test(navigator.userAgent);
        
        console.log('🌐 [Camera API] Browser detection:', {
          isChrome,
          isSafari,
          isFirefox,
          userAgent: navigator.userAgent,
          vendor: navigator.vendor
        });
        
        // Specific error types with improved messages
        switch (error.name) {
          case 'NotAllowedError':
          case 'PermissionDeniedError':
            console.error('🚨 [Camera API] User denied camera permission');
            if (isChrome) {
              errorMessage = 'Camera access was blocked. To fix: Click the camera icon 📷 in the address bar and select "Allow".';
            } else if (isSafari) {
              errorMessage = 'Camera access was blocked. To fix: Go to Safari > Settings > Websites > Camera and allow access for this site.';
            } else if (isFirefox) {
              errorMessage = 'Camera access was blocked. To fix: Click the lock icon 🔒 in the address bar, then "Clear permissions and reload".';
            } else {
              errorMessage = 'Camera access was blocked. Please allow camera in your browser settings (click the lock icon in the URL bar).';
            }
            break;
          case 'NotFoundError':
          case 'DevicesNotFoundError':
            console.error('🚨 [Camera API] No camera device found');
            errorMessage = 'No camera found. Please check if your camera is connected and enabled.';
            break;
          case 'NotReadableError':
          case 'TrackStartError':
            console.error('🚨 [Camera API] Camera is already in use by another application');
            errorMessage = 'Camera is being used by another app (Zoom, Teams, etc.). Please close other apps and try again.';
            break;
          case 'OverconstrainedError':
          case 'ConstraintNotSatisfiedError':
            console.error('🚨 [Camera API] Camera constraints cannot be satisfied');
            errorMessage = 'Camera settings not supported. Please try again.';
            break;
          case 'SecurityError':
            console.error('🚨 [Camera API] Security error - HTTPS or permissions issue');
            errorMessage = 'Camera blocked for security reasons. Please check browser permissions or use HTTPS.';
            break;
          case 'AbortError':
            console.error('🚨 [Camera API] Camera initialization was aborted');
            errorMessage = 'Camera startup was interrupted. Please try again.';
            break;
          default:
            console.error('🚨 [Camera API] Unknown camera error type:', error.name);
        }
        
        setCameraError(errorMessage);
      } else {
        setCameraError('Camera access denied or not available');
      }
      
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
    
    faceDetectionIntervalRef.current = setInterval(async () => {
      
      if (!videoRef.current || !isCameraActiveRef.current) {
        console.log(`⏭️ [FACE DETECTION] Skipping detection - no video:`, {
          hasVideo: !!videoRef.current,
          isCameraActive: isCameraActiveRef.current
        });
        // If we can't detect, assume face is not in position
        isWellPositionedRef.current = false;
        return;
      }
      
      if (isProcessingFaceRef.current) {
        console.log(`⏭️ [FACE DETECTION] Still processing previous detection`);
        // Don't update position during processing - maintain last known state
        return;
      }
      
      console.log(`🔍 [FACE DETECTION] Running detection`);
      setIsProcessingFace(true);
      isProcessingFaceRef.current = true; // Update ref as well
      
      try {
        console.log(`📷 [FACE DETECTION] Calling detectFaceInVideo...`);
        const face = await faceDetectionService.detectFaceInVideo(videoRef.current);
        console.log(`📊 [FACE DETECTION] Detection result:`, face);
        
        if (face) {
          // Simplified logic for fallback mode - always trigger after 2 seconds
          const isWellPositioned = faceDetectionService.isFaceWellPositioned(
            face,
            videoRef.current.videoWidth,
            videoRef.current.videoHeight
          );
          
          const quality = faceDetectionService.getFaceQualityScore(
            face,
            videoRef.current.videoWidth,
            videoRef.current.videoHeight
          );
          
          // Calculate face area to determine distance
          const faceAreaRatio = (face.width * face.height) / (videoRef.current.videoWidth * videoRef.current.videoHeight);
          let distance: 'too_far' | 'too_close' | 'good' = 'good';
          if (faceAreaRatio < 0.07) {
            distance = 'too_far';
          } else if (faceAreaRatio > 0.10) {
            distance = 'too_close';
          }
          
          // Calculate face position relative to center
          const faceCenterX = face.x + face.width / 2;
          const faceCenterY = face.y + face.height / 2;
          const videoCenterX = videoRef.current.videoWidth / 2;
          const videoCenterY = videoRef.current.videoHeight / 2;
          
          let position: 'left' | 'right' | 'up' | 'down' | 'centered' = 'centered';
          const xOffset = faceCenterX - videoCenterX;
          const yOffset = faceCenterY - videoCenterY;
          const threshold = videoRef.current.videoWidth * 0.15; // 15% threshold
          
          if (Math.abs(xOffset) < threshold && Math.abs(yOffset) < threshold) {
            position = 'centered';
          } else if (Math.abs(xOffset) > Math.abs(yOffset)) {
            position = xOffset < 0 ? 'left' : 'right';
          } else {
            position = yOffset < 0 ? 'up' : 'down';
          }
          
          console.log(`✨ [FACE DETECTION] Face found:`, {
            isWellPositioned,
            quality,
            distance,
            position,
            faceAreaRatio,
            face
          });
          
          // Update face detection states
          setFaceDetected(true); // Face is detected
          setFaceWellPositioned(isWellPositioned); // Face position status
          setFaceDistance(distance);
          setFacePosition(position);
          faceDetectedRef.current = true; // Update ref as well
          isWellPositionedRef.current = isWellPositioned; // Track position status
          setFaceQuality(isWellPositioned ? quality : 0);
          
          if (isWellPositioned) {
            // During countdown, check if face is still well positioned - use ref for immediate value
            if (countdownValueRef.current !== null || captureTimeoutRef.current !== null) {
              console.log(`📸 [FACE DETECTION] Face well positioned during countdown: ${countdownValueRef.current}s`);
              // Face is still well positioned, countdown continues
            } else {
              // Face entered oval - start countdown immediately
              console.log('✅ [FACE DETECTION] Face entered oval - starting countdown immediately...');
              startCaptureCountdown();
            }
          } else {
            // Face detected but not well positioned
            console.log('⚠️ [FACE DETECTION] Face detected but not well positioned within the oval guide');
            
            // Cancel countdown if face is not well positioned during countdown - check ref for immediate value
            if (countdownValueRef.current !== null || captureTimeoutRef.current !== null) {
              console.log('🚫 [FACE DETECTION] Canceling countdown - face not well positioned!');
              console.log('   Countdown ref value:', countdownValueRef.current);
              console.log('   Timer ref status:', captureTimeoutRef.current ? 'active' : 'null');
              cancelCaptureCountdown();
            }
          }
        } else {
          console.log(`❌ [FACE DETECTION] No face detected`);
          setFaceDetected(false);
          setFaceWellPositioned(false);
          setFaceDistance(null);
          setFacePosition(null);
          faceDetectedRef.current = false; // Update ref as well
          isWellPositionedRef.current = false; // No face means not well positioned
          setFaceQuality(0);
          
          // Cancel countdown if face is lost during countdown - check ref for immediate value
          if (countdownValueRef.current !== null || captureTimeoutRef.current !== null) {
            console.log('🚫 [FACE DETECTION] Canceling countdown - face lost during countdown!');
            console.log('   Countdown ref value:', countdownValueRef.current);
            console.log('   Timer ref status:', captureTimeoutRef.current ? 'active' : 'null');
            cancelCaptureCountdown();
            // Just cancel countdown, visual feedback (border color) is enough
          }
        }
      } catch (error) {
        console.error(`❌ [FACE DETECTION] Error in detection:`, error);
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
    
    // First, set camera inactive to prevent new detection cycles
    isCameraActiveRef.current = false;
    
    if (faceDetectionIntervalRef.current) {
      clearInterval(faceDetectionIntervalRef.current);
      faceDetectionIntervalRef.current = null;
      console.log('✅ [FACE DETECTION] Face detection interval cleared');
    } else {
      console.log('ℹ️ [FACE DETECTION] No active interval to stop');
    }
    
    // Cancel any ongoing countdown
    cancelCaptureCountdown();
    
    setFaceDetected(false);
    setFaceWellPositioned(false);
    setFaceDistance(null);
    setFacePosition(null);
    faceDetectedRef.current = false; // Update ref as well
    isWellPositionedRef.current = false; // Reset position status
    setFaceQuality(0);
  };
  
  const startCaptureCountdown = (): void => {
    // Prevent starting multiple countdowns - check ref for immediate value
    if (countdownValueRef.current !== null || captureTimeoutRef.current !== null) {
      console.log('⏰ [FACE DETECTION] Countdown already in progress, skipping...');
      console.log('   Current countdown ref value:', countdownValueRef.current);
      console.log('   Current countdown state:', captureCountdown);
      console.log('   Timer ref status:', captureTimeoutRef.current ? 'active' : 'null');
      return;
    }
    
    // Check face position immediately before starting
    if (!isWellPositionedRef.current) {
      console.log('⚠️ [FACE DETECTION] Face not in position, aborting countdown start');
      return;
    }
    
    console.log('🎬 [FACE DETECTION] Starting NEW countdown sequence...');
    console.log('   Face is well positioned: ', isWellPositionedRef.current);
    
    let countdown = 3;
    setCaptureCountdown(countdown);
    countdownValueRef.current = countdown; // Update ref immediately
    
    // Store interval ID immediately to prevent race conditions
    const countdownInterval = setInterval(async () => {
      // Decrement first (so 3→2→1→capture, not 3→2→1→0→capture)
      countdown--;
      countdownValueRef.current = countdown;
      
      // Double-check face position with fresh detection
      let faceStillInPosition = false;
      if (videoRef.current && !isProcessingFaceRef.current) {
        try {
          const freshFace = await faceDetectionService.detectFaceInVideo(videoRef.current);
          if (freshFace) {
            faceStillInPosition = faceDetectionService.isFaceWellPositioned(
              freshFace,
              videoRef.current.videoWidth,
              videoRef.current.videoHeight
            );
          }
          console.log(`🔍 [COUNTDOWN] Fresh face check: ${faceStillInPosition ? 'IN' : 'OUT'} of position`);
        } catch (err) {
          console.log('⚠️ [COUNTDOWN] Fresh detection failed, using ref value');
          faceStillInPosition = isWellPositionedRef.current;
        }
      } else {
        faceStillInPosition = isWellPositionedRef.current;
      }
      
      // Check if face is still in position
      if (!faceStillInPosition) {
        console.log(`🚫 [COUNTDOWN] Face lost at ${countdown}s - cancelling!`);
        clearInterval(countdownInterval);
        setCaptureCountdown(null);
        countdownValueRef.current = null;
        isWellPositionedRef.current = false; // Update ref
        // Don't set captureTimeoutRef to null here - let cancelCaptureCountdown handle it
        if (captureTimeoutRef.current === countdownInterval) {
          captureTimeoutRef.current = null;
        }
        return;
      }
      
      if (countdown > 0) {
        setCaptureCountdown(countdown);
        console.log(`⏰ [COUNTDOWN] ${countdown}s remaining (face in position)`);
      } else {
        // countdown === 0, time to capture
        clearInterval(countdownInterval);
        setCaptureCountdown(null);
        countdownValueRef.current = null;
        captureTimeoutRef.current = null;
        
        // Final check before capture with fresh detection
        let canCapture = false;
        if (videoRef.current && !isProcessingFaceRef.current) {
          try {
            const finalFace = await faceDetectionService.detectFaceInVideo(videoRef.current);
            if (finalFace) {
              canCapture = faceDetectionService.isFaceWellPositioned(
                finalFace,
                videoRef.current.videoWidth,
                videoRef.current.videoHeight
              );
            }
            console.log(`🎯 [COUNTDOWN] Final face check: ${canCapture ? 'READY' : 'NOT READY'}`);
          } catch (err) {
            console.log('⚠️ [COUNTDOWN] Final detection failed');
            canCapture = false;
          }
        }
        
        if (canCapture) {
          console.log('📸 Capturing photo NOW - face confirmed in position');
          capturePhoto();
          
          // Track auto capture
          trackEvent('auto_capture', {
            face_quality: faceQuality,
            page: 'upload'
          });
        } else {
          console.log('⚠️ [COUNTDOWN] Capture aborted - face lost at last moment');
        }
      }
    }, 1000);
    
    captureTimeoutRef.current = countdownInterval;
    console.log('📸 [FACE DETECTION] Countdown started: 3 seconds...');
  };
  
  const cancelCaptureCountdown = (): void => {
    console.log('🛑 [FACE DETECTION] Cancelling countdown...');
    console.log('   Current countdown ref value:', countdownValueRef.current);
    console.log('   Current countdown state:', captureCountdown);
    console.log('   Timer ref status:', captureTimeoutRef.current ? 'active' : 'null');
    
    if (captureTimeoutRef.current) {
      clearInterval(captureTimeoutRef.current);
      captureTimeoutRef.current = null;
      console.log('   ✅ Timer cleared');
    }
    setCaptureCountdown(null);
    countdownValueRef.current = null; // Clear countdown ref
    console.log('   ✅ Countdown state and ref reset to null');
  };

  const stopCamera = (): void => {
    console.log('🛑 [Camera API] Stopping camera...');
    
    // First set camera inactive to prevent any new operations
    setIsCameraActive(false);
    isCameraActiveRef.current = false;
    
    // Then stop face detection (this also sets isCameraActiveRef to false)
    stopFaceDetection();
    
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
    
    // Create flash effect
    const flashOverlay = document.createElement('div');
    flashOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: white;
      z-index: 9999;
      pointer-events: none;
      animation: cameraFlash 0.3s ease-out;
    `;
    
    // Add animation keyframes if not already present
    if (!document.querySelector('#camera-flash-animation')) {
      const style = document.createElement('style');
      style.id = 'camera-flash-animation';
      style.textContent = `
        @keyframes cameraFlash {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
    
    // Trigger flash effect
    document.body.appendChild(flashOverlay);
    setTimeout(() => flashOverlay.remove(), 300);

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
      
      // Clear timer to prevent immediate re-capture
      captureTimeoutRef.current = null;
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
            setError('Oops! I can\'t find your face. Let\'s try another photo with your face clearly visible!');
            setSelectedFile(null);
            setPreviewUrl(null);
            trackImageUpload(false, file.size, file.type, 'no_face_detected');
            trackError('no_face_in_upload', 'No face detected in uploaded image', 'upload_page');
            return;
          }
        } catch (error) {
          console.warn('⚠️ [Face Validation] FaceDetector failed, using faceDetectionService:', error);
          // Fallback to our faceDetectionService
          try {
            const detectedFace = await faceDetectionService.detectFaceInImage(img);
            faceDetected = detectedFace !== null;
            
            if (!faceDetected) {
              console.log('❌ [Face Validation] No face detected by fallback service');
              setError('Oops! I can\'t find your face. Let\'s try another photo with your face clearly visible!');
              setSelectedFile(null);
              setPreviewUrl(null);
              trackImageUpload(false, file.size, file.type, 'no_face_detected');
              return;
            }
          } catch (fallbackError) {
            console.error('❌ [Face Validation] Fallback detection also failed:', fallbackError);
            setError('Hmm, something went wrong. Let\'s try that again!');
            setSelectedFile(null);
            setPreviewUrl(null);
            return;
          }
        }
      } else {
        // Use our faceDetectionService as fallback
        console.log('🔄 [Face Validation] Using faceDetectionService for validation...');
        try {
          const detectedFace = await faceDetectionService.detectFaceInImage(img);
          faceDetected = detectedFace !== null;
          
          if (!faceDetected) {
            console.log('❌ [Face Validation] No face detected by faceDetectionService');
            setError('Oops! I can\'t find your face. Let\'s try another photo with your face clearly visible!');
            setSelectedFile(null);
            setPreviewUrl(null);
            trackImageUpload(false, file.size, file.type, 'no_face_detected');
            trackError('no_face_in_upload', 'No face detected in uploaded image', 'upload_page');
            return;
          } else {
            console.log('✅ [Face Validation] Face detected by faceDetectionService');
          }
        } catch (error) {
          console.error('❌ [Face Validation] faceDetectionService failed:', error);
          // If detection fails, reject the image for safety
          setError('Face detection failed. Please try again with a clearer photo.');
          setSelectedFile(null);
          setPreviewUrl(null);
          return;
        }
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

  // Disable body scroll on mount - more comprehensive like DontWorry page
  useEffect(() => {
    // Prevent scrolling on this page
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    document.body.style.touchAction = 'none';
    
    // Prevent pull-to-refresh on mobile
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.position = 'fixed';
    document.documentElement.style.width = '100%';
    document.documentElement.style.height = '100%';
    
    return () => {
      // Cleanup on unmount
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.body.style.touchAction = '';
      
      document.documentElement.style.overflow = '';
      document.documentElement.style.position = '';
      document.documentElement.style.width = '';
      document.documentElement.style.height = '';
    };
  }, []);

  // Prevent touch move events for scroll
  useEffect(() => {
    const preventScroll = (e: TouchEvent) => {
      e.preventDefault();
    };

    document.addEventListener('touchmove', preventScroll, { passive: false });
    
    return () => {
      document.removeEventListener('touchmove', preventScroll);
    };
  }, []);

  return (
    <PageLayout>
      <div 
        className="fixed inset-0 w-screen h-screen overflow-hidden flex flex-col"
        style={{ 
          backgroundColor: '#FFF',
          width: '100vw',
          height: '100vh',
          height: '100dvh',
          touchAction: 'none',
          overscrollBehavior: 'none',
          WebkitOverflowScrolling: 'touch',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}>
        {/* Header - at the very top */}
        <div
          style={{
            display: 'flex',
            width: `${402 * scaleFactor}px`,
            height: `${88 * scaleFactor}px`,
            padding: `${16 * scaleFactor}px ${4 * scaleFactor}px`,
            justifyContent: 'center',
            alignItems: 'flex-end',
            gap: `${4 * scaleFactor}px`,
            background: 'var(--black_white-color-white, #FFF)',
            margin: '0 auto 0 auto',
            marginTop: 0,
          }}
        >
          {/* Container with arrow positioned absolutely and title centered */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {/* Arrow back icon - positioned absolutely */}
            <img 
              src={arrowBack} 
              alt="Back"
              style={{
                position: 'absolute',
                left: '0',
                width: `${40 * scaleFactor}px`,
                height: `${40 * scaleFactor}px`,
                cursor: 'pointer',
              }}
              onClick={() => navigate(ROUTES.DONTWORRY)}
            />
            
            {/* Upload Your Photo title - centered */}
            <h1 
              style={{
                color: 'var(--black_white-color-black, #000)',
                textAlign: 'center',
                fontFamily: '"Plus Jakarta Sans"',
                fontSize: `${24 * scaleFactor}px`,
                fontStyle: 'normal',
                fontWeight: 800,
                lineHeight: '140%', /* 33.6px */
                margin: 0,
              }}
            >
              Upload Your Photo
            </h1>
          </div>
        </div>

        {/* Main Photo Area */}
        <div 
          style={{
            width: `${348.345 * scaleFactor}px`,
            height: `${667 * scaleFactor}px`,
            flexShrink: 0,
            borderRadius: `${10 * scaleFactor}px`,
            margin: `${20 * scaleFactor}px auto`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Photo Preview/Camera Area */}
          <div 
            className="relative"
            style={{
              width: `${348.345 * scaleFactor}px`,
              height: `${667 * scaleFactor}px`,
            }}
          >
            {/* Always render video and canvas elements outside conditional rendering for refs */}
            <video
              ref={videoRef}
              className={`absolute inset-0 w-full h-full object-cover ${
                !previewUrl && isCameraActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
              } ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              style={{
                borderRadius: `${10 * scaleFactor}px`,
                zIndex: 1,
              }}
              autoPlay
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="absolute opacity-0 pointer-events-none" />
            
            {/* Face detection guide overlay - Always show when no preview */}
            {!previewUrl && (
              <>
                {/* Masking overlay with elliptical cutout using SVG */}
                <svg 
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    width: `${348.345 * scaleFactor}px`,
                    height: `${667 * scaleFactor}px`,
                    zIndex: 10,
                  }}
                  viewBox={`0 0 348.345 667`}
                  preserveAspectRatio="none"
                >
                  <defs>
                    <mask id="ellipse-mask">
                      {/* White background = visible */}
                      <rect x="0" y="0" width="348.345" height="667" fill="white" />
                      {/* Black ellipse = transparent (cutout) */}
                      {/* Position: exact center - container height 667, center Y = 667/2 = 333.5 */}
                      <ellipse 
                        cx="174.1725" 
                        cy="333.5" 
                        rx="149.5" 
                        ry="199.5" 
                        fill="black" 
                      />
                    </mask>
                  </defs>
                  
                  {/* Apply mask to colored rectangle */}
                  <rect 
                    x="0" 
                    y="0" 
                    width="348.345" 
                    height="667" 
                    mask="url(#ellipse-mask)"
                    fill={
                      !faceDetected 
                        ? 'rgba(176, 176, 175, 0.6)' // No face detected - gray
                        : (captureCountdown !== null || faceWellPositioned)
                          ? 'rgba(209, 227, 219, 0.6)' // Ready to capture - green
                          : 'rgba(230, 176, 175, 0.6)' // Face not in position - red
                    }
                    rx={10}
                  />
                </svg>
                
                {/* Ellipse guide with dynamic color */}
                <div 
                  className="absolute pointer-events-none" 
                  style={{ 
                    zIndex: 11,
                    top: `${134 * scaleFactor}px`,
                    left: '50%',
                    transform: 'translateX(-50%)',
                  }}
                >
                  <div
                    style={{
                      width: `${299 * scaleFactor}px`,
                      height: `${399 * scaleFactor}px`,
                      borderRadius: '50%',
                      border: `${5 * scaleFactor}px dashed`,
                      borderColor: captureCountdown !== null 
                        ? '#97EFD0' // Countdown
                        : (faceDetected && !faceWellPositioned)
                          ? '#FF0000' // Face detected but not in position
                          : '#FFFFFF', // Default white
                      boxSizing: 'border-box',
                    }}
                    className={`${
                      !faceDetected ? 'animate-pulse' : ''
                    }`}
                  />
                </div>
              </>
            )}
            
            {/* Auto capture countdown - centered semi-transparent number */}
            {!previewUrl && isCameraActive && captureCountdown !== null && (
              <div 
                className="absolute inset-0 flex items-center justify-center pointer-events-none" 
                style={{ zIndex: 20 }}
              >
                <div 
                  className="text-white animate-pulse"
                  style={{
                    fontFamily: '"Plus Jakarta Sans", sans-serif',
                    fontSize: `${120 * scaleFactor}px`,
                    fontWeight: 800,
                    textShadow: '0 0 20px rgba(0,0,0,0.5), 0 0 40px rgba(0,0,0,0.3)',
                    opacity: 0.9,
                  }}
                >
                  {captureCountdown}
                </div>
              </div>
            )}

            {/* Bottom instruction container */}
            {!previewUrl && isCameraActive && (
              <div 
                className="absolute pointer-events-none"
                style={{
                  top: `${558 * scaleFactor}px`,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 15,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: `${266 * scaleFactor}px`,
                    minHeight: `${44 * scaleFactor}px`,
                    padding: `${15 * scaleFactor}px`,
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: `${10 * scaleFactor}px`,
                    borderRadius: `${10 * scaleFactor}px`,
                    border: (faceDetected && !faceWellPositioned && captureCountdown === null) 
                      ? `${2 * scaleFactor}px solid var(--Color-9, #F00)` 
                      : 'none',
                    background: faceWellPositioned ? '#97EFD0' : 'var(--Color-7, #FFF)',
                    boxSizing: 'border-box',
                    overflow: 'hidden',
                  }}
                >
                  {/* X icon - only show when red border is visible */}
                  {faceDetected && !faceWellPositioned && captureCountdown === null && (
                    <img 
                      src={xIcon}
                      alt=""
                      style={{
                        width: `${24 * scaleFactor}px`,
                        height: `${24 * scaleFactor}px`,
                        flexShrink: 0,
                      }}
                    />
                  )}
                  {/* Check icon - only show when face is well positioned */}
                  {faceWellPositioned && (
                    <img 
                      src={checkIcon}
                      alt=""
                      style={{
                        width: `${24 * scaleFactor}px`,
                        height: `${24 * scaleFactor}px`,
                        flexShrink: 0,
                      }}
                    />
                  )}
                  {faceWellPositioned ? (
                    <span 
                      style={{
                        color: 'var(--Color-5, #000)',
                        textAlign: 'center',
                        fontFamily: 'Pretendard',
                        fontSize: `${15 * scaleFactor}px`,
                        fontStyle: 'normal',
                        fontWeight: 700,
                        lineHeight: '140%', /* 21px */
                        margin: 0,
                      }}
                    >
                      Perfect! You look amazing!
                      <br />
                      Capturing in 3 seconds...
                    </span>
                  ) : (
                    <span 
                      style={{
                        color: '#000',
                        textAlign: 'center',
                        fontFamily: 'Pretendard',
                        fontSize: `${15 * scaleFactor}px`,
                        fontWeight: 700,
                        lineHeight: '140%', /* 21px */
                        wordBreak: 'keep-all',
                        whiteSpace: 'pre-line',
                        maxWidth: '100%',
                        margin: 0,
                      }}
                    >
                      {!faceDetected 
                        ? (
                          <>
                            Say cheese!
                          </>
                        )
                        : (
                          faceDistance === 'too_far' 
                            ? (
                              <>
                                Come a bit closer,
                                <br />
                                I can barely see you!
                              </>
                            )
                            : faceDistance === 'too_close'
                              ? (
                                <>
                                  Whoa, too close!
                                  <br />
                                  Back up a little
                                </>
                              )
                              : facePosition === 'left'
                                ? (
                                  <>
                                    Scoot a bit
                                    <br />
                                    to your left
                                  </>
                                )
                                : facePosition === 'right'
                                  ? (
                                    <>
                                      Scoot a bit
                                      <br />
                                      to your right
                                    </>
                                  )
                                  : facePosition === 'up'
                                    ? (
                                      <>
                                        Move down
                                        <br />
                                        just a touch
                                      </>
                                    )
                                    : facePosition === 'down'
                                      ? (
                                        <>
                                          Lift your chin
                                          <br />
                                          up a bit
                                        </>
                                      )
                                      : (
                                        <>
                                          Center yourself
                                          <br />
                                          in the frame
                                        </>
                                      )
                        )}
                    </span>
                  )}
                </div>
              </div>
            )}
            {previewUrl ? (
              // Show captured photo - NO guides or overlays after capture
              <div 
                className="relative w-full h-full overflow-hidden bg-white"
                style={{
                  borderRadius: `${10 * scaleFactor}px`,
                }}
              >
                <img 
                  src={previewUrl} 
                  alt="Captured photo" 
                  className="w-full h-full object-cover"
                  style={{
                    borderRadius: `${10 * scaleFactor}px`,
                  }}
                />
                {/* Face validation loading overlay */}
                {isValidatingFace && (
                  <div 
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      backdropFilter: 'blur(4px)',
                      borderRadius: `${10 * scaleFactor}px`,
                      zIndex: 40,
                    }}
                  >
                    <div 
                      style={{
                        backgroundColor: 'white',
                        borderRadius: `${12 * scaleFactor}px`,
                        padding: `${16 * scaleFactor}px`,
                      }}
                    >
                      <div 
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: `${12 * scaleFactor}px`,
                        }}
                      >
                        <div 
                          className="animate-spin"
                          style={{
                            width: `${32 * scaleFactor}px`,
                            height: `${32 * scaleFactor}px`,
                            border: `${2 * scaleFactor}px solid #9333EA`,
                            borderTopColor: 'transparent',
                            borderRadius: '50%',
                          }}
                        ></div>
                        <div>
                          <p 
                            style={{
                              fontSize: `${14 * scaleFactor}px`,
                              fontWeight: 600,
                              color: '#1F2937',
                              margin: 0,
                            }}
                          >
                            Looking for your face
                          </p>
                          <p 
                            style={{
                              fontSize: `${12 * scaleFactor}px`,
                              color: '#6B7280',
                              margin: 0,
                            }}
                          >
                            Just a moment...
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Show live camera feed
              <div 
                className="relative w-full h-full overflow-hidden"
                style={{
                  borderRadius: `${10 * scaleFactor}px`,
                  backgroundColor: 'transparent',
                }}
              >
                
                {/* Show error only if there's an actual camera error */}
                {cameraError && (
                  // Camera error state
                  <div 
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ 
                      backgroundColor: '#1F2937',
                      zIndex: 10 
                    }}
                  >
                    <div 
                      style={{
                        textAlign: 'center',
                        color: 'white',
                        padding: `0 ${24 * scaleFactor}px`,
                      }}
                    >
                      <svg 
                        style={{
                          width: `${48 * scaleFactor}px`,
                          height: `${48 * scaleFactor}px`,
                          margin: `0 auto ${16 * scaleFactor}px`,
                          color: '#9CA3AF',
                        }}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                      </svg>
                      <h3 
                        style={{
                          fontSize: `${18 * scaleFactor}px`,
                          fontWeight: 600,
                          marginBottom: `${8 * scaleFactor}px`,
                        }}
                      >
                        Camera Not Available
                      </h3>
                      <p 
                        style={{
                          fontSize: `${14 * scaleFactor}px`,
                          color: '#D1D5DB',
                          marginBottom: `${16 * scaleFactor}px`,
                        }}
                      >
                        {cameraError.includes('denied') 
                          ? "Camera access was blocked. Please allow camera in your browser settings (click the lock icon in the URL bar)."
                          : cameraError}
                      </p>
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
                        style={{
                          backgroundColor: 'white',
                          color: '#1F2937',
                          padding: `${8 * scaleFactor}px ${16 * scaleFactor}px`,
                          borderRadius: `${8 * scaleFactor}px`,
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: `${14 * scaleFactor}px`,
                          fontWeight: 500,
                          transition: 'background-color 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#F3F4F6';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'white';
                        }}
                      >
                        Upload Photo Instead
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Show loading only when camera is not initialized and no error */}
                {!cameraInitialized && !cameraError && !previewUrl && (
                  // Loading camera state
                  <div 
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ 
                      backgroundColor: '#1F2937',
                      zIndex: 10 
                    }}
                  >
                    <div 
                      style={{
                        textAlign: 'center',
                        color: 'white',
                      }}
                    >
                      <svg 
                        className="animate-spin"
                        style={{
                          width: `${32 * scaleFactor}px`,
                          height: `${32 * scaleFactor}px`,
                          margin: `0 auto ${16 * scaleFactor}px`,
                        }}
                        fill="none" 
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      <p 
                        style={{
                          fontSize: `${14 * scaleFactor}px`,
                          margin: 0,
                        }}
                      >
                        Starting camera...
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div 
              style={{
                marginBottom: `${16 * scaleFactor}px`,
                padding: `${12 * scaleFactor}px`,
                backgroundColor: '#FEF2F2',
                border: `${1 * scaleFactor}px solid #FECACA`,
                borderRadius: `${12 * scaleFactor}px`,
                maxWidth: `${320 * scaleFactor}px`,
                width: '90%',
              }}
            >
              <p 
                style={{
                  color: '#DC2626',
                  fontSize: `${14 * scaleFactor}px`,
                  textAlign: 'center',
                  margin: 0,
                }}
              >
                {error}
              </p>
            </div>
          )}

        </div>

        {/* Debug Controls (Development only) */}
        {import.meta.env.DEV && (
          <div 
            style={{
              position: 'fixed',
              top: `${16 * scaleFactor}px`,
              left: `${16 * scaleFactor}px`,
              zIndex: 50,
            }}
          >
            <button
              onClick={testCameraAPI}
              style={{
                backgroundColor: '#2563EB',
                color: 'white',
                padding: `${4 * scaleFactor}px ${12 * scaleFactor}px`,
                borderRadius: `${4 * scaleFactor}px`,
                fontSize: `${12 * scaleFactor}px`,
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1D4ED8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#2563EB';
              }}
            >
              🧪 Test Camera API
            </button>
          </div>
        )}

        {/* Bottom Controls */}
        <div 
          style={{ 
            paddingBottom: `max(${80 * scaleFactor}px, env(safe-area-inset-bottom))` 
          }}
        >
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: `${16 * scaleFactor}px`,
              padding: `0 ${32 * scaleFactor}px`,
            }}
          >
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
              style={{
                width: `${48 * scaleFactor}px`,
                height: `${48 * scaleFactor}px`,
                flexShrink: 0,
                borderRadius: '50%',
                backgroundColor: '#606060',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                opacity: isCompressing ? 0.5 : 1,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!isCompressing) {
                  e.currentTarget.style.backgroundColor = '#505050';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#606060';
              }}
            >
              <svg style={{ width: `${24 * scaleFactor}px`, height: `${24 * scaleFactor}px` }} fill="none" stroke="white" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>

            {/* Analyze Button - Always visible, disabled when no photo */}
            <button 
              onClick={previewUrl ? handleAnalyze : undefined}
              disabled={!previewUrl || isCompressing}
              style={{ 
                display: 'flex',
                width: `${198 * scaleFactor}px`,
                height: `${57 * scaleFactor}px`,
                padding: `${10 * scaleFactor}px ${16 * scaleFactor}px`,
                justifyContent: 'center',
                alignItems: 'center',
                gap: `${10 * scaleFactor}px`,
                flexShrink: 0,
                borderRadius: `${10 * scaleFactor}px`,
                background: !previewUrl ? '#E0E0E0' : (isCompressing ? '#E0E0E0' : '#FFF3A1'),
                border: 'none',
                transition: 'all 0.2s ease',
                opacity: !previewUrl ? 0.5 : (isCompressing ? 0.7 : 1),
                cursor: !previewUrl ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => {
                if (previewUrl && !isCompressing) {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 19, 137, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              onTouchStart={(e) => {
                if (previewUrl && !isCompressing) {
                  e.currentTarget.style.transform = 'scale(0.98)';
                }
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {isCompressing ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin" style={{ width: `${20 * scaleFactor}px`, height: `${20 * scaleFactor}px` }} fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#3B1389" strokeWidth="4"/>
                    <path className="opacity-75" fill="#3B1389" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  <span 
                    style={{ 
                      color: '#3B1389',
                      textAlign: 'center',
                      fontFamily: 'Pretendard',
                      fontSize: `${20 * scaleFactor}px`,
                      fontWeight: 700,
                      lineHeight: '140%'
                    }}
                  >
                    Getting ready...
                  </span>
                </div>
              ) : (
                <span 
                  style={{ 
                    color: !previewUrl ? '#999' : '#3B1389',
                    textAlign: 'center',
                    fontFamily: 'Pretendard',
                    fontSize: `${20 * scaleFactor}px`,
                    fontWeight: 700,
                    lineHeight: '140%'
                  }}
                >
                  Color Me!
                </span>
              )}
            </button>

            {/* Retry Button - Active only after photo is taken */}
            <button
              onClick={() => {
                if (previewUrl) {
                  // Reset to live camera view
                  setPreviewUrl(null);
                  setSelectedFile(null);
                  setError(null);
                  // Restart camera
                  if (!isCameraActive) {
                    startCamera();
                  }
                  // Restart face detection
                  startFaceDetection();
                }
              }}
              disabled={!previewUrl}
              style={{
                width: `${48 * scaleFactor}px`,
                height: `${48 * scaleFactor}px`,
                flexShrink: 0,
                borderRadius: '50%',
                backgroundColor: !previewUrl ? '#D0D0D0' : '#3B1389',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: !previewUrl ? 'not-allowed' : 'pointer',
                opacity: !previewUrl ? 0.5 : 1,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (previewUrl) {
                  e.currentTarget.style.backgroundColor = '#2A0F68';
                }
              }}
              onMouseLeave={(e) => {
                if (previewUrl) {
                  e.currentTarget.style.backgroundColor = '#3B1389';
                }
              }}
            >
              {/* Refresh Icon - Single Arrow (Flipped) */}
              <svg 
                style={{ 
                  width: `${24 * scaleFactor}px`, 
                  height: `${24 * scaleFactor}px`,
                  transform: 'scaleX(-1)' 
                }} 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="white" 
                strokeWidth={2} 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <polyline points="1 4 1 10 7 10"/>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
              </svg>
            </button>
          </div>

        </div>
      </div>
      
      {/* Debug Panel - Show in production for diagnosing camera issues */}
      {(window.location.hostname.includes('vercel.app') || window.location.hostname.includes('pca-hijab')) && (
        <div style={{
          position: 'fixed',
          bottom: 10,
          right: 10,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          padding: '10px',
          borderRadius: '8px',
          fontSize: '10px',
          fontFamily: 'monospace',
          maxWidth: '300px',
          maxHeight: '400px',
          overflow: 'auto',
          zIndex: 9999,
          display: 'none' // Initially hidden, will be shown via console command
        }}
        id="camera-debug-panel"
        >
          <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>
            🔍 Camera Debug Info
          </div>
          <div>
            <strong>URL:</strong> {window.location.href}
          </div>
          <div>
            <strong>Protocol:</strong> {window.location.protocol}
          </div>
          <div>
            <strong>Secure Context:</strong> {String(window.isSecureContext)}
          </div>
          <div>
            <strong>Session ID:</strong> {sessionId || 'None'}
          </div>
          <div>
            <strong>Camera Active:</strong> {String(isCameraActive)}
          </div>
          <div>
            <strong>Camera Initialized:</strong> {String(cameraInitialized)}
          </div>
          <div>
            <strong>Camera Error:</strong> {cameraError || 'None'}
          </div>
          <div>
            <strong>Stream:</strong> {stream ? 'Active' : 'None'}
          </div>
          <div>
            <strong>MediaDevices:</strong> {navigator.mediaDevices ? 'Available' : 'Not Available'}
          </div>
          <div>
            <strong>getUserMedia:</strong> {navigator.mediaDevices?.getUserMedia ? 'Available' : 'Not Available'}
          </div>
          <div>
            <strong>Browser:</strong> {navigator.userAgent.slice(0, 50)}...
          </div>
          <div style={{ marginTop: '10px' }}>
            <button 
              onClick={() => {
                console.log('🔄 Attempting to restart camera...');
                stopCamera();
                setTimeout(() => startCamera(), 100);
              }}
              style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                padding: '5px 10px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Retry Camera
            </button>
            <button 
              onClick={() => {
                const panel = document.getElementById('camera-debug-panel');
                if (panel) panel.style.display = 'none';
              }}
              style={{
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                padding: '5px 10px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                marginLeft: '5px'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default UploadPage;