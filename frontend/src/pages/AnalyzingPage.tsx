import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout';
import { ANALYSIS_STEPS, ROUTES } from '@/utils/constants';
import { useAppStore } from '@/store';
import { analyzeImage } from '@/services/api';
import { trackAIAnalysis, trackEvent, trackError, trackDropOff, trackEngagement } from '@/utils/analytics';

const AnalyzingPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { uploadedFile, sessionId, uploadedImage, setAnalysisResult } = useAppStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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
      setTimeout(() => {
        navigate(ROUTES.RESULT);
      }, ANALYSIS_STEPS.reduce((acc, step) => acc + step.duration, 0) + 1000);
    } catch (err) {
      console.error('Analysis error:', err);
      let errorMessage = 'An error occurred during analysis.';
      
      if (err instanceof Error) {
        console.error('Error details:', {
          name: err.name,
          message: err.message,
          stack: err.stack
        });
        
        // Check for specific error types
        if (err.message.includes('HEIC')) {
          errorMessage = 'HEIC format is not supported. Please use JPG or PNG files.';
        } else if (err.message.includes('network') || err.message.includes('Network')) {
          errorMessage = 'Please check your network connection.';
        } else if (err.message.includes('초를 초과했습니다')) {
          errorMessage = err.message; // Dynamic timeout message with seconds
        } else if (err.message.includes('timeout') || err.message.includes('Timeout')) {
          errorMessage = 'Analysis timed out. Please try with a smaller image.';
        } else if (err.message.includes('분석에 시간이 오래 걸리고 있습니다')) {
          errorMessage = '서버가 준비 중입니다. 잠시 후 다시 시도해주세요.';
        } else if (err.message.includes('분석 서비스')) {
          errorMessage = err.message; // Korean error message from API
        } else {
          errorMessage = err.message;
        }
      } else {
        console.error('Non-Error object thrown:', err);
        errorMessage = String(err);
      }
      
      // Track analysis failure with enhanced data
      trackError('ai_analysis_failed', errorMessage, 'analyzing_page');
      trackEvent('ai_analysis_failed', {
        error_message: errorMessage,
        file_size_mb: Math.round(uploadedFile.size / (1024 * 1024) * 100) / 100,
        file_type: uploadedFile.type,
        analysis_duration_ms: Date.now() - Date.now(), // This would need the actual start time
        user_flow_step: 'analysis_failed',
        error_type: errorMessage.includes('HEIC') ? 'unsupported_format' :
                   errorMessage.includes('network') ? 'network_error' :
                   errorMessage.includes('timeout') ? 'timeout_error' : 'unknown_error'
      });
      
      setError(`Error: ${errorMessage}`);
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

        {/* Animation area */}
        <div className="text-center mb-8">
          <div className="relative w-32 h-32 mx-auto mb-6">
            {/* Icon background circle */}
            <div className="absolute inset-0 bg-primary-100 rounded-full animate-pulse shadow-md" />
            
            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl animate-bounce drop-shadow-sm">{currentStepData.icon}</span>
            </div>
            
            {/* Rotating border */}
            <svg
              className="absolute inset-0 w-full h-full animate-spin"
              style={{ animationDuration: '3s' }}
            >
              <circle
                cx="64"
                cy="64"
                r="62"
                stroke="currentColor"
                strokeWidth="5"
                fill="none"
                className="text-primary-600 drop-shadow-sm"
                strokeDasharray="150 100"
              />
            </svg>
          </div>

          {/* Current step message */}
          <h2 className="text-h3 font-bold text-gray-900 mb-2">
            {currentStepData.message}
          </h2>
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-error/10 border border-error rounded-lg p-4 max-w-md w-full">
            <p className="text-error text-center mb-4">{error}</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  // Track retry button click with enhanced data
                  trackEvent('button_click', {
                    button_name: 'try_again_analysis',
                    page: 'analyzing',
                    retry_attempt: 'user_initiated',
                    previous_error: error || 'unknown',
                    user_flow_step: 'analysis_retry_initiated'
                  });

                  trackEngagement('retry', 'analysis_retry');
                  
                  setError(null);
                  setCurrentStep(0);
                setProgress(0);
                setIsAnalyzing(false); // Reset analyzing state
                performAnalysis();
              }}
              className="w-full py-3 px-4 bg-error-600 text-white font-semibold rounded-lg hover:bg-error-700 active:bg-error-800 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Try Again
            </button>
            {(error.includes('초과했습니다') || error.includes('timeout')) && (
              <button
                onClick={() => {
                  trackEvent('button_click', {
                    button_name: 'go_back_to_upload',
                    page: 'analyzing',
                    reason: 'timeout_error',
                    user_flow_step: 'return_to_upload_after_timeout'
                  });
                  navigate(ROUTES.DIAGNOSIS);
                }}
                className="w-full py-3 px-4 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-800 active:bg-gray-900 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Use Different Image
              </button>
            )}
            </div>
          </div>
        )}

        {/* Tips section */}
        <div className="mt-12 max-w-md w-full">
          <h3 className="text-h5 font-semibold text-gray-900 mb-4 text-center">
            💡 What is Personal Color?
          </h3>
          <div className="space-y-3 text-body-sm text-gray-600">
            <p>
              • A color group that harmonizes with your skin tone, hair color, and eye color
            </p>
            <p>
              • Classified into Spring/Summer/Autumn/Winter with unique characteristics
            </p>
            <p>
              • Knowing your personal color helps create a more vibrant and radiant look
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default AnalyzingPage;