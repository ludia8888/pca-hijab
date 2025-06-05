import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout';
import { ANALYSIS_STEPS, ROUTES } from '@/utils/constants';
import { useAppStore } from '@/store';
import { analyzeImage } from '@/services/api';

const AnalyzingPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { uploadedFile, instagramId, setAnalysisResult } = useAppStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Redirect if no image or instagram ID
  useEffect(() => {
    if (!uploadedFile || !instagramId) {
      navigate(ROUTES.HOME);
    }
  }, [uploadedFile, instagramId, navigate]);

  // Start analysis on mount
  useEffect(() => {
    if (uploadedFile && !isAnalyzing) {
      setIsAnalyzing(true);
      performAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadedFile]);

  // Progress animation
  useEffect(() => {
    if (currentStep < ANALYSIS_STEPS.length) {
      const step = ANALYSIS_STEPS[currentStep];
      const timer = setTimeout(() => {
        setProgress(step.progress);
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
      // Call AI API
      console.log('Starting analysis with file:', uploadedFile);
      const result = await analyzeImage(uploadedFile);
      console.log('Analysis complete, result:', result);
      
      // Store result
      setAnalysisResult(result);
      console.log('Result stored in state');
      
      // Wait for animation to complete
      setTimeout(() => {
        console.log('Navigating to result page');
        navigate(ROUTES.RESULT);
      }, ANALYSIS_STEPS.reduce((acc, step) => acc + step.duration, 0) + 1000);
    } catch (err) {
      console.error('Analysis error:', err);
      const errorMessage = err instanceof Error ? err.message : '분석 중 오류가 발생했습니다.';
      setError(`오류: ${errorMessage}. 다시 시도해주세요.`);
    }
  };

  const currentStepData = ANALYSIS_STEPS[currentStep] || ANALYSIS_STEPS[0];

  return (
    <PageLayout>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
        {/* Progress indicator */}
        <div className="w-full max-w-md mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">분석 진행중</span>
            <span className="text-sm text-gray-600">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Animation area */}
        <div className="text-center mb-8">
          <div className="relative w-32 h-32 mx-auto mb-6">
            {/* Icon background circle */}
            <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse" />
            
            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl animate-bounce">{currentStepData.icon}</span>
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
                strokeWidth="4"
                fill="none"
                className="text-primary"
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
            <button
              onClick={() => {
                setError(null);
                setCurrentStep(0);
                setProgress(0);
                performAnalysis();
              }}
              className="w-full py-2 bg-error text-white rounded-lg hover:bg-error/90 transition-colors"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* Tips section */}
        <div className="mt-12 max-w-md w-full">
          <h3 className="text-h5 font-semibold text-gray-900 mb-4 text-center">
            💡 퍼스널 컬러란?
          </h3>
          <div className="space-y-3 text-body-sm text-gray-600">
            <p>
              • 개인의 피부톤, 머리색, 눈동자 색과 조화를 이루는 색상군
            </p>
            <p>
              • 봄/여름/가을/겨울 4계절로 분류되며 각각 고유한 특징 보유
            </p>
            <p>
              • 자신의 퍼스널 컬러를 알면 더욱 생기있고 화사한 인상 연출 가능
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default AnalyzingPage;