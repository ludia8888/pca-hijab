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
  
  // Also track with Vercel Analytics
  VercelAnalytics.sessionStart(instagramId);
};

// Track image upload
export const trackImageUpload = (success: boolean, fileSize?: number, fileType?: string): void => {
  trackEvent('image_upload', {
    event_category: 'user_action',
    success: success,
  });
  
  // Also track with Vercel Analytics
  if (success && fileSize && fileType) {
    VercelAnalytics.imageUpload(fileSize, fileType);
  }
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
  
  // Also track with Vercel Analytics
  VercelAnalytics.analysisComplete({
    personalColorType: result.personalColorType,
    season: result.season,
    tone: result.tone,
    confidence: result.confidence,
    processingTime: result.processingTime || 0
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
  
  // Also track with Vercel Analytics
  VercelAnalytics.recommendationRequest(instagramId, personalColorType);
};

// Track result download
export const trackResultDownload = (personalColor: string): void => {
  trackEvent('result_download', {
    event_category: 'user_action',
    personal_color: personalColor,
  });
  
  // Also track with Vercel Analytics
  VercelAnalytics.resultShare('download');
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