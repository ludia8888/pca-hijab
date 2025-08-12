import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout';
import { ANALYSIS_STEPS, ROUTES } from '@/utils/constants';
import { useAppStore } from '@/store';
import { analyzeImage } from '@/services/api';
import { trackAIAnalysis, trackEvent, trackError, trackDropOff, trackEngagement } from '@/utils/analytics';
import { ImageAnalysisError } from '@/components/ui/ImageAnalysisError/ImageAnalysisError';
import { parseImageAnalysisError, ImageAnalysisErrorType } from '@/utils/imageAnalysisErrors';

const AnalyzingPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { uploadedFile, sessionId, uploadedImage, setAnalysisResult } = useAppStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<ImageAnalysisErrorType | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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
    }
  }, [uploadedFile, navigate]);

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
  }, [currentStep]);

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
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 pb-24">
        {/* Progress indicator */}
        <div className="w-full max-w-md mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Analyzing</span>
            <span className="text-sm font-semibold text-primary-600">{progress}%</span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden shadow-inner">
            <div
              className="bg-gradient-to-r from-primary-500 to-primary-600 h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Character Animation Area */}
        <div className="relative w-full max-w-lg mx-auto mb-8">
          {/* Character Container */}
          <div className="relative flex flex-col items-center">
            {/* Speech Bubble */}
            <div className="relative mb-4 px-6 py-4 bg-white rounded-2xl shadow-lg border-2 border-primary-200 max-w-sm">
              {/* Speech bubble tail */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-4 h-4 bg-white border-b-2 border-r-2 border-primary-200 rotate-45"></div>
              
              {/* Message content */}
              <p className="text-sm font-medium text-gray-800 leading-relaxed text-center">
                {currentStepData.message}
              </p>
              
              {/* Tech explanation (smaller text) */}
              <p className="text-xs text-gray-500 mt-2 text-center italic">
                {currentStepData.techExplanation}
              </p>
            </div>

            {/* Character Image Container */}
            <div className="relative">
              {/* Character image with fallback */}
              <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center shadow-lg animate-bounce border-4 border-white overflow-hidden">
                {/* Try to load character image, fallback to emoji */}
                <img
                  src={currentStepData.characterImage}
                  alt={`AI ${currentStepData.character}`}
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    // Fallback to emoji representation if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'block';
                  }}
                />
                {/* Fallback emoji representation */}
                <div className="text-center" style={{ display: 'none' }}>
                  <div className="text-2xl mb-1">
                    {currentStepData.character === 'detective' && '🕵️‍♀️'}
                    {currentStepData.character === 'scientist' && '👩‍🔬'}
                    {currentStepData.character === 'wizard' && '🧙‍♀️'}
                    {currentStepData.character === 'analyst' && '👩‍💼'}
                    {currentStepData.character === 'artist' && '👩‍🎨'}
                  </div>
                  <div className="text-xs font-semibold text-gray-600 capitalize">
                    {currentStepData.character}
                  </div>
                </div>
              </div>

              {/* Floating particles animation */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-2 h-2 bg-primary-300 rounded-full animate-ping" style={{animationDelay: '0s'}} />
                <div className="absolute top-2 right-2 w-1 h-1 bg-secondary-400 rounded-full animate-ping" style={{animationDelay: '0.5s'}} />
                <div className="absolute bottom-2 left-4 w-1.5 h-1.5 bg-primary-400 rounded-full animate-ping" style={{animationDelay: '1s'}} />
              </div>

              {/* Progress ring around character */}
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="48"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  className="text-primary-200"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="48"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  className="text-primary-600 transition-all duration-1000 ease-out"
                  strokeDasharray={`${2 * Math.PI * 48}`}
                  strokeDashoffset={`${2 * Math.PI * 48 * (1 - progress / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Character name and step info */}
            <div className="mt-4 text-center">
              <h3 className="text-sm font-bold text-primary-700 capitalize mb-1">
                AI {currentStepData.character}
              </h3>
              <p className="text-xs text-gray-500">
                Step {currentStep + 1} of {ANALYSIS_STEPS.length}
              </p>
            </div>
          </div>
        </div>

        {/* Error state */}
        {error && errorType && (
          <div className="max-w-md w-full">
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
        )}

      </div>
    </PageLayout>
  );
};

export default AnalyzingPage;