import { useState } from 'react';
import { Card } from '@/components/ui';
import { 
  ChevronRight, 
  ChevronDown,
  Users,
  Clock,
  AlertTriangle,
  Target,
  MousePointer,
  Eye,
  FormInput,
  Upload,
  Search,
  CheckCircle
} from 'lucide-react';

interface DetailedFunnelStep {
  id: string;
  name: string;
  category: 'landing' | 'input' | 'upload' | 'analysis' | 'result' | 'form' | 'completion';
  users: number;
  conversionRate: number;
  dropOffRate: number;
  avgTimeSpent: number;
  bounceRate: number;
  errorRate: number;
  retryAttempts: number;
  topDropOffReasons: Array<{ reason: string; count: number; percentage: number }>;
  topErrors: Array<{ error: string; count: number }>;
  userBehavior: {
    avgScrollDepth: number;
    clickCount: number;
    hoverCount: number;
    interactionRate: number;
  };
  subSteps?: DetailedFunnelStep[];
}

interface DetailedFunnelVisualizationProps {
  funnelData: DetailedFunnelStep[];
  timeRange: '1h' | '24h' | '7d' | '30d';
  onTimeRangeChange: (range: '1h' | '24h' | '7d' | '30d') => void;
}

const getCategoryIcon = (category: string) => {
  const icons = {
    landing: Eye,
    input: FormInput,
    upload: Upload,
    analysis: Search,
    result: Target,
    form: FormInput,
    completion: CheckCircle
  };
  return icons[category as keyof typeof icons] || Target;
};

const getCategoryColor = (category: string) => {
  const colors = {
    landing: 'bg-blue-500',
    input: 'bg-green-500',
    upload: 'bg-purple-500',
    analysis: 'bg-orange-500',
    result: 'bg-pink-500',
    form: 'bg-indigo-500',
    completion: 'bg-emerald-500'
  };
  return colors[category as keyof typeof colors] || 'bg-gray-500';
};

export const DetailedFunnelVisualization = ({
  funnelData,
  timeRange,
  onTimeRangeChange
}: DetailedFunnelVisualizationProps): JSX.Element => {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [selectedMetric, setSelectedMetric] = useState<'users' | 'time' | 'errors' | 'behavior'>('users');

  const toggleExpanded = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const maxUsers = Math.max(...funnelData.map(step => step.users));

  const getStepWidth = (users: number): number => {
    return Math.max((users / maxUsers) * 100, 15);
  };

  const getMetricColor = (value: number, type: 'conversion' | 'error' | 'bounce') => {
    if (type === 'conversion') {
      if (value >= 80) return 'text-green-600';
      if (value >= 60) return 'text-yellow-600';
      return 'text-red-600';
    } else {
      if (value <= 10) return 'text-green-600';
      if (value <= 30) return 'text-yellow-600';
      return 'text-red-600';
    }
  };

  const renderStepDetails = (step: DetailedFunnelStep, isSubStep = false) => {
    const Icon = getCategoryIcon(step.category);
    const isExpanded = expandedSteps.has(step.id);

    return (
      <div key={step.id} className={`${isSubStep ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''}`}>
        {/* 메인 스텝 */}
        <div 
          className="relative cursor-pointer group"
          onClick={() => step.subSteps && toggleExpanded(step.id)}
        >
          {/* 퍼널 바 */}
          <div 
            className={`relative ${getCategoryColor(step.category)} text-white rounded-lg p-4 mx-auto transition-all duration-300 hover:shadow-lg`}
            style={{ 
              width: `${getStepWidth(step.users)}%`,
              minWidth: isSubStep ? '200px' : '300px'
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5" />
                <div>
                  <h3 className={`${isSubStep ? 'text-sm' : 'text-lg'} font-semibold flex items-center gap-2`}>
                    {step.name}
                    {step.subSteps && (
                      isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                    )}
                  </h3>
                  <div className="flex items-center gap-4 mt-1 text-xs opacity-90">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {step.users.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {Math.round(step.avgTimeSpent / 1000)}s
                    </span>
                    {step.errorRate > 0 && (
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {step.errorRate}%
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className={`text-xl font-bold ${getMetricColor(step.conversionRate, 'conversion')}`}>
                  {step.conversionRate}%
                </div>
                <div className="text-xs opacity-90">전환율</div>
                {step.dropOffRate > 0 && (
                  <div className={`text-sm ${getMetricColor(step.dropOffRate, 'error')}`}>
                    -{step.dropOffRate}% 이탈
                  </div>
                )}
              </div>
            </div>

            {/* 상세 메트릭 (확장 시) */}
            {isExpanded && (
              <div className="mt-4 pt-4 border-t border-white/20 space-y-3">
                {/* 행동 메트릭 */}
                <div>
                  <h4 className="font-medium mb-2">사용자 행동</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>스크롤 깊이: {step.userBehavior.avgScrollDepth}%</div>
                    <div>클릭 수: {step.userBehavior.clickCount}회</div>
                    <div>상호작용률: {step.userBehavior.interactionRate}%</div>
                    <div>재시도: {step.retryAttempts}회</div>
                  </div>
                </div>

                {/* 이탈 원인 */}
                {step.topDropOffReasons.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">주요 이탈 원인</h4>
                    <div className="space-y-1">
                      {step.topDropOffReasons.slice(0, 3).map((reason, idx) => (
                        <div key={idx} className="flex justify-between text-xs">
                          <span>{reason.reason}</span>
                          <span>{reason.percentage}% ({reason.count}명)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 에러 정보 */}
                {step.topErrors.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">주요 에러</h4>
                    <div className="space-y-1">
                      {step.topErrors.slice(0, 2).map((error, idx) => (
                        <div key={idx} className="flex justify-between text-xs">
                          <span className="text-red-200">{error.error}</span>
                          <span>{error.count}회</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 서브 스텝들 */}
        {isExpanded && step.subSteps && (
          <div className="mt-4 space-y-2">
            {step.subSteps.map(subStep => renderStepDetails(subStep, true))}
          </div>
        )}

        {/* 단계간 이탈 표시 */}
        {!isSubStep && step.dropOffRate > 0 && (
          <div className="flex items-center justify-center py-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-full">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-700">
                {Math.round((step.dropOffRate / 100) * step.users)}명 이탈 ({step.dropOffRate}%)
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 헤더 및 컨트롤 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">초세밀 퍼널 분석</h2>
        <div className="flex gap-2">
          {(['1h', '24h', '7d', '30d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => onTimeRangeChange(range)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* 범례 */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4 text-sm">
          {Object.entries({
            landing: '랜딩',
            input: '입력',
            upload: '업로드', 
            analysis: '분석',
            result: '결과',
            form: '폼',
            completion: '완료'
          }).map(([key, label]) => (
            <div key={key} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded ${getCategoryColor(key)}`}></div>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* 퍼널 시각화 */}
      <Card className="p-6">
        <div className="space-y-6">
          {funnelData.map(step => renderStepDetails(step))}
        </div>
      </Card>

      {/* 요약 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {funnelData[0]?.users.toLocaleString() || 0}
            </div>
            <div className="text-sm text-gray-600">총 시작</div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {funnelData[funnelData.length - 1]?.users.toLocaleString() || 0}
            </div>
            <div className="text-sm text-gray-600">최종 완료</div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(funnelData.reduce((acc, step) => Math.max(acc, step.dropOffRate), 0))}%
            </div>
            <div className="text-sm text-gray-600">최대 이탈률</div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(funnelData.reduce((acc, step) => acc + step.avgTimeSpent, 0) / 1000 / funnelData.length)}s
            </div>
            <div className="text-sm text-gray-600">평균 시간</div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {Math.round(funnelData.reduce((acc, step) => Math.max(acc, step.errorRate), 0))}%
            </div>
            <div className="text-sm text-gray-600">최대 에러율</div>
          </div>
        </Card>
      </div>
    </div>
  );
};