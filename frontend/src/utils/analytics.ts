// Google Analytics 4 Event Tracking Utilities

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

// Initialize GA4
export const initGA = (): void => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('config', GA_MEASUREMENT_ID);
  }
};

// Track page views
export const trackPageView = (path: string): void => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'page_view', {
      page_path: path,
    });
  }
};

// Track custom events
export const trackEvent = (
  eventName: string,
  parameters?: Record<string, any>
): void => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', eventName, parameters);
  }
};

// Specific event tracking functions

// Track session start
export const trackSessionStart = (instagramId: string): void => {
  trackEvent('session_start', {
    event_category: 'engagement',
    instagram_id: instagramId,
  });
};

// Track image upload
export const trackImageUpload = (success: boolean): void => {
  trackEvent('image_upload', {
    event_category: 'user_action',
    success: success,
  });
};

// Track AI analysis
export const trackAIAnalysis = (personalColor: string, confidence: number): void => {
  trackEvent('ai_analysis_complete', {
    event_category: 'conversion',
    personal_color: personalColor,
    confidence: confidence,
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
export const trackRecommendationRequest = (recommendationId: string): void => {
  trackEvent('recommendation_request', {
    event_category: 'conversion',
    recommendation_id: recommendationId,
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