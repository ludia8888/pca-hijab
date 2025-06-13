import ReactGA from 'react-ga4';

// GA4 Configuration
const GA4_MEASUREMENT_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID;
const GA4_API_SECRET = import.meta.env.VITE_GA4_API_SECRET;

// Initialize GA4
export const initializeGA4 = (): void => {
  if (!GA4_MEASUREMENT_ID) {
    console.warn('GA4 Measurement ID not found. Analytics will not be tracked.');
    return;
  }

  ReactGA.initialize(GA4_MEASUREMENT_ID, {
    testMode: process.env.NODE_ENV === 'development',
    gtagOptions: {
      debug_mode: process.env.NODE_ENV === 'development',
    },
  });

  console.log('GA4 initialized with ID:', GA4_MEASUREMENT_ID);
};

// Custom Event Types
export interface GAEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}

// Track Page View
export const trackPageView = (page: string, title?: string): void => {
  if (!GA4_MEASUREMENT_ID) return;
  
  ReactGA.send({ 
    hitType: 'pageview', 
    page,
    title: title || document.title 
  });
};

// Track Custom Events
export const trackEvent = (event: GAEvent): void => {
  if (!GA4_MEASUREMENT_ID) return;

  ReactGA.event(event.action, {
    category: event.category,
    label: event.label,
    value: event.value,
    ...event.custom_parameters,
  });
};

// Predefined Events for PCA-Hijab
export const AnalyticsEvents = {
  // User Journey Events
  PAGE_VIEW: (page: string) => trackPageView(page),
  
  // Image Upload & Analysis
  IMAGE_UPLOAD_START: () => trackEvent({
    action: 'image_upload_start',
    category: 'user_interaction',
    label: 'photo_upload'
  }),
  
  IMAGE_UPLOAD_SUCCESS: () => trackEvent({
    action: 'image_upload_success',
    category: 'user_interaction',
    label: 'photo_upload'
  }),
  
  ANALYSIS_START: () => trackEvent({
    action: 'analysis_start',
    category: 'personal_color',
    label: 'ai_analysis'
  }),
  
  ANALYSIS_COMPLETE: (personalColor: string, confidence: number) => trackEvent({
    action: 'analysis_complete',
    category: 'personal_color',
    label: personalColor,
    value: Math.round(confidence * 100),
    custom_parameters: {
      personal_color: personalColor,
      confidence_score: confidence
    }
  }),
  
  // User Preferences & Recommendations
  PREFERENCES_START: () => trackEvent({
    action: 'preferences_start',
    category: 'user_flow',
    label: 'hijab_preferences'
  }),
  
  RECOMMENDATION_REQUEST: (personalColor: string, preferences: any) => trackEvent({
    action: 'recommendation_request',
    category: 'conversion',
    label: personalColor,
    custom_parameters: {
      personal_color: personalColor,
      style_preferences: preferences.style?.join(','),
      price_range: preferences.priceRange,
      material_preferences: preferences.material?.join(',')
    }
  }),
  
  // Result Sharing
  RESULT_SHARE: (method: 'instagram' | 'copy' | 'download') => trackEvent({
    action: 'result_share',
    category: 'engagement',
    label: method
  }),
  
  // Admin Events
  ADMIN_LOGIN: () => trackEvent({
    action: 'admin_login',
    category: 'admin',
    label: 'authentication'
  }),
  
  ADMIN_VIEW_USER: (userId: string) => trackEvent({
    action: 'admin_view_user',
    category: 'admin',
    label: 'user_management',
    custom_parameters: {
      user_id: userId
    }
  }),
  
  ADMIN_UPDATE_STATUS: (status: string) => trackEvent({
    action: 'admin_update_status',
    category: 'admin',
    label: status
  }),
  
  // Error Events
  ERROR_ANALYSIS_FAILED: (error: string) => trackEvent({
    action: 'error_analysis_failed',
    category: 'error',
    label: 'ai_analysis',
    custom_parameters: {
      error_message: error
    }
  }),
  
  ERROR_UPLOAD_FAILED: (error: string) => trackEvent({
    action: 'error_upload_failed',
    category: 'error',
    label: 'photo_upload',
    custom_parameters: {
      error_message: error
    }
  })
};

// User Properties (for segmentation)
export const setUserProperties = (properties: {
  user_type?: 'analysis_only' | 'recommendation_request';
  personal_color?: string;
  device_type?: 'mobile' | 'desktop';
}): void => {
  if (!GA4_MEASUREMENT_ID) return;
  
  ReactGA.set(properties);
};

// E-commerce Events (for conversion tracking)
export const trackConversion = (eventName: string, value?: number): void => {
  if (!GA4_MEASUREMENT_ID) return;
  
  ReactGA.event(eventName, {
    value: value || 1,
    currency: 'USD'
  });
};