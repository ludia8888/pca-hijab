import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { FunnelTracker, FUNNEL_STEPS, useScrollDepthTracking } from '@/utils/funnelAnalytics';

export const usePageTracking = (pageName: string, funnelStep?: string) => {
  const location = useLocation();
  const { startTracking } = useScrollDepthTracking(pageName);

  useEffect(() => {
    // 페이지 진입 시 퍼널 단계 진행
    if (funnelStep) {
      FunnelTracker.advanceStep(funnelStep, {
        page_name: pageName,
        page_path: location.pathname,
        referrer: document.referrer
      });
    }

    // 스크롤 추적 시작
    const cleanup = startTracking();

    // 페이지 이탈 감지
    const handleBeforeUnload = () => {
      FunnelTracker.trackDropOff('page_unload', pageName);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        FunnelTracker.trackDropOff('tab_hidden', pageName);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cleanup();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pageName, funnelStep, location.pathname, startTracking]);

  // 섹션별 추적 함수들
  const trackSectionEntry = useCallback((sectionName: string) => {
    FunnelTracker.trackInteraction(sectionName, 'section_entry', pageName);
  }, [pageName]);

  const trackFormStart = useCallback((formName: string) => {
    FunnelTracker.trackInteraction(formName, 'form_start', pageName);
  }, [pageName]);

  const trackFormSubmit = useCallback((formName: string, success: boolean, errorDetails?: string) => {
    FunnelTracker.trackInteraction(
      formName, 
      success ? 'form_submit_success' : 'form_submit_error', 
      pageName,
      { error_details: errorDetails }
    );
  }, [pageName]);

  const trackError = useCallback((errorType: string, errorMessage: string) => {
    FunnelTracker.trackError(errorType, errorMessage, { page_name: pageName });
  }, [pageName]);

  return {
    trackSectionEntry,
    trackFormStart,
    trackFormSubmit,
    trackError
  };
};

// 페이지별 전용 훅들
export const useHomePageTracking = () => {
  return usePageTracking('home', FUNNEL_STEPS.LANDING);
};

export const useUploadPageTracking = () => {
  return usePageTracking('upload', FUNNEL_STEPS.PHOTO_UPLOAD_START);
};

export const useAnalyzingPageTracking = () => {
  return usePageTracking('analyzing', FUNNEL_STEPS.ANALYSIS_START);
};

export const useResultPageTracking = () => {
  return usePageTracking('result', FUNNEL_STEPS.RESULT_VIEW);
};

export const useRecommendationPageTracking = () => {
  return usePageTracking('recommendation', FUNNEL_STEPS.PREFERENCES_START);
};

export const useCompletionPageTracking = () => {
  return usePageTracking('completion', FUNNEL_STEPS.COMPLETION);
};