import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD 
    ? (() => { throw new Error('VITE_API_URL environment variable is required in production'); })()
    : 'http://localhost:5001'
  );

export interface AnalyticsDashboardData {
  realTime: {
    activeUsers: number;
  };
  funnel: {
    sessions: number;
    uploads: number;
    analyses: number;
    recommendations: number;
  };
  personalColors: Record<string, number>;
  dropOff: Array<{
    step: string;
    count: number;
  }>;
  conversions: {
    sessionToUpload: number;
    uploadToAnalysis: number;
    analysisToRecommendation: number;
    overallConversion: number;
  };
  timestamp: string;
}

class AnalyticsAPI {
  private apiKey: string | null = null;

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  private getHeaders(): Record<string, string> {
    if (!this.apiKey) {
      throw new Error('API key not set');
    }
    return {
      'x-api-key': this.apiKey,
      'Content-Type': 'application/json',
    };
  }

  async getDashboardData(): Promise<AnalyticsDashboardData> {
    const response = await axios.get(`${API_URL}/api/analytics/dashboard`, {
      headers: this.getHeaders(),
    });
    return response.data.data;
  }

  async getFunnelData(): Promise<{
    sessions: number;
    uploads: number;
    analyses: number;
    recommendations: number;
  }> {
    const response = await axios.get(`${API_URL}/api/analytics/funnel`, {
      headers: this.getHeaders(),
    });
    return response.data.data;
  }

  async getColorDistribution(): Promise<Record<string, number>> {
    const response = await axios.get(`${API_URL}/api/analytics/colors`, {
      headers: this.getHeaders(),
    });
    return response.data.data;
  }

  async getDropOffData(): Promise<Array<{ step: string; count: number }>> {
    const response = await axios.get(`${API_URL}/api/analytics/dropoff`, {
      headers: this.getHeaders(),
    });
    return response.data.data;
  }

  async getConversionMetrics(): Promise<{
    sessionToUpload: number;
    uploadToAnalysis: number;
    analysisToRecommendation: number;
    overallConversion: number;
  }> {
    const response = await axios.get(`${API_URL}/api/analytics/conversions`, {
      headers: this.getHeaders(),
    });
    return response.data.data;
  }
}

export const analyticsAPI = new AnalyticsAPI();