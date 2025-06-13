import { useState, useEffect } from 'react';
import { Card } from '@/components/ui';
import { TrendingDown, TrendingUp, Users, Clock, MousePointer, Eye } from 'lucide-react';

interface FunnelStep {
  id: string;
  name: string;
  users: number;
  conversionRate: number;
  dropOffRate: number;
  avgTimeSpent: number;
  topDropOffReasons: Array<{ reason: string; count: number }>;
}

interface FunnelVisualizationProps {
  funnelData: FunnelStep[];
  timeRange: '24h' | '7d' | '30d';
  onTimeRangeChange: (range: '24h' | '7d' | '30d') => void;
}

export const FunnelVisualization = ({ 
  funnelData, 
  timeRange, 
  onTimeRangeChange 
}: FunnelVisualizationProps): JSX.Element => {
  const [selectedStep, setSelectedStep] = useState<string | null>(null);

  const maxUsers = Math.max(...funnelData.map(step => step.users));

  const getFunnelWidth = (users: number): number => {
    return Math.max((users / maxUsers) * 100, 10);
  };

  const getDropOffColor = (dropOffRate: number): string => {
    if (dropOffRate < 20) return 'text-green-600 bg-green-100';
    if (dropOffRate < 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getConversionColor = (conversionRate: number): string => {
    if (conversionRate > 80) return 'text-green-600';
    if (conversionRate > 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* 헤더 및 시간 범위 선택 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">퍼널 분석</h2>
        <div className="flex gap-2">
          {(['24h', '7d', '30d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => onTimeRangeChange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range === '24h' ? '24시간' : range === '7d' ? '7일' : '30일'}
            </button>
          ))}
        </div>
      </div>

      {/* 퍼널 시각화 */}
      <Card className="p-6">
        <div className="space-y-4">
          {funnelData.map((step, index) => {
            const isSelected = selectedStep === step.id;
            const previousStep = index > 0 ? funnelData[index - 1] : null;
            const conversionFromPrevious = previousStep 
              ? Math.round((step.users / previousStep.users) * 100)
              : 100;

            return (
              <div key={step.id} className="relative">
                {/* 단계간 연결선 및 드롭오프 표시 */}
                {index > 0 && (
                  <div className="flex items-center justify-center py-2 text-sm">
                    <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full">
                      <TrendingDown className="w-4 h-4 text-red-500" />
                      <span className="text-gray-600">
                        {previousStep ? previousStep.users - step.users : 0}명 이탈
                      </span>
                      <span className={`font-medium ${getDropOffColor(step.dropOffRate)}`}>
                        ({step.dropOffRate}%)
                      </span>
                    </div>
                  </div>
                )}

                {/* 퍼널 단계 */}
                <div
                  className={`relative cursor-pointer transition-all duration-200 ${
                    isSelected ? 'transform scale-105' : ''
                  }`}
                  onClick={() => setSelectedStep(isSelected ? null : step.id)}
                >
                  {/* 퍼널 모양 */}
                  <div 
                    className="relative bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg p-6 mx-auto"
                    style={{ 
                      width: `${getFunnelWidth(step.users)}%`,
                      minWidth: '300px'
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold">{step.name}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{step.users.toLocaleString()}명</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{Math.round(step.avgTimeSpent / 1000)}초</span>
                          </div>
                          {index > 0 && (
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" />
                              <span className={getConversionColor(conversionFromPrevious)}>
                                {conversionFromPrevious}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          {step.conversionRate}%
                        </div>
                        <div className="text-sm opacity-90">전환율</div>
                      </div>
                    </div>

                    {/* 선택 시 상세 정보 */}
                    {isSelected && (
                      <div className="mt-4 pt-4 border-t border-white/20">
                        <h4 className="font-medium mb-2">주요 이탈 원인</h4>
                        <div className="space-y-1">
                          {step.topDropOffReasons.map((reason, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span>{reason.reason}</span>
                              <span>{reason.count}명</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 요약 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <div>
              <div className="text-2xl font-bold">
                {funnelData[0]?.users.toLocaleString() || 0}
              </div>
              <div className="text-sm text-gray-600">총 시작 사용자</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <div>
              <div className="text-2xl font-bold">
                {funnelData[funnelData.length - 1]?.users.toLocaleString() || 0}
              </div>
              <div className="text-sm text-gray-600">완료 사용자</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-purple-600" />
            <div>
              <div className="text-2xl font-bold">
                {funnelData.length > 0 
                  ? Math.round((funnelData[funnelData.length - 1].users / funnelData[0].users) * 100)
                  : 0}%
              </div>
              <div className="text-sm text-gray-600">전체 전환율</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <MousePointer className="w-5 h-5 text-orange-600" />
            <div>
              <div className="text-2xl font-bold">
                {funnelData.reduce((acc, step) => acc + step.avgTimeSpent, 0) / 1000 / funnelData.length || 0}s
              </div>
              <div className="text-sm text-gray-600">평균 소요시간</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};