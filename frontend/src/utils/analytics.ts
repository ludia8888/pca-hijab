// Google Analytics 4 Event Tracking Utilities
import { VercelAnalytics } from './vercelAnalytics';

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string,
      config?: Record<string, any>
    ) => void;
  }
}

// GA4 Measurement ID
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID || 'G-JXPF7BL260';

// Initialize GA4 - 기본 초기화만 유지
export const initializeGA4 = (): void => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('config', GA_MEASUREMENT_ID);
  }
};

// 기본 페이지뷰만 유지
export const trackPageView = (path: string): void => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'page_view', {
      page_path: path,
    });
  }
};

// 기본 이벤트 트래킹 함수만 유지
export const trackEvent = (
  eventName: string,
  parameters?: Record<string, any>
): void => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', eventName, parameters);
  }
};

// Vercel Analytics만 유지된 트래킹 함수들
export const trackSessionStart = (instagramId: string): void => {
  VercelAnalytics.sessionStart(instagramId);
};

export const trackImageUpload = (success: boolean, fileSize?: number, fileType?: string): void => {
  if (success && fileSize && fileType) {
    VercelAnalytics.imageUpload(fileSize, fileType);
  }
};

export const trackAIAnalysis = (result: {
  personalColorType: string;
  season: string;
  tone: string;
  confidence: number;
  processingTime?: number;
}): void => {
  VercelAnalytics.analysisComplete({
    personalColorType: result.personalColorType,
    season: result.season,
    tone: result.tone,
    confidence: result.confidence,
    processingTime: result.processingTime || 0
  });
};

export const trackRecommendationRequest = (instagramId: string, personalColorType: string): void => {
  VercelAnalytics.recommendationRequest(instagramId, personalColorType);
};

export const trackResultDownload = (personalColor: string): void => {
  VercelAnalytics.resultShare('download');
};

// GA4 커스텀 이벤트들은 주석처리
/*
// Track session start
export const trackSessionStart = (instagramId: string): void => {
  trackEvent('session_start', {
    event_category: 'engagement',
    instagram_id: instagramId,
  });
};

// Track image upload
export const trackImageUpload = (success: boolean, fileSize?: number, fileType?: string): void => {
  trackEvent('image_upload', {
    event_category: 'user_action',
    success: success,
  });
};

// Track AI analysis
export const trackAIAnalysis = (result: {
  personalColorType: string;
  season: string;
  tone: string;
  confidence: number;
  processingTime?: number;
}): void => {
  trackEvent('ai_analysis_complete', {
    event_category: 'conversion',
    personal_color: result.personalColorType,
    confidence: result.confidence,
  });
};

// Track preference submission
export const trackPreferenceSubmit = (preferences: {
  style?: string[];
  priceRange?: string;
  material?: string[];
  occasion?: string[];
}): void => {
  trackEvent('preference_submit', {
    event_category: 'user_action',
    style_count: preferences.style?.length || 0,
    price_range: preferences.priceRange,
    material_count: preferences.material?.length || 0,
    occasion_count: preferences.occasion?.length || 0,
  });
};

// Track recommendation request
export const trackRecommendationRequest = (instagramId: string, personalColorType: string): void => {
  trackEvent('recommendation_request', {
    event_category: 'conversion',
    instagram_id: instagramId,
    personal_color_type: personalColorType,
  });
};

// Track result download
export const trackResultDownload = (personalColor: string): void => {
  trackEvent('result_download', {
    event_category: 'user_action',
    personal_color: personalColor,
  });
};

// Track flow completion
export const trackFlowCompletion = (duration: number): void => {
  trackEvent('flow_complete', {
    event_category: 'conversion',
    value: 1,
    duration_seconds: Math.round(duration / 1000),
  });
};

// Track drop-off
export const trackDropOff = (step: string): void => {
  trackEvent('drop_off', {
    event_category: 'user_action',
    step: step,
  });
};
*/