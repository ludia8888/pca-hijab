import { useCallback, useRef } from 'react';
import { FunnelTracker, FUNNEL_STEPS } from '@/utils/funnelAnalytics';

interface FormFieldState {
  fieldName: string;
  sectionName: string;
  interactions: {
    focus: number;
    blur: number;
    changes: number;
    timeSpent: number;
    errorCount: number;
  };
  startTime?: number;
  hasValue: boolean;
  validationErrors: string[];
}

export const useFormFieldTracking = () => {
  const fieldsState = useRef<Record<string, FormFieldState>>({});
  const formStartTime = useRef<number>();
  const sectionsViewed = useRef<Set<string>>(new Set());

  // 폼 시작 추적
  const trackFormStart = useCallback(() => {
    formStartTime.current = Date.now();
    FunnelTracker.advanceStep(FUNNEL_STEPS.PREFERENCES_PAGE_ENTER);
  }, []);

  // 섹션 진입 추적
  const trackSectionView = useCallback((sectionName: string, funnelStep: string) => {
    if (!sectionsViewed.current.has(sectionName)) {
      sectionsViewed.current.add(sectionName);
      
      FunnelTracker.advanceStep(funnelStep, {
        section_name: sectionName,
        time_to_section: formStartTime.current ? Date.now() - formStartTime.current : 0,
        sections_viewed_so_far: Array.from(sectionsViewed.current)
      });

      FunnelTracker.trackInteraction(
        sectionName,
        'section_view',
        'preferences_form',
        {
          section_order: sectionsViewed.current.size,
          time_to_reach: formStartTime.current ? Date.now() - formStartTime.current : 0
        }
      );
    }
  }, []);

  // 필드별 상호작용 추적
  const trackFieldInteraction = useCallback((
    fieldName: string, 
    sectionName: string,
    action: 'focus' | 'blur' | 'change' | 'error' | 'select',
    value?: any,
    error?: string
  ) => {
    // 필드 상태 초기화
    if (!fieldsState.current[fieldName]) {
      fieldsState.current[fieldName] = {
        fieldName,
        sectionName,
        interactions: {
          focus: 0,
          blur: 0,
          changes: 0,
          timeSpent: 0,
          errorCount: 0
        },
        hasValue: false,
        validationErrors: []
      };
    }

    const field = fieldsState.current[fieldName];
    const now = Date.now();

    switch (action) {
      case 'focus':
        field.interactions.focus++;
        field.startTime = now;
        
        // 첫 번째 포커스일 때 추적
        if (field.interactions.focus === 1) {
          FunnelTracker.trackFormInteraction('preferences', fieldName, action);
        }
        break;

      case 'blur':
        field.interactions.blur++;
        if (field.startTime) {
          field.interactions.timeSpent += now - field.startTime;
          field.startTime = undefined;
        }
        
        FunnelTracker.trackFormInteraction('preferences', fieldName, action, value);
        break;

      case 'change':
      case 'select':
        field.interactions.changes++;
        field.hasValue = !!value;
        
        // 선택 완료 시 해당 섹션의 퍼널 스텝 진행
        if (action === 'select' && value) {
          const stepMap: Record<string, string> = {
            'style': FUNNEL_STEPS.STYLE_OPTION_SELECT,
            'price': FUNNEL_STEPS.PRICE_RANGE_SELECT,
            'material': FUNNEL_STEPS.MATERIAL_OPTION_SELECT,
            'occasion': FUNNEL_STEPS.OCCASION_OPTION_SELECT,
            'notes': FUNNEL_STEPS.NOTES_INPUT_COMPLETE
          };

          const funnelStep = stepMap[sectionName];
          if (funnelStep) {
            FunnelTracker.advanceStep(funnelStep, {
              field_name: fieldName,
              selected_value: value,
              interaction_count: field.interactions.changes,
              time_to_select: field.interactions.timeSpent
            });
          }
        }

        FunnelTracker.trackFormInteraction('preferences', fieldName, action, value);
        break;

      case 'error':
        field.interactions.errorCount++;
        if (error) {
          field.validationErrors.push(error);
        }
        
        FunnelTracker.trackError('form_validation_error', error || 'Unknown error', {
          field_name: fieldName,
          section_name: sectionName,
          error_count: field.interactions.errorCount,
          field_value: value
        });
        break;
    }

    // 상세 필드 분석 이벤트
    FunnelTracker.trackEvent({
      action: 'field_interaction_detail',
      category: 'form_analytics',
      label: `${sectionName}_${fieldName}_${action}`,
      custom_parameters: {
        field_name: fieldName,
        section_name: sectionName,
        interaction_type: action,
        total_interactions: Object.values(field.interactions).reduce((a, b) => a + b, 0),
        time_spent_on_field: field.interactions.timeSpent,
        has_value: field.hasValue,
        error_count: field.interactions.errorCount,
        form_progress: calculateFormProgress()
      }
    });
  }, []);

  // 폼 진행률 계산
  const calculateFormProgress = useCallback((): number => {
    const requiredFields = ['style', 'price', 'material', 'occasion'];
    const completedFields = requiredFields.filter(fieldName => 
      fieldsState.current[fieldName]?.hasValue
    );
    return Math.round((completedFields.length / requiredFields.length) * 100);
  }, []);

  // 폼 제출 시도 추적
  const trackFormSubmitAttempt = useCallback((success: boolean, errors?: string[]) => {
    const totalFormTime = formStartTime.current ? Date.now() - formStartTime.current : 0;
    const progress = calculateFormProgress();
    
    // 필드별 요약 통계
    const fieldSummary = Object.values(fieldsState.current).map(field => ({
      field: field.fieldName,
      section: field.sectionName,
      interactions: field.interactions.focus + field.interactions.changes,
      timeSpent: field.interactions.timeSpent,
      hasValue: field.hasValue,
      errorCount: field.interactions.errorCount
    }));

    if (success) {
      FunnelTracker.advanceStep(FUNNEL_STEPS.FORM_VALIDATION_PASS, {
        total_form_time: totalFormTime,
        form_progress: progress,
        field_summary: fieldSummary,
        sections_visited: Array.from(sectionsViewed.current)
      });
      
      FunnelTracker.advanceStep(FUNNEL_STEPS.FORM_SUBMIT_CLICK);
    } else {
      FunnelTracker.trackError('form_submission_failed', 'Validation errors', {
        validation_errors: errors,
        form_progress: progress,
        time_spent: totalFormTime,
        incomplete_fields: fieldSummary.filter(f => !f.hasValue).map(f => f.field)
      });
    }
  }, [calculateFormProgress]);

  // 폼 이탈 추적
  const trackFormAbandon = useCallback((currentSection: string) => {
    const progress = calculateFormProgress();
    const timeSpent = formStartTime.current ? Date.now() - formStartTime.current : 0;
    
    FunnelTracker.trackDropOff('form_abandoned', currentSection);
    
    FunnelTracker.trackEvent({
      action: 'form_abandon_analysis',
      category: 'form_analytics',
      label: 'detailed_abandon',
      custom_parameters: {
        abandon_section: currentSection,
        form_progress: progress,
        time_spent: timeSpent,
        sections_completed: Array.from(sectionsViewed.current),
        field_interactions: Object.keys(fieldsState.current).length,
        last_active_field: getLastActiveField()
      }
    });
  }, [calculateFormProgress]);

  // 마지막 활성 필드 찾기
  const getLastActiveField = useCallback((): string => {
    let lastField = '';
    let lastTime = 0;
    
    Object.values(fieldsState.current).forEach(field => {
      if (field.interactions.focus > 0) {
        const fieldLastTime = field.startTime || 0;
        if (fieldLastTime > lastTime) {
          lastTime = fieldLastTime;
          lastField = field.fieldName;
        }
      }
    });
    
    return lastField;
  }, []);

  // 실시간 폼 분석 데이터 가져오기
  const getFormAnalytics = useCallback(() => {
    return {
      progress: calculateFormProgress(),
      timeSpent: formStartTime.current ? Date.now() - formStartTime.current : 0,
      sectionsViewed: Array.from(sectionsViewed.current),
      fieldsState: fieldsState.current,
      lastActiveField: getLastActiveField()
    };
  }, [calculateFormProgress, getLastActiveField]);

  return {
    trackFormStart,
    trackSectionView,
    trackFieldInteraction,
    trackFormSubmitAttempt,
    trackFormAbandon,
    getFormAnalytics,
    calculateFormProgress
  };
};