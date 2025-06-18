import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Clock,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { Card } from '@/components/ui';
import type { InsightsDashboard as InsightsDashboardType } from '@/types/admin';

interface InsightsDashboardProps {
  insights: InsightsDashboardType;
}

const InsightsDashboard: React.FC<InsightsDashboardProps> = ({ insights }) => {
  // 메트릭 카드 컴포넌트
  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    change?: number;
    icon: React.ReactNode;
    color: string;
    format?: 'percentage' | 'number' | 'time';
  }> = ({ title, value, change, icon, color, format = 'number' }) => {
    const formatValue = () => {
      if (format === 'percentage' && typeof value === 'number') {
        return `${Math.round(value * 100)}%`;
      }
      if (format === 'time' && typeof value === 'number') {
        return `${value}시간`;
      }
      return value;
    };

    return (
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatValue()}
            </p>
            {change !== undefined && (
              <div className="flex items-center mt-2">
                {change > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm ml-1 ${
                  change > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {Math.abs(change)}%
                </span>
                <span className="text-sm text-gray-500 ml-1">vs 지난주</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            {icon}
          </div>
        </div>
      </Card>
    );
  };

  // 전환율 진행바 컴포넌트
  const ConversionFunnel: React.FC = () => {
    const stages = [
      {
        label: '가입',
        rate: 1,
        color: 'bg-blue-500',
        count: Math.round(1 / insights.metrics.conversionRates.signupToDiagnosis)
      },
      {
        label: '진단',
        rate: insights.metrics.conversionRates.signupToDiagnosis,
        color: 'bg-green-500',
        count: Math.round(insights.metrics.conversionRates.signupToDiagnosis * 100)
      },
      {
        label: '추천 요청',
        rate: insights.metrics.conversionRates.diagnosisToRecommendation,
        color: 'bg-yellow-500',
        count: Math.round(insights.metrics.conversionRates.diagnosisToRecommendation * 100)
      },
      {
        label: '추천 완료',
        rate: insights.metrics.conversionRates.recommendationToCompletion,
        color: 'bg-purple-500',
        count: Math.round(insights.metrics.conversionRates.recommendationToCompletion * 100)
      }
    ];

    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5" />
          전환율 퍼널
        </h3>
        <div className="space-y-4">
          {stages.map((stage, index) => (
            <div key={stage.label}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {stage.label}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {stage.count}명
                  </span>
                  <span className="text-sm font-semibold">
                    {Math.round(stage.rate * 100)}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${stage.color}`}
                  style={{ width: `${stage.rate * 100}%` }}
                />
              </div>
              {index < stages.length - 1 && (
                <div className="flex justify-center my-2">
                  <div className="w-0.5 h-4 bg-gray-300" />
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    );
  };

  // 퍼스널 컬러 분포 차트
  const PersonalColorDistribution: React.FC = () => {
    const colors = [
      { season: 'spring', label: '봄', color: 'bg-pink-500', count: insights.trends.personalColorDistribution.spring },
      { season: 'summer', label: '여름', color: 'bg-blue-500', count: insights.trends.personalColorDistribution.summer },
      { season: 'autumn', label: '가을', color: 'bg-orange-500', count: insights.trends.personalColorDistribution.autumn },
      { season: 'winter', label: '겨울', color: 'bg-purple-500', count: insights.trends.personalColorDistribution.winter }
    ];

    const total = colors.reduce((sum, color) => sum + color.count, 0);

    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <PieChart className="w-5 h-5" />
          퍼스널 컬러 분포
        </h3>
        <div className="space-y-3">
          {colors.map(color => {
            const percentage = total > 0 ? (color.count / total) * 100 : 0;
            return (
              <div key={color.season} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${color.color}`} />
                  <span className="text-sm font-medium text-gray-700">
                    {color.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {color.count}명
                  </span>
                  <span className="text-sm font-semibold min-w-[3rem] text-right">
                    {Math.round(percentage)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    );
  };

  // 알림 카드
  const AlertsCard: React.FC = () => {
    const hasAlerts = insights.alerts.highAtRiskUsers > 0 || 
                     insights.alerts.stalledProcesses > 0 || 
                     insights.alerts.longPendingRequests > 0;

    return (
      <Card className={`p-6 ${hasAlerts ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
          hasAlerts ? 'text-red-700' : 'text-green-700'
        }`}>
          {hasAlerts ? (
            <AlertTriangle className="w-5 h-5" />
          ) : (
            <CheckCircle className="w-5 h-5" />
          )}
          시스템 알림
        </h3>
        
        {hasAlerts ? (
          <div className="space-y-3">
            {insights.alerts.highAtRiskUsers > 0 && (
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                <span className="text-sm text-red-700">이탈 위험 사용자</span>
                <span className="text-sm font-bold text-red-900">
                  {insights.alerts.highAtRiskUsers}명
                </span>
              </div>
            )}
            
            {insights.alerts.stalledProcesses > 0 && (
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200">
                <span className="text-sm text-orange-700">중단된 프로세스</span>
                <span className="text-sm font-bold text-orange-900">
                  {insights.alerts.stalledProcesses}개
                </span>
              </div>
            )}
            
            {insights.alerts.longPendingRequests > 0 && (
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-yellow-200">
                <span className="text-sm text-yellow-700">오래 대기 중인 요청</span>
                <span className="text-sm font-bold text-yellow-900">
                  {insights.alerts.longPendingRequests}개
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-2" />
            <p className="text-sm text-green-700">모든 지표가 정상입니다</p>
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">인사이트 대시보드</h2>
        <p className="text-gray-600 mt-1">비즈니스 현황과 트렌드 분석</p>
      </div>

      {/* 핵심 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="전체 전환율"
          value={insights.metrics.conversionRates.overall}
          change={5.2}
          icon={<Target className="w-6 h-6 text-white" />}
          color="bg-blue-500"
          format="percentage"
        />
        
        <MetricCard
          title="일일 신규 가입"
          value={insights.metrics.volumes.dailySignups}
          change={12.3}
          icon={<Users className="w-6 h-6 text-white" />}
          color="bg-green-500"
        />
        
        <MetricCard
          title="대기 중인 추천"
          value={insights.metrics.volumes.pendingRecommendations}
          change={-8.1}
          icon={<Clock className="w-6 h-6 text-white" />}
          color="bg-yellow-500"
        />
        
        <MetricCard
          title="평균 완료 시간"
          value={insights.metrics.averageTimeToComplete.total}
          change={-15.4}
          icon={<Activity className="w-6 h-6 text-white" />}
          color="bg-purple-500"
          format="time"
        />
      </div>

      {/* 상세 분석 */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ConversionFunnel />
          
          {/* 일일 볼륨 */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              오늘의 활동
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {insights.metrics.volumes.dailySignups}
                </p>
                <p className="text-sm text-gray-600">신규 가입</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {insights.metrics.volumes.dailyDiagnoses}
                </p>
                <p className="text-sm text-gray-600">진단 완료</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {insights.metrics.volumes.dailyRecommendations}
                </p>
                <p className="text-sm text-gray-600">추천 완료</p>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="space-y-6">
          <PersonalColorDistribution />
          <AlertsCard />
        </div>
      </div>
    </div>
  );
};

export default InsightsDashboard;