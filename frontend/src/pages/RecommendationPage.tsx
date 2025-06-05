import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout, Header } from '@/components/layout';
import { Button, Card } from '@/components/ui';
import { ROUTES } from '@/utils/constants';
import { useAppStore } from '@/store';
import { RecommendationAPI } from '@/services/api';
import type { UserPreferences } from '@/types';

const RecommendationPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { analysisResult, instagramId, setRecommendationPreferences } = useAppStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<UserPreferences>({
    style: [],
    priceRange: '',
    material: [],
    occasion: [],
    additionalNotes: '',
  });

  // Redirect if no analysis result
  useEffect(() => {
    if (!analysisResult || !instagramId) {
      navigate(ROUTES.HOME);
    }
  }, [analysisResult, instagramId, navigate]);

  const steps = [
    {
      title: '선호 스타일',
      subtitle: '어떤 스타일의 히잡을 선호하시나요? (복수 선택 가능)',
      field: 'style',
      options: [
        { value: 'simple', label: '심플한 무지' },
        { value: 'pattern', label: '패턴이 있는' },
        { value: 'luxury', label: '고급스러운' },
        { value: 'casual', label: '캐주얼한' },
        { value: 'formal', label: '포멀한' },
      ],
      multiple: true,
    },
    {
      title: '가격대',
      subtitle: '선호하시는 가격대를 선택해주세요',
      field: 'priceRange',
      options: [
        { value: 'under-30', label: '3만원 이하' },
        { value: '30-50', label: '3-5만원' },
        { value: '50-70', label: '5-7만원' },
        { value: 'over-70', label: '7만원 이상' },
      ],
      multiple: false,
    },
    {
      title: '소재',
      subtitle: '선호하시는 소재를 선택해주세요 (복수 선택 가능)',
      field: 'material',
      options: [
        { value: 'cotton', label: '면' },
        { value: 'chiffon', label: '쉬폰' },
        { value: 'jersey', label: '저지' },
        { value: 'silk', label: '실크' },
        { value: 'modal', label: '모달' },
      ],
      multiple: true,
    },
    {
      title: '착용 상황',
      subtitle: '주로 어떤 상황에서 착용하시나요? (복수 선택 가능)',
      field: 'occasion',
      options: [
        { value: 'daily', label: '일상' },
        { value: 'work', label: '직장/학교' },
        { value: 'event', label: '특별한 날' },
        { value: 'prayer', label: '예배' },
        { value: 'sports', label: '운동' },
      ],
      multiple: true,
    },
  ];

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / (steps.length + 1)) * 100;

  const handleOptionClick = (value: string): void => {
    const field = currentStepData.field as keyof UserPreferences;
    
    if (currentStepData.multiple) {
      const currentValues = formData[field] as string[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];
      setFormData({ ...formData, [field]: newValues });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleNext = (): void => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Go to additional notes step
      setCurrentStep(steps.length);
    }
  };

  const handleBack = (): void => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (!analysisResult || !instagramId) return;

    try {
      // Store preferences
      setRecommendationPreferences(formData);
      
      // Submit recommendation request
      const response = await RecommendationAPI.submitRecommendation({
        instagramId,
        personalColorResult: analysisResult,
        preferences: formData
      });

      if (response.success) {
        // Navigate to completion page
        navigate(ROUTES.COMPLETION);
      } else {
        console.error('Failed to submit recommendation');
      }
    } catch (error) {
      console.error('Failed to submit preferences:', error);
    }
  };

  const isCurrentStepValid = (): boolean => {
    if (currentStep >= steps.length) return true; // Additional notes step
    
    const field = currentStepData.field as keyof UserPreferences;
    const value = formData[field];
    
    if (currentStepData.multiple) {
      return (value as string[]).length > 0;
    } else {
      return value !== '';
    }
  };

  return (
    <PageLayout
      header={
        <Header
          title="맞춤 추천"
          showBack
          onBack={() => navigate(ROUTES.RESULT)}
        />
      }
    >
      <div className="max-w-2xl mx-auto w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">
              {currentStep + 1}/{steps.length + 1} 단계
            </span>
            <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Form Content */}
        {currentStep < steps.length ? (
          <Card>
            <h2 className="text-h3 font-bold text-gray-900 mb-2">
              {currentStepData.title}
            </h2>
            <p className="text-body text-gray-600 mb-6">
              {currentStepData.subtitle}
            </p>

            <div className="space-y-3">
              {currentStepData.options.map((option) => {
                const field = currentStepData.field as keyof UserPreferences;
                const isSelected = currentStepData.multiple
                  ? (formData[field] as string[]).includes(option.value)
                  : formData[field] === option.value;

                return (
                  <button
                    key={option.value}
                    onClick={() => handleOptionClick(option.value)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option.label}</span>
                      {isSelected && (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        ) : (
          // Additional Notes Step
          <Card>
            <h2 className="text-h3 font-bold text-gray-900 mb-2">
              추가 요청사항
            </h2>
            <p className="text-body text-gray-600 mb-6">
              추가로 고려했으면 하는 사항이 있다면 알려주세요 (선택사항)
            </p>

            <textarea
              value={formData.additionalNotes}
              onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
              placeholder="예: 얼굴이 작아 보이는 스타일 선호, 특정 브랜드 선호 등"
              className="w-full p-4 border border-gray-200 rounded-xl resize-none h-32 focus:outline-none focus:border-primary"
            />
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-6">
          {currentStep > 0 && (
            <Button
              variant="secondary"
              onClick={handleBack}
              className="flex-1"
            >
              이전
            </Button>
          )}
          
          {currentStep < steps.length ? (
            <Button
              onClick={handleNext}
              disabled={!isCurrentStepValid()}
              className="flex-1"
            >
              다음
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="flex-1"
            >
              추천 받기
            </Button>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default RecommendationPage;