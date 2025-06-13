import { useState } from 'react';
import { Card } from '@/components/ui';
import { BarChart3, Users, TrendingDown } from 'lucide-react';

interface FunnelStep {
  id: string;
  name: string;
  users: number;
  conversionRate: number;
  dropOffCount: number;
  avgTimeSpent: number;
  errorCount?: number;
}

// 간단한 퍼널 데이터
const funnelSteps: FunnelStep[] = [
  { id: 'landing', name: '홈페이지 방문', users: 10000, conversionRate: 100, dropOffCount: 0, avgTimeSpent: 15 },
  { id: 'hero_view', name: '히어로 섹션 확인', users: 8500, conversionRate: 85, dropOffCount: 1500, avgTimeSpent: 8 },
  { id: 'form_focus', name: '인스타그램 폼 포커스', users: 7800, conversionRate: 78, dropOffCount: 700, avgTimeSpent: 12 },
  { id: 'typing_start', name: '인스타그램 ID 입력 시작', users: 7200, conversionRate: 72, dropOffCount: 600, avgTimeSpent: 25 },
  { id: 'input_complete', name: '인스타그램 ID 입력 완료', users: 6800, conversionRate: 68, dropOffCount: 400, avgTimeSpent: 18 },
  { id: 'submit_click', name: '제출 버튼 클릭', users: 6500, conversionRate: 65, dropOffCount: 300, avgTimeSpent: 8 },
  { id: 'upload_page', name: '업로드 페이지 진입', users: 6200, conversionRate: 62, dropOffCount: 300, avgTimeSpent: 5 },
  { id: 'instructions_read', name: '업로드 설명 읽기', users: 5800, conversionRate: 58, dropOffCount: 400, avgTimeSpent: 25 },
  { id: 'file_select', name: '파일 선택', users: 5500, conversionRate: 55, dropOffCount: 300, avgTimeSpent: 45 },
  { id: 'preview_view', name: '사진 미리보기', users: 5200, conversionRate: 52, dropOffCount: 300, avgTimeSpent: 30 },
  { id: 'upload_submit', name: '업로드 제출', users: 5000, conversionRate: 50, dropOffCount: 200, avgTimeSpent: 15 },
  { id: 'analysis_init', name: '분석 시작', users: 4800, conversionRate: 48, dropOffCount: 200, avgTimeSpent: 3 },
  { id: 'analysis_25', name: '분석 25%', users: 4700, conversionRate: 47, dropOffCount: 100, avgTimeSpent: 10 },
  { id: 'analysis_50', name: '분석 50%', users: 4650, conversionRate: 47, dropOffCount: 50, avgTimeSpent: 10 },
  { id: 'analysis_75', name: '분석 75%', users: 4620, conversionRate: 46, dropOffCount: 30, avgTimeSpent: 10 },
  { id: 'analysis_complete', name: '분석 완료', users: 4500, conversionRate: 45, dropOffCount: 120, avgTimeSpent: 15 },
  { id: 'result_view', name: '결과 확인', users: 4300, conversionRate: 43, dropOffCount: 200, avgTimeSpent: 60 },
  { id: 'color_view', name: '퍼스널 컬러 확인', users: 4100, conversionRate: 41, dropOffCount: 200, avgTimeSpent: 45 },
  { id: 'continue_click', name: '계속하기 클릭', users: 2050, conversionRate: 21, dropOffCount: 2050, avgTimeSpent: 30 },
  { id: 'preferences_start', name: '선호도 입력 시작', users: 2000, conversionRate: 20, dropOffCount: 50, avgTimeSpent: 10 },
  { id: 'style_select', name: '스타일 선택', users: 1900, conversionRate: 19, dropOffCount: 100, avgTimeSpent: 25 },
  { id: 'price_select', name: '가격대 선택', users: 1800, conversionRate: 18, dropOffCount: 100, avgTimeSpent: 15 },
  { id: 'material_select', name: '소재 선택', users: 1700, conversionRate: 17, dropOffCount: 100, avgTimeSpent: 20 },
  { id: 'occasion_select', name: '용도 선택', users: 1600, conversionRate: 16, dropOffCount: 100, avgTimeSpent: 18 },
  { id: 'form_submit', name: '추천 요청 제출', users: 1500, conversionRate: 15, dropOffCount: 100, avgTimeSpent: 12 },
  { id: 'completion', name: '완료', users: 1450, conversionRate: 15, dropOffCount: 50, avgTimeSpent: 20 }
];

export const SimpleFunnelDashboard = (): JSX.Element => {
  const [hoveredStep, setHoveredStep] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('24h');

  const maxUsers = funnelSteps[0].users;
  const finalUsers = funnelSteps[funnelSteps.length - 1].users;
  const overallConversion = Math.round((finalUsers / maxUsers) * 100);
  const biggestDropOff = funnelSteps.reduce((max, step) => 
    step.dropOffCount > max.dropOffCount ? step : max, funnelSteps[0]
  );

  const getStepWidth = (users: number): number => {
    return Math.max((users / maxUsers) * 100, 8);
  };

  const getDropOffColor = (dropOffCount: number): string => {
    const dropOffRate = (dropOffCount / maxUsers) * 100;
    if (dropOffRate < 1) return 'text-green-600';
    if (dropOffRate < 3) return 'text-yellow-600';
    if (dropOffRate < 5) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          실시간 퍼널 분석
        </h2>
        <div className="flex gap-2">
          {(['1h', '24h', '7d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
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

      {/* 요약 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{maxUsers.toLocaleString()}</div>
            <div className="text-sm text-gray-600">총 시작</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{finalUsers.toLocaleString()}</div>
            <div className="text-sm text-gray-600">최종 완료</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{overallConversion}%</div>
            <div className="text-sm text-gray-600">전체 전환율</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{biggestDropOff.dropOffCount.toLocaleString()}</div>
            <div className="text-sm text-gray-600">최대 이탈</div>
            <div className="text-xs text-gray-500">{biggestDropOff.name}</div>
          </div>
        </Card>
      </div>

      {/* 퍼널 시각화 */}
      <Card className="p-6">
        <div className="space-y-3">
          {funnelSteps.map((step, index) => {
            const isHovered = hoveredStep === step.id;
            const previousStep = funnelSteps[index - 1];
            const dropOffFromPrevious = previousStep ? previousStep.users - step.users : 0;
            
            return (
              <div key={step.id} className="relative">
                {/* 이탈 표시 (첫 번째 단계 제외) */}
                {index > 0 && dropOffFromPrevious > 0 && (
                  <div className="flex items-center justify-center py-1">
                    <div className="flex items-center gap-2 px-3 py-1 bg-red-50 rounded-full">
                      <TrendingDown className="w-3 h-3 text-red-500" />
                      <span className={`text-xs font-medium ${getDropOffColor(dropOffFromPrevious)}`}>
                        -{dropOffFromPrevious.toLocaleString()}명
                      </span>
                    </div>
                  </div>
                )}

                {/* 퍼널 단계 */}
                <div
                  className={`relative cursor-pointer transition-all duration-200 ${
                    isHovered ? 'transform scale-[1.02] z-10' : ''
                  }`}
                  onMouseEnter={() => setHoveredStep(step.id)}
                  onMouseLeave={() => setHoveredStep(null)}
                >
                  <div 
                    className={`relative bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-3 mx-auto shadow-sm transition-all duration-200 ${
                      isHovered ? 'shadow-lg ring-2 ring-blue-300' : ''
                    }`}
                    style={{ 
                      width: `${getStepWidth(step.users)}%`,
                      minWidth: '250px'
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-sm">{step.name}</h3>
                        <div className="flex items-center gap-3 mt-1 text-xs opacity-90">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {step.users.toLocaleString()}명
                          </span>
                          <span>{step.avgTimeSpent}초</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{step.conversionRate}%</div>
                        <div className="text-xs opacity-75">전환율</div>
                      </div>
                    </div>

                    {/* 호버시 상세 정보 툴팁 */}
                    {isHovered && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-black text-white p-3 rounded-lg shadow-lg text-xs min-w-[200px] z-20">
                        <div className="space-y-1">
                          <div className="font-medium">{step.name}</div>
                          <div>사용자 수: {step.users.toLocaleString()}명</div>
                          <div>전환율: {step.conversionRate}%</div>
                          <div>평균 체류시간: {step.avgTimeSpent}초</div>
                          {step.dropOffCount > 0 && (
                            <div className="text-red-300">이탈: {step.dropOffCount.toLocaleString()}명</div>
                          )}
                          {step.errorCount && step.errorCount > 0 && (
                            <div className="text-yellow-300">에러: {step.errorCount}건</div>
                          )}
                        </div>
                        {/* 화살표 */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 주요 개선점 */}
      <Card className="p-4 bg-amber-50 border-amber-200">
        <div className="flex items-start gap-3">
          <TrendingDown className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-amber-900">🎯 주요 개선 포인트</h3>
            <div className="text-sm text-amber-700 mt-1">
              <p>• <strong>"{biggestDropOff.name}"</strong>에서 {biggestDropOff.dropOffCount.toLocaleString()}명 이탈 - 가장 큰 손실 지점</p>
              <p>• 분석 완료 후 선호도 입력으로 넘어가는 지점에서 50% 이탈 - 동기부여 강화 필요</p>
              <p>• 전체 전환율 {overallConversion}% - 목표 20% 달성을 위한 개선 필요</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};