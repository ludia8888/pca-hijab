import { trackEvent } from './analytics';

// 초세밀 퍼널 단계 정의
export const FUNNEL_STEPS = {
  // 1. 랜딩 및 초기 진입
  LANDING: 'landing',
  HERO_SECTION_VIEW: 'hero_section_view',
  SCROLL_TO_FORM: 'scroll_to_form',
  
  // 2. 인스타그램 ID 입력 과정
  INSTAGRAM_FORM_FOCUS: 'instagram_form_focus',
  INSTAGRAM_TYPING_START: 'instagram_typing_start',
  INSTAGRAM_INPUT_COMPLETE: 'instagram_input_complete',
  INSTAGRAM_SUBMIT_CLICK: 'instagram_submit_click',
  
  // 3. 사진 업로드 과정
  UPLOAD_PAGE_ENTER: 'upload_page_enter',
  UPLOAD_INSTRUCTIONS_READ: 'upload_instructions_read',
  UPLOAD_AREA_INTERACT: 'upload_area_interact',
  FILE_SELECT_START: 'file_select_start',
  FILE_SELECTED: 'file_selected',
  IMAGE_PREVIEW_VIEW: 'image_preview_view',
  UPLOAD_SUBMIT_CLICK: 'upload_submit_click',
  
  // 4. 분석 대기 과정 (매우 상세)
  ANALYSIS_PAGE_ENTER: 'analysis_page_enter',
  ANALYSIS_INIT_START: 'analysis_init_start',
  ANALYSIS_UPLOAD_PROGRESS: 'analysis_upload_progress',
  ANALYSIS_AI_PROCESSING: 'analysis_ai_processing',
  ANALYSIS_PROGRESS_25: 'analysis_progress_25',
  ANALYSIS_PROGRESS_50: 'analysis_progress_50',
  ANALYSIS_PROGRESS_75: 'analysis_progress_75',
  ANALYSIS_COMPLETE: 'analysis_complete',
  ANALYSIS_RESULT_READY: 'analysis_result_ready',
  
  // 5. 결과 화면 과정
  RESULT_PAGE_ENTER: 'result_page_enter',
  RESULT_PHOTO_VIEW: 'result_photo_view',
  RESULT_COLOR_VIEW: 'result_color_view',
  RESULT_CONFIDENCE_VIEW: 'result_confidence_view',
  RESULT_PALETTE_INTERACTION: 'result_palette_interaction',
  RESULT_SHARE_ATTEMPT: 'result_share_attempt',
  RESULT_CONTINUE_CLICK: 'result_continue_click',
  
  // 6. 히잡 선호도 입력 과정 (필드별 세분화)
  PREFERENCES_PAGE_ENTER: 'preferences_page_enter',
  STYLE_SECTION_VIEW: 'style_section_view',
  STYLE_OPTION_SELECT: 'style_option_select',
  PRICE_SECTION_VIEW: 'price_section_view',
  PRICE_RANGE_SELECT: 'price_range_select',
  MATERIAL_SECTION_VIEW: 'material_section_view',
  MATERIAL_OPTION_SELECT: 'material_option_select',
  OCCASION_SECTION_VIEW: 'occasion_section_view',
  OCCASION_OPTION_SELECT: 'occasion_option_select',
  NOTES_SECTION_VIEW: 'notes_section_view',
  NOTES_INPUT_START: 'notes_input_start',
  NOTES_INPUT_COMPLETE: 'notes_input_complete',
  FORM_VALIDATION_PASS: 'form_validation_pass',
  FORM_SUBMIT_CLICK: 'form_submit_click',
  
  // 7. 완료 과정
  SUBMISSION_PROCESSING: 'submission_processing',
  COMPLETION_PAGE_ENTER: 'completion_page_enter',
  COMPLETION_MESSAGE_VIEW: 'completion_message_view'
} as const;

// 페이지별 섹션 정의
export const PAGE_SECTIONS = {
  HOME: {
    HERO: 'hero_section',
    INSTAGRAM_FORM: 'instagram_form',
    FEATURES: 'features_section',
    TESTIMONIALS: 'testimonials_section'
  },
  UPLOAD: {
    INSTRUCTIONS: 'upload_instructions',
    UPLOAD_AREA: 'upload_area',
    PREVIEW: 'image_preview',
    SUBMIT_BUTTON: 'submit_button'
  },
  RESULT: {
    PHOTO_DISPLAY: 'photo_display',
    COLOR_RESULT: 'color_result',
    CONFIDENCE_SCORE: 'confidence_score',
    COLOR_PALETTE: 'color_palette',
    SHARE_BUTTONS: 'share_buttons',
    CONTINUE_BUTTON: 'continue_button'
  },
  RECOMMENDATION: {
    STYLE_SELECTION: 'style_selection',
    PRICE_RANGE: 'price_range',
    MATERIAL_SELECTION: 'material_selection',
    OCCASION_SELECTION: 'occasion_selection',
    ADDITIONAL_NOTES: 'additional_notes',
    SUBMIT_FORM: 'submit_form'
  }
} as const;

// 상세 이벤트 추적
export class FunnelTracker {
  private static sessionData: {
    sessionId: string;
    startTime: number;
    currentStep: string;
    completedSteps: string[];
    interactions: Array<{
      element: string;
      action: string;
      timestamp: number;
      scrollPosition: number;
      pageSection: string;
    }>;
    scrollDepths: Record<string, number>;
    timeOnPages: Record<string, number>;
  } = {
    sessionId: this.generateSessionId(),
    startTime: Date.now(),
    currentStep: FUNNEL_STEPS.LANDING,
    completedSteps: [],
    interactions: [],
    scrollDepths: {},
    timeOnPages: {}
  };

  private static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 퍼널 단계 진행
  static advanceStep(step: string, metadata?: Record<string, any>): void {
    if (!this.sessionData.completedSteps.includes(this.sessionData.currentStep)) {
      this.sessionData.completedSteps.push(this.sessionData.currentStep);
    }
    
    this.sessionData.currentStep = step;

    trackEvent({
      action: 'funnel_step_advance',
      category: 'funnel_progression',
      label: step,
      custom_parameters: {
        session_id: this.sessionData.sessionId,
        step_order: this.sessionData.completedSteps.length,
        time_to_step: Date.now() - this.sessionData.startTime,
        previous_step: this.sessionData.completedSteps[this.sessionData.completedSteps.length - 1],
        ...metadata
      }
    });
  }

  // 퍼널 이탈 추적
  static trackDropOff(reason?: string, currentSection?: string): void {
    trackEvent({
      action: 'funnel_drop_off',
      category: 'funnel_analysis',
      label: this.sessionData.currentStep,
      custom_parameters: {
        session_id: this.sessionData.sessionId,
        drop_off_step: this.sessionData.currentStep,
        completed_steps: this.sessionData.completedSteps.length,
        time_to_drop_off: Date.now() - this.sessionData.startTime,
        reason: reason || 'unknown',
        current_section: currentSection || 'unknown',
        scroll_depth: this.sessionData.scrollDepths[this.sessionData.currentStep] || 0
      }
    });
  }

  // 버튼/요소 클릭 추적
  static trackInteraction(element: string, action: string, pageSection: string, metadata?: Record<string, any>): void {
    const interaction = {
      element,
      action,
      timestamp: Date.now(),
      scrollPosition: window.scrollY,
      pageSection
    };

    this.sessionData.interactions.push(interaction);

    trackEvent({
      action: 'element_interaction',
      category: 'user_interaction',
      label: `${pageSection}_${element}_${action}`,
      custom_parameters: {
        session_id: this.sessionData.sessionId,
        element_type: element,
        interaction_type: action,
        page_section: pageSection,
        scroll_position: interaction.scrollPosition,
        funnel_step: this.sessionData.currentStep,
        interaction_sequence: this.sessionData.interactions.length,
        ...metadata
      }
    });
  }

  // 스크롤 깊이 추적
  static trackScrollDepth(page: string, depth: number): void {
    const currentDepth = this.sessionData.scrollDepths[page] || 0;
    
    if (depth > currentDepth) {
      this.sessionData.scrollDepths[page] = depth;
      
      // 25%, 50%, 75%, 100% 마일스톤에서 이벤트 발생
      const milestones = [25, 50, 75, 100];
      const milestone = milestones.find(m => depth >= m && currentDepth < m);
      
      if (milestone) {
        trackEvent({
          action: 'scroll_depth',
          category: 'user_engagement',
          label: `${page}_${milestone}%`,
          value: milestone,
          custom_parameters: {
            session_id: this.sessionData.sessionId,
            page_name: page,
            scroll_percentage: milestone,
            funnel_step: this.sessionData.currentStep,
            time_on_page: Date.now() - (this.sessionData.timeOnPages[page] || Date.now())
          }
        });
      }
    }
  }

  // 페이지 체류 시간 추적
  static startPageTimer(page: string): void {
    this.sessionData.timeOnPages[page] = Date.now();
  }

  static endPageTimer(page: string): void {
    const startTime = this.sessionData.timeOnPages[page];
    if (startTime) {
      const timeSpent = Date.now() - startTime;
      
      trackEvent({
        action: 'page_time',
        category: 'user_engagement',
        label: page,
        value: Math.round(timeSpent / 1000), // seconds
        custom_parameters: {
          session_id: this.sessionData.sessionId,
          page_name: page,
          time_spent_ms: timeSpent,
          funnel_step: this.sessionData.currentStep,
          scroll_depth: this.sessionData.scrollDepths[page] || 0
        }
      });
    }
  }

  // 폼 상호작용 추적
  static trackFormInteraction(formName: string, fieldName: string, action: 'focus' | 'blur' | 'change' | 'error', value?: any): void {
    trackEvent({
      action: 'form_interaction',
      category: 'form_analytics',
      label: `${formName}_${fieldName}_${action}`,
      custom_parameters: {
        session_id: this.sessionData.sessionId,
        form_name: formName,
        field_name: fieldName,
        interaction_type: action,
        field_value_length: value ? String(value).length : 0,
        funnel_step: this.sessionData.currentStep
      }
    });
  }

  // 오류 추적
  static trackError(errorType: string, errorMessage: string, context?: Record<string, any>): void {
    trackEvent({
      action: 'user_error',
      category: 'error_tracking',
      label: errorType,
      custom_parameters: {
        session_id: this.sessionData.sessionId,
        error_type: errorType,
        error_message: errorMessage,
        funnel_step: this.sessionData.currentStep,
        page_section: context?.pageSection || 'unknown',
        ...context
      }
    });
  }

  // 세션 데이터 가져오기
  static getSessionData() {
    return { ...this.sessionData };
  }

  // 세션 완료
  static completeSession(): void {
    trackEvent({
      action: 'session_complete',
      category: 'funnel_completion',
      label: 'full_funnel',
      custom_parameters: {
        session_id: this.sessionData.sessionId,
        total_time: Date.now() - this.sessionData.startTime,
        completed_steps: this.sessionData.completedSteps.length,
        total_interactions: this.sessionData.interactions.length,
        final_step: this.sessionData.currentStep
      }
    });
  }
}

// 스크롤 깊이 자동 추적 훅
export const useScrollDepthTracking = (pageName: string) => {
  const trackScrollDepth = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = Math.round((scrollTop / docHeight) * 100);
    
    FunnelTracker.trackScrollDepth(pageName, scrollPercent);
  };

  const startTracking = () => {
    FunnelTracker.startPageTimer(pageName);
    window.addEventListener('scroll', trackScrollDepth, { passive: true });
    
    return () => {
      FunnelTracker.endPageTimer(pageName);
      window.removeEventListener('scroll', trackScrollDepth);
    };
  };

  return { startTracking, trackScrollDepth };
};