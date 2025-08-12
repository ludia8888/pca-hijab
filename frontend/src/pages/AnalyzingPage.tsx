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

const AnalyzingPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { uploadedFile, sessionId, uploadedImage, setAnalysisResult } = useAppStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<ImageAnalysisErrorType | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showLandmarkVisualization, setShowLandmarkVisualization] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const analysisAbortControllerRef = useRef<AbortController | null>(null);

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
      const timer = setTimeout(() => {
        setProgress(step.progress);
        
        // Show face landmark visualization throughout all analysis steps
        if (imageUrl && currentStep < ANALYSIS_STEPS.length) {
          setShowLandmarkVisualization(true);
        } else if (currentStep >= ANALYSIS_STEPS.length) {
          // Hide visualization when analysis is complete
          setShowLandmarkVisualization(false);
        }
        
        // Track progress milestones
        trackEvent('analysis_progress', {
          step_number: currentStep + 1,
          step_name: step.message,
          progress_percentage: step.progress,
          user_flow_step: 'analysis_progress_update'
        });
        
        if (currentStep < ANALYSIS_STEPS.length - 1) {
          setCurrentStep(currentStep + 1);
        }
      }, step.duration);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [currentStep, imageUrl]);

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
      
      // Save analysis result to backend with automatic session recovery
      try {
        if (sessionId) {
          const { updateSessionWithRecovery } = await import('@/utils/sessionHelper');
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
      
      // Track navigation to results
      trackEvent('navigation_start', {
        from_page: 'analyzing',
        to_page: 'result',
        personal_color: result.personal_color_en,
        user_flow_step: 'navigating_to_results'
      });
      
      // Wait for animation to complete
      const totalDuration = ANALYSIS_STEPS.reduce((acc, step) => acc + step.duration, 0) + 1000;
      navigationTimeoutRef.current = setTimeout(() => {
        try {
          navigate(ROUTES.RESULT);
        } catch (navigationError) {
          console.error('Navigation to result page failed:', navigationError);
          
          // If navigation fails (likely due to chunk loading), try direct URL change
          const isChunkError = navigationError instanceof Error && 
            navigationError.message.includes('Failed to fetch dynamically imported module');
          
          if (isChunkError) {
            console.log('Attempting direct navigation to result page...');
            window.location.href = ROUTES.RESULT + `?cb=${Date.now()}`;
          } else {
            // For non-chunk errors, still try to navigate
            window.location.href = ROUTES.RESULT;
          }
        }
      }, totalDuration);
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

  return (
    <PageLayout>
      <div className="min-h-screen relative">
        {/* Full-screen Face Landmark Visualization as background */}
        {showLandmarkVisualization && imageUrl && (
          <div className="absolute inset-0 w-full h-full">
            <FaceLandmarkVisualization
              imageUrl={imageUrl}
              currentAnalysisStep={currentStep}
              onLandmarksDetected={(landmarks) => {
                console.log(`🎯 [Sync] Face landmarks detected for step ${currentStep}:`, landmarks);
                trackEvent('face_landmarks_detected', {
                  faces_count: landmarks.length,
                  total_landmarks: landmarks.reduce((sum, face) => sum + face.keypoints.length, 0),
                  current_analysis_step: currentStep,
                  step_name: ANALYSIS_STEPS[currentStep]?.id || 'unknown',
                  user_flow_step: 'landmarks_visualization_synchronized'
                });
              }}
              className="w-full h-full"
            />
          </div>
        )}

        {/* Overlay content on top of image */}
        <div className="relative z-10 min-h-screen">
          {/* Top: Progress indicator */}
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4 z-20">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Analyzing</span>
                <span className="text-sm font-semibold text-primary-600">{progress}%</span>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary-500 to-primary-600 h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Character and Speech Bubble - Alternating corners */}
          {!error && (
            <div 
              key={`character-${currentStep}`}
              className={`fixed bottom-0 ${currentStep % 2 === 0 ? 'left-0' : 'right-0'} z-20 animate-slideUp`}
              style={{ animationDelay: '0.2s', animationFillMode: 'both' }}
            >
              <div className={`flex ${currentStep % 2 === 0 ? 'flex-row' : 'flex-row-reverse'} items-end gap-3 p-4`}>
                {/* Character Container */}
                <div className="relative animate-bounce-gentle" style={{ animationDelay: '0.5s' }}>
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center shadow-xl border-4 border-white">
                    <div className="text-3xl">
                      {currentStepData.character === 'detective' && '🕵️‍♀️'}
                      {currentStepData.character === 'scientist' && '👩‍🔬'}
                      {currentStepData.character === 'wizard' && '🧙‍♀️'}
                      {currentStepData.character === 'analyst' && '👩‍💼'}
                      {currentStepData.character === 'artist' && '👩‍🎨'}
                    </div>
                  </div>
                  {/* Character name badge */}
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary-600 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
                    AI {currentStepData.character}
                  </div>
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
                    
                    {/* Step indicator */}
                    <div className="text-xs text-primary-600 font-semibold mt-2">
                      Step {currentStep + 1} / {ANALYSIS_STEPS.length}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* Error state - positioned at center */}
        {error && errorType && (
          <div className="fixed inset-0 flex items-center justify-center z-30 bg-black/50 backdrop-blur-sm">
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
    </PageLayout>
  );
};

export default AnalyzingPage;