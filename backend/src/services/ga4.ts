import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { google } from '@google-analytics/data/build/protos/protos';

// GA4 Property ID
const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID || '455997076'; // Replace with actual property ID

// Initialize the Analytics Data API client
let analyticsDataClient: BetaAnalyticsDataClient | null = null;

// Initialize GA4 client
export const initializeGA4Client = async (): Promise<void> => {
  try {
    // Initialize with service account credentials if available
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      analyticsDataClient = new BetaAnalyticsDataClient();
    } else {
      console.warn('GA4 API credentials not configured');
    }
  } catch (error) {
    console.error('Failed to initialize GA4 client:', error);
  }
};

// Get real-time active users
export const getRealTimeActiveUsers = async (): Promise<number> => {
  if (!analyticsDataClient) return 0;
  
  try {
    const [response] = await analyticsDataClient.runRealtimeReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      metrics: [{ name: 'activeUsers' }],
    });
    
    return parseInt(response.rows?.[0]?.metricValues?.[0]?.value || '0', 10);
  } catch (error) {
    console.error('Error fetching real-time users:', error);
    return 0;
  }
};

// Get today's funnel data
export const getTodaysFunnelData = async (): Promise<{
  sessions: number;
  uploads: number;
  analyses: number;
  recommendations: number;
}> => {
  if (!analyticsDataClient) {
    return { sessions: 0, uploads: 0, analyses: 0, recommendations: 0 };
  }
  
  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      dateRanges: [{ startDate: 'today', endDate: 'today' }],
      dimensions: [{ name: 'eventName' }],
      metrics: [{ name: 'eventCount' }],
      dimensionFilter: {
        filter: {
          inListFilter: {
            values: [
              'session_start',
              'image_upload',
              'ai_analysis_complete',
              'recommendation_request'
            ],
          },
        },
      },
    });
    
    const funnelData = {
      sessions: 0,
      uploads: 0,
      analyses: 0,
      recommendations: 0,
    };
    
    response.rows?.forEach(row => {
      const eventName = row.dimensionValues?.[0]?.value;
      const count = parseInt(row.metricValues?.[0]?.value || '0', 10);
      
      switch (eventName) {
        case 'session_start':
          funnelData.sessions = count;
          break;
        case 'image_upload':
          funnelData.uploads = count;
          break;
        case 'ai_analysis_complete':
          funnelData.analyses = count;
          break;
        case 'recommendation_request':
          funnelData.recommendations = count;
          break;
      }
    });
    
    return funnelData;
  } catch (error) {
    console.error('Error fetching funnel data:', error);
    return { sessions: 0, uploads: 0, analyses: 0, recommendations: 0 };
  }
};

// Get personal color distribution
export const getPersonalColorDistribution = async (): Promise<Record<string, number>> => {
  if (!analyticsDataClient) return {};
  
  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'customEvent:personal_color' }],
      metrics: [{ name: 'eventCount' }],
      dimensionFilter: {
        filter: {
          fieldName: 'eventName',
          stringFilter: {
            value: 'ai_analysis_complete',
          },
        },
      },
    });
    
    const distribution: Record<string, number> = {};
    
    response.rows?.forEach(row => {
      const color = row.dimensionValues?.[0]?.value || 'unknown';
      const count = parseInt(row.metricValues?.[0]?.value || '0', 10);
      distribution[color] = count;
    });
    
    return distribution;
  } catch (error) {
    console.error('Error fetching color distribution:', error);
    return {};
  }
};

// Get drop-off analysis
export const getDropOffAnalysis = async (): Promise<Array<{
  step: string;
  count: number;
}>> => {
  if (!analyticsDataClient) return [];
  
  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'customEvent:step' }],
      metrics: [{ name: 'eventCount' }],
      dimensionFilter: {
        filter: {
          fieldName: 'eventName',
          stringFilter: {
            value: 'drop_off',
          },
        },
      },
    });
    
    return response.rows?.map(row => ({
      step: row.dimensionValues?.[0]?.value || 'unknown',
      count: parseInt(row.metricValues?.[0]?.value || '0', 10),
    })) || [];
  } catch (error) {
    console.error('Error fetching drop-off data:', error);
    return [];
  }
};

// Get conversion metrics
export const getConversionMetrics = async (): Promise<{
  sessionToUpload: number;
  uploadToAnalysis: number;
  analysisToRecommendation: number;
  overallConversion: number;
}> => {
  if (!analyticsDataClient) {
    return {
      sessionToUpload: 0,
      uploadToAnalysis: 0,
      analysisToRecommendation: 0,
      overallConversion: 0,
    };
  }
  
  try {
    const funnel = await getTodaysFunnelData();
    
    return {
      sessionToUpload: funnel.sessions > 0 ? (funnel.uploads / funnel.sessions) * 100 : 0,
      uploadToAnalysis: funnel.uploads > 0 ? (funnel.analyses / funnel.uploads) * 100 : 0,
      analysisToRecommendation: funnel.analyses > 0 ? (funnel.recommendations / funnel.analyses) * 100 : 0,
      overallConversion: funnel.sessions > 0 ? (funnel.recommendations / funnel.sessions) * 100 : 0,
    };
  } catch (error) {
    console.error('Error calculating conversions:', error);
    return {
      sessionToUpload: 0,
      uploadToAnalysis: 0,
      analysisToRecommendation: 0,
      overallConversion: 0,
    };
  }
};