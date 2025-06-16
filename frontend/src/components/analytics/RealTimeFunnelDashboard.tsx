import { useState, useEffect } from 'react';
import { Card } from '@/components/ui';
import { BarChart3, Users, TrendingDown, RefreshCw, Activity } from 'lucide-react';
import { analyticsAPI, AnalyticsDashboardData } from '@/services/api/analytics';
import { useAdminStore } from '@/store/useAdminStore';

interface FunnelStep {
  id: string;
  name: string;
  users: number;
  conversionRate: number;
  dropOffCount: number;
}

export const RealTimeFunnelDashboard = (): JSX.Element => {
  const [data, setData] = useState<AnalyticsDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { apiKey } = useAdminStore();

  // Convert GA4 data to funnel steps
  const convertToFunnelSteps = (analyticsData: AnalyticsDashboardData): FunnelStep[] => {
    const { funnel, dropOff } = analyticsData;
    const dropOffMap = new Map(dropOff.map(item => [item.step, item.count]));

    return [
      {
        id: 'sessions',
        name: '세션 시작',
        users: funnel.sessions,
        conversionRate: 100,
        dropOffCount: 0,
      },
      {
        id: 'uploads',
        name: '이미지 업로드',
        users: funnel.uploads,
        conversionRate: funnel.sessions > 0 ? (funnel.uploads / funnel.sessions) * 100 : 0,
        dropOffCount: funnel.sessions - funnel.uploads,
      },
      {
        id: 'analyses',
        name: 'AI 분석 완료',
        users: funnel.analyses,
        conversionRate: funnel.sessions > 0 ? (funnel.analyses / funnel.sessions) * 100 : 0,
        dropOffCount: funnel.uploads - funnel.analyses,
      },
      {
        id: 'recommendations',
        name: '추천 요청 완료',
        users: funnel.recommendations,
        conversionRate: funnel.sessions > 0 ? (funnel.recommendations / funnel.sessions) * 100 : 0,
        dropOffCount: funnel.analyses - funnel.recommendations,
      },
    ];
  };

  const loadData = async () => {
    if (!apiKey) return;
    
    try {
      setIsLoading(true);
      setError(null);
      analyticsAPI.setApiKey(apiKey);
      const dashboardData = await analyticsAPI.getDashboardData();
      setData(dashboardData);
    } catch (err) {
      console.error('Failed to load analytics data:', err);
      setError('GA4 데이터를 불러올 수 없습니다. API 설정을 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // Auto-refresh every 30 seconds
    if (autoRefresh) {
      const interval = setInterval(loadData, 30000);
      return () => clearInterval(interval);
    }
  }, [apiKey, autoRefresh]);

  if (isLoading && !data) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">데이터 로딩 중...</span>
        </div>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{error || 'GA4 데이터가 없습니다'}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
          >
            다시 시도
          </button>
        </div>
      </Card>
    );
  }

  const funnelSteps = convertToFunnelSteps(data);
  const maxUsers = funnelSteps[0].users || 1;

  return (
    <div className="space-y-6">
      {/* Real-time Active Users */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold">실시간 활성 사용자</h3>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              자동 새로고침
            </label>
            <button
              onClick={loadData}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              title="새로고침"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-green-600">{data.realTime.activeUsers}</div>
          <p className="text-sm text-gray-500 mt-1">현재 사이트 이용 중</p>
        </div>
      </Card>

      {/* Funnel Visualization */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            오늘의 사용자 퍼널
          </h3>
          <p className="text-sm text-gray-500">
            마지막 업데이트: {new Date(data.timestamp).toLocaleTimeString('ko-KR')}
          </p>
        </div>

        <div className="space-y-4">
          {funnelSteps.map((step, index) => (
            <div key={step.id} className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{step.name}</span>
                <span className="text-sm text-gray-600">
                  {step.users.toLocaleString()}명 ({step.conversionRate.toFixed(1)}%)
                </span>
              </div>
              
              <div className="relative h-12 bg-gray-100 rounded-lg overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-400 rounded-lg transition-all duration-500"
                  style={{ width: `${(step.users / maxUsers) * 100}%` }}
                />
                
                {step.dropOffCount > 0 && index < funnelSteps.length - 1 && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-red-600">
                    <TrendingDown className="w-3 h-3" />
                    -{step.dropOffCount}
                  </div>
                )}
              </div>

              {index < funnelSteps.length - 1 && (
                <div className="flex justify-center my-2">
                  <div className="w-0.5 h-4 bg-gray-300" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Conversion Metrics */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">전환율 분석</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {data.conversions.sessionToUpload.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-600">세션 → 업로드</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {data.conversions.uploadToAnalysis.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-600">업로드 → 분석</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                {data.conversions.analysisToRecommendation.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-600">분석 → 추천</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">
                {data.conversions.overallConversion.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-600">전체 전환율</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Personal Color Distribution */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          퍼스널 컬러 분포 (최근 30일)
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(data.personalColors).map(([color, count]) => (
            <div key={color} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium capitalize">{color}</span>
              <span className="text-sm text-gray-600">{count}명</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Drop-off Analysis */}
      {data.dropOff.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-600" />
            이탈 지점 분석 (최근 7일)
          </h3>
          <div className="space-y-2">
            {data.dropOff.map(({ step, count }) => (
              <div key={step} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <span className="text-sm">{step}</span>
                <span className="text-sm font-medium text-red-600">{count}명 이탈</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};