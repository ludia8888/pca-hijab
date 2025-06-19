import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout, Header } from '@/components/layout';
import { Button, Card } from '@/components/ui';
import { ROUTES } from '@/utils/constants';
import { useAppStore } from '@/store';
import { RecommendationAPI } from '@/services/api';
import type { UserPreferences } from '@/types';
import DebugInfo from '@/components/debug/DebugInfo';
import { trackEvent, trackEngagement, trackError, trackDropOff } from '@/utils/analytics';

const RecommendationPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { analysisResult, instagramId, setUserPreferences } = useAppStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<UserPreferences>({
    style: [],
    priceRange: '',
    material: [],
    occasion: [],
    additionalNotes: '',
  });

  // Redirect if no analysis result and track page entry
  useEffect(() => {
    if (!analysisResult || !instagramId) {
      // Track drop-off if user arrives without proper data
      trackDropOff('recommendation_page', 'missing_analysis_data');
      navigate(ROUTES.HOME);
    } else {
      // Track successful page entry with personal color context
      trackEvent('page_enter', {
        page: 'recommendation',
        user_flow_step: 'recommendation_page_entered',
        personal_color: analysisResult.personal_color_en,
        confidence_score: Math.round((analysisResult.confidence || 0) * 100)
      });
    }
  }, [analysisResult, instagramId, navigate]);

  const steps = [
    {
      title: 'Style Preference',
      subtitle: 'What style of hijab do you prefer? (Multiple selection allowed)',
      field: 'style',
      options: [
        { value: 'simple', label: 'Simple solid' },
        { value: 'pattern', label: 'Patterned' },
        { value: 'luxury', label: 'Luxurious' },
        { value: 'casual', label: 'Casual' },
        { value: 'formal', label: 'Formal' },
      ],
      multiple: true,
    },
    {
      title: 'Price Range',
      subtitle: 'Please select your preferred price range',
      field: 'priceRange',
      options: [
        { value: 'under-30000', label: 'Under 30,000 IDR / RM 9' },
        { value: '30000-50000', label: '30,000–50,000 IDR / RM 9–15' },
        { value: '50000-70000', label: '50,000–70,000 IDR / RM 15–21' },
        { value: 'over-70000', label: 'Over 70,000 IDR / RM 21+' },
      ],
      multiple: false,
    },
    {
      title: 'Material',
      subtitle: 'Please select your preferred material (Multiple selection allowed)',
      field: 'material',
      options: [
        { value: 'cotton', label: 'Cotton' },
        { value: 'chiffon', label: 'Chiffon' },
        { value: 'jersey', label: 'Jersey' },
        { value: 'silk', label: 'Silk' },
        { value: 'modal', label: 'Modal' },
      ],
      multiple: true,
    },
    {
      title: 'Occasion',
      subtitle: 'When do you mainly wear hijab? (Multiple selection allowed)',
      field: 'occasion',
      options: [
        { value: 'daily', label: 'Daily' },
        { value: 'work', label: 'Work/School' },
        { value: 'event', label: 'Special occasions' },
        { value: 'prayer', label: 'Prayer' },
        { value: 'sports', label: 'Sports' },
      ],
      multiple: true,
    },
  ];

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / (steps.length + 1)) * 100;

  const handleOptionClick = (value: string): void => {
    const field = currentStepData.field as keyof UserPreferences;
    const isCurrentlySelected = currentStepData.multiple
      ? (formData[field] as string[]).includes(value)
      : formData[field] === value;
    
    // Track preference selection with enhanced data
    trackEvent('preference_selection', {
      preference_type: field,
      selected_value: value,
      selection_action: isCurrentlySelected ? 'deselect' : 'select',
      step_number: currentStep + 1,
      step_name: currentStepData.title,
      user_flow_step: `preference_${field}_selected`,
      page: 'recommendation'
    });

    trackEngagement('form_interaction', `${field}_preference_selection`);
    
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
    // Track step progression
    trackEvent('step_progression', {
      from_step: currentStep + 1,
      to_step: currentStep + 2,
      step_name: currentStepData.title,
      completed_selections: getCurrentStepSelections(),
      user_flow_step: 'step_progressed_forward'
    });

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Go to additional notes step
      setCurrentStep(steps.length);
    }
  };

  const handleBack = (): void => {
    if (currentStep > 0) {
      // Track backward navigation
      trackEvent('step_progression', {
        from_step: currentStep + 1,
        to_step: currentStep,
        step_name: currentStepData?.title || 'additional_notes',
        navigation_direction: 'backward',
        user_flow_step: 'step_progressed_backward'
      });

      setCurrentStep(currentStep - 1);
    }
  };

  // Helper function to get current step selections for tracking
  const getCurrentStepSelections = (): string => {
    if (currentStep >= steps.length) return 'additional_notes';
    
    const field = currentStepData.field as keyof UserPreferences;
    const value = formData[field];
    
    if (currentStepData.multiple) {
      return (value as string[]).join(',');
    } else {
      return value as string;
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (!analysisResult || !instagramId) return;

    try {
      // Store preferences
      setUserPreferences(formData);
      
      // Track comprehensive preference submission
      trackEvent('preference_submit', {
        style: formData.style.join(','),
        style_count: formData.style.length,
        price_range: formData.priceRange,
        material: formData.material.join(','),
        material_count: formData.material.length,
        occasion: formData.occasion.join(','),
        occasion_count: formData.occasion.length,
        has_notes: formData.additionalNotes !== '',
        notes_length: formData.additionalNotes.length,
        personal_color: analysisResult.personal_color_en,
        user_flow_step: 'preferences_submitted'
      });

      trackEngagement('form_submit', 'recommendation_preferences');
      
      // Submit recommendation request
      const response = await RecommendationAPI.submitRecommendation({
        instagramId,
        personalColorResult: analysisResult,
        preferences: formData
      });

      if (response.success) {
        // Track successful recommendation request
        trackEvent('recommendation_request_success', {
          personal_color: analysisResult.personal_color_en,
          instagram_id: instagramId,
          preference_completeness: calculatePreferenceCompleteness(),
          user_flow_step: 'recommendation_request_submitted'
        });

        // Navigate to completion page
        navigate(ROUTES.COMPLETION);
      } else {
        // Handle API error response
        trackError('recommendation_request_failed', 'API returned unsuccessful response', 'recommendation_page');
        alert('Failed to submit request. Please try again.');
      }
    } catch (error: any) {
      // Handle network error with enhanced tracking
      console.error('Submission error:', error);
      console.error('Error type:', typeof error);
      console.error('Error properties:', Object.keys(error));
      
      let errorMessage = 'Network error';
      if (error.error) {
        errorMessage = error.error;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      trackError('recommendation_submit_error', errorMessage, 'recommendation_page');
      trackEvent('form_submit_failed', {
        form_name: 'recommendation_preferences',
        error_type: 'network_error',
        error_message: errorMessage,
        user_flow_step: 'recommendation_submit_failed'
      });
      
      alert(`Error: ${errorMessage}. Please check your connection and try again.`);
    }
  };

  // Helper function to calculate preference completeness
  const calculatePreferenceCompleteness = (): number => {
    let filledFields = 0;
    let totalFields = 4; // style, priceRange, material, occasion
    
    if (formData.style.length > 0) filledFields++;
    if (formData.priceRange !== '') filledFields++;
    if (formData.material.length > 0) filledFields++;
    if (formData.occasion.length > 0) filledFields++;
    
    return Math.round((filledFields / totalFields) * 100);
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
          title="Personalized Recommendations"
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
              Step {currentStep + 1}/{steps.length + 1}
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
              Additional Requests
            </h2>
            <p className="text-body text-gray-600 mb-6">
              Please let us know if you have any additional preferences (optional)
            </p>

            <textarea
              value={formData.additionalNotes}
              onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
              placeholder="Example: Prefer styles that make face look smaller, specific brand preferences, etc."
              className="w-full p-4 border border-gray-200 rounded-xl resize-none h-32 focus:outline-none focus:border-primary"
            />
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-6">
          {currentStep > 0 && (
            <Button
              variant="secondary"
              onClick={() => {
                // Track previous button click
                trackEvent('button_click', {
                  button_name: 'recommendation_previous',
                  page: 'recommendation',
                  current_step: currentStep + 1,
                  step_name: currentStepData?.title || 'additional_notes',
                  action: 'navigate_back',
                  user_flow_step: 'recommendation_step_back'
                });
                
                handleBack();
              }}
              className="flex-1"
            >
              Previous
            </Button>
          )}
          
          {currentStep < steps.length ? (
            <Button
              onClick={() => {
                // Track next button click
                trackEvent('button_click', {
                  button_name: 'recommendation_next',
                  page: 'recommendation',
                  current_step: currentStep + 1,
                  step_name: currentStepData.title,
                  is_valid: isCurrentStepValid(),
                  action: 'navigate_forward',
                  user_flow_step: 'recommendation_step_forward'
                });
                
                handleNext();
              }}
              disabled={!isCurrentStepValid()}
              className="flex-1"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={() => {
                // Track submit button click
                trackEvent('button_click', {
                  button_name: 'recommendation_submit',
                  page: 'recommendation',
                  action: 'submit_preferences',
                  has_additional_notes: formData.additionalNotes !== '',
                  user_flow_step: 'recommendation_submit'
                });
                
                handleSubmit();
              }}
              className="flex-1"
            >
              Get Recommendations
            </Button>
          )}
        </div>
      </div>
      <DebugInfo />
    </PageLayout>
  );
};

export default RecommendationPage;