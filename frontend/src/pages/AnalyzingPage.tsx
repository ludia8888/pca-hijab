import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout';
import { ANALYSIS_STEPS, ROUTES } from '@/utils/constants';
import { useAppStore } from '@/store';
import { analyzeImage } from '@/services/api';
import { trackAIAnalysis, trackEvent, trackError, trackDropOff, trackEngagement } from '@/utils/analytics';
import { ImageAnalysisError } from '@/components/ui/ImageAnalysisError/ImageAnalysisError';
import { parseImageAnalysisError, ImageAnalysisErrorType } from '@/utils/imageAnalysisErrors';
import FaceLandmarkVisualization from '@/components/analysis/FaceLandmarkVisualization';
import { updateSessionWithRecovery } from '@/utils/sessionHelper';
import guideBackground from '@/assets/가이드배경.jpg';
import analysisCharacter from '@/assets/분석캐릭터.png';

const AnalyzingPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { uploadedFile, sessionId, uploadedImage, analysisResult, setAnalysisResult } = useAppStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<ImageAnalysisErrorType | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showLandmarkVisualization, setShowLandmarkVisualization] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [canSkip, setCanSkip] = useState(false);
  const [showNavButtons, setShowNavButtons] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false); // Track if API analysis is done
  const [scaleFactor, setScaleFactor] = useState(1);
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const analysisAbortControllerRef = useRef<AbortController | null>(null);
  const stepTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate optimal scale to prevent overlapping
  useEffect(() => {
    const calculateScale = () => {
      const BASE_W = 402;
      const BASE_H = 874;
      
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      
      // Calculate scale based on both width and height to maintain aspect ratio
      const scaleX = vw / BASE_W;
      const scaleY = vh / BASE_H;
      
      // Use the smaller scale to ensure everything fits without overlapping
      const scale = Math.min(scaleX, scaleY) * 0.95; // 0.95 for safety margin
      
      setScaleFactor(scale);
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    
    return () => {
      window.removeEventListener('resize', calculateScale);
    };
  }, []);

  // Redirect if no image and track page entry
  useEffect(() => {
    if (!uploadedFile) {
      // Track drop-off if user arrives without proper data
      trackDropOff('analyzing_page', 'missing_upload_data');
      navigate(ROUTES.HOME);
    } else {
      // Track successful page entry
      trackEvent('page_enter', {
        page: 'analyzing',
        user_flow_step: 'analyzing_page_entered',
        file_size_mb: Math.round(uploadedFile.size / (1024 * 1024) * 100) / 100,
        file_type: uploadedFile.type
      });
      
      // Create image URL for visualization
      const url = uploadedImage || URL.createObjectURL(uploadedFile);
      setImageUrl(url);
      
      // Cleanup URL when component unmounts
      return () => {
        if (!uploadedImage && url) {
          URL.revokeObjectURL(url);
        }
      };
    }
  }, [uploadedFile, uploadedImage, navigate]);

  // Start analysis on mount
  useEffect(() => {
    if (uploadedFile && !isAnalyzing) {
      setIsAnalyzing(true);
      
      // Track AI analysis start
      trackEvent('ai_analysis_start', {
        file_size_mb: Math.round(uploadedFile.size / (1024 * 1024) * 100) / 100,
        file_type: uploadedFile.type,
        user_flow_step: 'ai_analysis_initiated',
        start_timestamp: new Date().toISOString()
      });

      trackEngagement('ai_analysis', 'analysis_start');
      
      performAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadedFile]);

  // Cleanup effect - Clear timeouts and abort controllers on unmount
  useEffect(() => {
    return () => {
      // Clear navigation timeout if exists
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
        navigationTimeoutRef.current = null;
      }
      
      // Abort any ongoing analysis
      if (analysisAbortControllerRef.current) {
        analysisAbortControllerRef.current.abort();
        analysisAbortControllerRef.current = null;
      }
    };
  }, []);

  // Progress animation with tracking
  useEffect(() => {
    if (currentStep < ANALYSIS_STEPS.length) {
      const step = ANALYSIS_STEPS[currentStep];
      
      // Enable skip for draping phases and final result
      const isDrapingPhase = step.id === 'warm-cool-comparison' || step.id === 'season-comparison' || step.id === 'final-result';
      
      // Allow skip if it's a draping phase OR if analysis is already complete
      // For Step 1, start with disabled and wait for scan completion
      if (currentStep === 0) {
        // Step 1: canSkip will be set to true when scan completes via onLandmarksDetected
        // Don't override if already set by scan completion
      } else {
        setCanSkip(isDrapingPhase || analysisComplete);
      }
      
      // Show navigation buttons for phases 3, 4, and 5 OR if analysis is complete
      setShowNavButtons(isDrapingPhase || analysisComplete);
      
      // Set progress immediately
      setProgress(step.progress);
      
      // Show visualization immediately
      if (currentStep < ANALYSIS_STEPS.length) {
        setShowLandmarkVisualization(true);
      } else {
        setShowLandmarkVisualization(false);
      }
      
      // Track progress milestones
      trackEvent('analysis_progress', {
        step_number: currentStep + 1,
        step_name: step.message,
        progress_percentage: step.progress,
        user_flow_step: 'analysis_progress_update'
      });
      
      // Auto-advance for non-draping phases, manual control for draping phases
      // BUT if analysis is complete, allow manual control for all phases
      // Step 1 (index 0) waits for scan completion, no auto-advance
      if (!isDrapingPhase && !analysisComplete && currentStep !== 0) {
        stepTimerRef.current = setTimeout(() => {
          if (currentStep < ANALYSIS_STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
          }
        }, step.duration);
      }
      // For Step 1, draping phases, or when analysis is complete, wait for user interaction (no timer)

      return () => {
        if (stepTimerRef.current) {
          clearTimeout(stepTimerRef.current);
        }
      };
    }
    return undefined;
  }, [currentStep, imageUrl, analysisComplete]);

  const performAnalysis = async (): Promise<void> => {
    if (!uploadedFile) return;

    try {
      console.log('Starting analysis for file:', uploadedFile.name);
      
      // Track analysis start
      const startTime = Date.now();
      
      // Call AI API
      const result = await analyzeImage(uploadedFile);
      
      // Calculate analysis time
      const analysisTime = Date.now() - startTime;
      
      console.log('Analysis successful:', result);
      
      // Track successful AI analysis with enhanced data
      trackAIAnalysis({
        personalColorType: result.personal_color_en,
        season: result.personal_color_en.toLowerCase().split(' ')[0],
        tone: result.personal_color_en.toLowerCase().split(' ')[1] || 'neutral',
        confidence: result.confidence || 0,
        processingTime: analysisTime,
        analysisId: sessionId
      });

      // Track detailed analysis success
      trackEvent('ai_analysis_success', {
        personal_color: result.personal_color_en,
        confidence_score: Math.round((result.confidence || 0) * 100),
        processing_time_ms: analysisTime,
        file_size_mb: Math.round(uploadedFile.size / (1024 * 1024) * 100) / 100,
        file_type: uploadedFile.type,
        analysis_quality: (result.confidence || 0) > 0.8 ? 'high' : (result.confidence || 0) > 0.6 ? 'medium' : 'low',
        user_flow_step: 'analysis_completed_successfully'
      });
      
      // Store result
      setAnalysisResult(result);
      
      // Mark analysis as complete - this will allow skipping through UI steps
      setAnalysisComplete(true);
      
      // Save analysis result to backend with automatic session recovery
      try {
        if (sessionId) {
          await updateSessionWithRecovery(sessionId, {
            analysisResult: result,
            uploadedImageUrl: uploadedImage // Store image URL if available
          });
          console.log('Analysis result saved to backend');
        }
      } catch (saveError) {
        console.error('Failed to save analysis result to backend:', saveError);
        trackError('backend_save_failed', saveError instanceof Error ? saveError.message : 'Unknown save error', 'analyzing_page');
        // Don't block user flow for backend save errors
      }
      
      // Store result but DON'T navigate automatically
      // Navigation will happen when user completes all steps manually
      console.log('Analysis complete, user can now navigate through steps freely');
      
      // Track that analysis is ready
      trackEvent('analysis_ready', {
        personal_color: result.personal_color_en,
        user_flow_step: 'analysis_complete_waiting_for_user'
      });
    } catch (err) {
      console.error('Analysis error:', err);
      
      // Parse the error to determine specific type
      const analysisErrorType = parseImageAnalysisError(err);
      
      let errorMessage = 'An error occurred during analysis.';
      if (err instanceof Error) {
        console.error('Error details:', {
          name: err.name,
          message: err.message,
          stack: err.stack,
          parsedType: analysisErrorType
        });
        errorMessage = err.message;
      } else {
        console.error('Non-Error object thrown:', err);
        errorMessage = String(err);
      }
      
      // Track analysis failure with enhanced data
      trackError('ai_analysis_failed', errorMessage, 'analyzing_page');
      trackEvent('ai_analysis_failed', {
        error_message: errorMessage,
        error_type_detailed: analysisErrorType,
        file_size_mb: Math.round(uploadedFile.size / (1024 * 1024) * 100) / 100,
        file_type: uploadedFile.type,
        analysis_duration_ms: Date.now() - Date.now(), // This would need the actual start time
        user_flow_step: 'analysis_failed',
        error_category: analysisErrorType
      });
      
      // Set both error message and type
      setError(errorMessage);
      setErrorType(analysisErrorType);
    }
  };

  const currentStepData = ANALYSIS_STEPS[currentStep] || ANALYSIS_STEPS[0];

  // Handle proceeding to next step (for draping phases)
  const handleProceedToNext = () => {
    if (canSkip && currentStep < ANALYSIS_STEPS.length - 1) {
      // Clear current timer if any
      if (stepTimerRef.current) {
        clearTimeout(stepTimerRef.current);
      }
      
      // Track user interaction
      trackEvent('draping_phase_completed', {
        step_number: currentStep + 1,
        step_name: currentStepData.id,
        user_flow_step: 'user_proceeded_from_draping'
      });
      
      // Move to next step
      setCurrentStep(currentStep + 1);
      setCanSkip(false);
    }
  };

  // Handle going back to previous step
  const handleGoBack = () => {
    if (currentStep > 0) {
      // Clear current timer if any
      if (stepTimerRef.current) {
        clearTimeout(stepTimerRef.current);
      }
      
      // Track user interaction
      trackEvent('navigation_back', {
        from_step: currentStep,
        to_step: currentStep - 1,
        step_name: currentStepData.id,
        user_flow_step: 'user_went_back'
      });
      
      // Move to previous step
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle forward navigation (for all phases)
  const handleGoForward = () => {
    // Check if we're on the final step and analysis is complete
    if (currentStep === ANALYSIS_STEPS.length - 1) {
      // Final step - navigate to results if analysis is ready
      if (analysisResult) {
        trackEvent('navigation_to_results', {
          from_step: currentStep,
          step_name: currentStepData.id,
          user_flow_step: 'user_completed_analysis'
        });
        
        trackEngagement('analysis_completed', 'manual_completion');
        
        navigate(ROUTES.RESULT);
      } else {
        console.warn('Analysis not yet complete, waiting for results...');
        // Could show a message to the user here
      }
    } else if (currentStep < ANALYSIS_STEPS.length - 1) {
      // Not on final step - move to next step
      // Clear current timer if any
      if (stepTimerRef.current) {
        clearTimeout(stepTimerRef.current);
      }
      
      // Track user interaction
      trackEvent('navigation_forward', {
        from_step: currentStep,
        to_step: currentStep + 1,
        step_name: currentStepData.id,
        user_flow_step: 'user_went_forward'
      });
      
      // Move to next step
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <PageLayout>
      <div className="min-h-screen relative overflow-hidden">
        {/* Full screen background */}
        <div 
          className="absolute"
          style={{
            width: '150vh',
            height: '150vw',
            top: '50%',
            left: '50%',
            background: `linear-gradient(0deg, rgba(99, 36, 222, 0.20) 0%, rgba(99, 36, 222, 0.20) 100%), url(${guideBackground}) lightgray 50% / cover no-repeat`,
            transform: 'translate(-50%, -50%) rotate(90deg)',
            zIndex: 0,
          }}
        />
        
        {/* Content container */}
        <div className="min-h-screen flex items-center justify-center relative z-10">
          <div 
            className="relative"
            style={{
              width: `${402 * scaleFactor}px`,
              height: `${874 * scaleFactor}px`,
              maxWidth: '100vw',
              maxHeight: '100vh',
            }}
          >
            {/* Header */}
            <div
              style={{
                position: 'absolute',
                top: `${16 * scaleFactor}px`,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                width: `${402 * scaleFactor}px`,
                height: `${61 * scaleFactor}px`,
                padding: `${28 * scaleFactor}px ${16 * scaleFactor}px`,
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: `${10 * scaleFactor}px`,
                flexShrink: 0,
                border: '1px solid #e0e0e0',
                boxSizing: 'border-box',
              }}
            >
            <span
              style={{
                color: '#FFF',
                textAlign: 'center',
                fontFamily: 'var(--Label-Medium-Font, Roboto)',
                fontSize: `${14 * scaleFactor}px`,
                fontStyle: 'normal',
                fontWeight: 700,
                lineHeight: 'var(--Label-Medium-Line-Height, 16px)',
                letterSpacing: 'var(--Label-Medium-Tracking, 0.5px)',
                width: '100%',
              }}
            >
              Step {currentStep + 1}/5
            </span>
            {/* Progress bar container */}
            <div
              style={{
                width: `${370 * scaleFactor}px`,
                height: `${5 * scaleFactor}px`,
                flexShrink: 0,
                borderRadius: `${40 * scaleFactor}px`,
                background: 'rgba(255, 255, 255, 0.2)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Progress bar fill */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  height: '100%',
                  width: `${((currentStep + 1) / 5) * 100}%`,
                  borderRadius: `${40 * scaleFactor}px`,
                  background: 'var(--main, #FFF49B)',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
            </div>

            {/* Content container below header */}
            <div
              style={{
                position: 'absolute',
                top: `${(16 + 61 + 10) * scaleFactor}px`, // header top + header height + gap
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                width: `${402 * scaleFactor}px`,
                padding: `${16 * scaleFactor}px 0`,
                justifyContent: 'center',
                alignItems: 'center',
                gap: `${10 * scaleFactor}px`,
              }}
            >
            <h2
              style={{
                color: 'var(--Color-7, #FFF)',
                textAlign: 'center',
                fontFamily: '"Plus Jakarta Sans"',
                fontSize: `${24 * scaleFactor}px`,
                fontStyle: 'normal',
                fontWeight: 800,
                lineHeight: '140%',
                width: `${402 * scaleFactor}px`,
                margin: 0,
              }}
            >
              I'm analyzing your features<br />
              This won't take long!
            </h2>
            </div>

            {/* Gray container for image/visualization */}
            <div
              className="absolute overflow-hidden"
              style={{
                top: `${(16 + 61 + 10 + 16 + 24*1.4 + 16 + 16) * scaleFactor}px`, // header top + header height + gap + text padding + text height + text padding + margin
                left: '50%',
                transform: 'translateX(-50%)',
                width: '348px',
                height: '475px',
                flexShrink: 0,
                borderRadius: `${10 * scaleFactor}px`,
                background: '#D9D9D9',
                boxShadow: `0 ${4 * scaleFactor}px ${8 * scaleFactor}px rgba(0, 0, 0, 0.15)`,
              }}
            >
              {/* Face Landmark Visualization */}
              {imageUrl && (
                <div className="w-full h-full">
                  <FaceLandmarkVisualization
                    imageUrl={imageUrl}
                    currentAnalysisStep={currentStep}
                    onLandmarksDetected={(landmarks) => {
                    console.log(`🎯 [Sync] Face landmarks detected for step ${currentStep}:`, landmarks);
                    
                    // Check if scan is complete (Step 1 only)
                    if (currentStep === 0 && landmarks.some((l: any) => l.scanComplete)) {
                      console.log('✅ [Step 1] Scan complete, enabling continue button');
                      setCanSkip(true); // Enable continue button after scan completes
                    }
                    
                    trackEvent('face_landmarks_detected', {
                      faces_count: landmarks.length,
                      total_landmarks: landmarks.reduce((sum, face) => sum + (face.keypoints ? face.keypoints.length : 0), 0),
                      current_analysis_step: currentStep,
                      step_name: ANALYSIS_STEPS[currentStep]?.id || 'unknown',
                      user_flow_step: 'landmarks_visualization_synchronized'
                    });
                  }}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* CTA Buttons - Same as PhotoGuide page, positioned at bottom */}
            <div 
              className="absolute left-1/2 -translate-x-1/2 flex justify-center items-center"
              style={{ 
                width: `${402 * scaleFactor}px`,
                padding: `0 ${16 * scaleFactor}px`,
                gap: `${10 * scaleFactor}px`,
                top: `${(16 + 61 + 10 + 16 + 24*1.4 + 16 + 16) * scaleFactor + 475 + 116}px`, // scan container top + container height + 116px gap
              }}
            >
            {/* Left Button - White */}
            <button 
              onClick={() => {
                if (currentStep === 0) {
                  // On first step, go back to diagnosis page
                  navigate(ROUTES.DIAGNOSIS);
                } else {
                  handleGoBack();
                }
              }}
              className="items-center justify-center cursor-pointer transition-all"
              style={{ 
                display: 'flex',
                width: `${164 * scaleFactor}px`,
                height: `${57 * scaleFactor}px`,
                padding: `${10 * scaleFactor}px ${16 * scaleFactor}px`,
                borderRadius: `${10 * scaleFactor}px`,
                background: '#FFFFFF',
                border: '1px solid #E0E0E0',
                transition: 'all 0.2s ease',
                opacity: 1, // Always enabled
                pointerEvents: 'auto', // Always clickable
                marginRight: `${18 * scaleFactor}px`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              onTouchStart={(e) => {
                e.currentTarget.style.transform = 'scale(0.98)';
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
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
                Go Back
              </span>
            </button>

            {/* Right Button - Yellow */}
            <button 
              onClick={() => {
                if (currentStep === ANALYSIS_STEPS.length - 1 && analysisResult) {
                  navigate(ROUTES.RESULT);
                } else if (canSkip) {
                  handleProceedToNext();
                }
              }}
              className="items-center justify-center cursor-pointer transition-all"
              style={{ 
                display: 'flex',
                width: `${164 * scaleFactor}px`,
                height: `${57 * scaleFactor}px`,
                padding: `${10 * scaleFactor}px ${16 * scaleFactor}px`,
                borderRadius: `${10 * scaleFactor}px`,
                background: '#FFF3A1',
                border: 'none',
                transition: 'all 0.2s ease',
                opacity: (canSkip || (currentStep === ANALYSIS_STEPS.length - 1 && analysisResult)) ? 1 : 0.5,
                pointerEvents: (canSkip || (currentStep === ANALYSIS_STEPS.length - 1 && analysisResult)) ? 'auto' : 'none',
              }}
              onMouseEnter={(e) => {
                if (canSkip || (currentStep === ANALYSIS_STEPS.length - 1 && analysisResult)) {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 19, 137, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              onTouchStart={(e) => {
                if (canSkip || (currentStep === ANALYSIS_STEPS.length - 1 && analysisResult)) {
                  e.currentTarget.style.transform = 'scale(0.98)';
                }
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
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
                {currentStep === ANALYSIS_STEPS.length - 1 ? 
                  (analysisResult ? 'See My Colors!' : 'Almost ready...') : 
                  'Continue'}
              </span>
            </button>
            </div>

            {/* Character and Speech Bubble - Show after scan completes for Step 1 */}
            {!error && (currentStep === 0 ? canSkip : true) && (
              <div 
                key={`character-${currentStep}`}
                className={`absolute bottom-32 ${currentStep % 2 === 0 ? 'left-0' : 'right-0'} z-20 animate-slideUp`}
                style={{ animationDelay: '0.2s', animationFillMode: 'both', pointerEvents: 'none' }}
              >
              <div className={`flex ${currentStep % 2 === 0 ? 'flex-row' : 'flex-row-reverse'} items-end gap-3 p-4`}>
                {/* Character Container */}
                <div className="relative animate-bounce-gentle" style={{ animationDelay: '0.5s' }}>
                  <img 
                    src={analysisCharacter} 
                    alt="Analysis Character" 
                    className="object-contain filter drop-shadow-xl"
                    style={{
                      width: '111px',
                      height: '100px',
                      aspectRatio: '111/100'
                    }}
                  />
                </div>

                {/* Speech Bubble */}
                <div className={`relative max-w-xs ${currentStep % 2 === 0 ? 'ml-2' : 'mr-2'} animate-fade-in`} style={{ animationDelay: '0.4s' }}>
                  <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border-2 border-primary-200 p-4 transform transition-all hover:scale-105">
                    {/* Bubble tail pointing to character */}
                    <div className={`absolute bottom-4 ${currentStep % 2 === 0 ? '-left-2' : '-right-2'} w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent ${currentStep % 2 === 0 ? 'border-r-8 border-r-white' : 'border-l-8 border-l-white'}`}></div>
                    
                    {/* Message content */}
                    <p className="text-sm font-medium text-gray-800 leading-relaxed">
                      {currentStepData.message}
                    </p>
                    
                    {/* Tech explanation (smaller text) */}
                    <p className="text-xs text-gray-500 mt-2 italic">
                      {currentStepData.techExplanation}
                    </p>
                  </div>
                </div>
              </div>
              </div>
            )}

            {/* Error state - positioned at center */}
            {error && errorType && (
              <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/50 backdrop-blur-sm">
            <div className="max-w-md w-full mx-4">
              <ImageAnalysisError
                errorType={errorType}
                onRetry={() => {
                  // Track retry button click with enhanced data
                  trackEvent('button_click', {
                    button_name: 'try_again_analysis',
                    page: 'analyzing',
                    retry_attempt: 'user_initiated',
                    previous_error: error || 'unknown',
                    error_type: errorType,
                    user_flow_step: 'analysis_retry_initiated'
                  });

                  trackEngagement('retry', 'analysis_retry');
                  
                  // Reset all error states
                  setError(null);
                  setErrorType(null);
                  setCurrentStep(0);
                  setProgress(0);
                  setIsAnalyzing(false);
                  
                  // Start analysis again
                  performAnalysis();
                }}
                onChangeImage={() => {
                  trackEvent('button_click', {
                    button_name: 'go_back_to_upload',
                    page: 'analyzing',
                    reason: 'user_requested_change',
                    error_type: errorType,
                    user_flow_step: 'return_to_upload_from_error'
                  });
                  navigate(ROUTES.DIAGNOSIS);
                }}
              />
            </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default AnalyzingPage;