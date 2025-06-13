import { useState } from 'react';
import { Card } from '@/components/ui';
import { MousePointer, Eye, Clock, Zap } from 'lucide-react';

interface HeatmapData {
  pageSection: string;
  clickCount: number;
  hoverCount: number;
  timeSpent: number;
  scrollDepth: number;
  conversionRate: number;
  position: { top: number; left: number; width: number; height: number };
}

interface HeatmapVisualizationProps {
  data: HeatmapData[];
  pageScreenshot?: string;
  selectedMetric: 'clicks' | 'time' | 'scroll' | 'conversion';
  onMetricChange: (metric: 'clicks' | 'time' | 'scroll' | 'conversion') => void;
}

export const HeatmapVisualization = ({
  data,
  pageScreenshot,
  selectedMetric,
  onMetricChange
}: HeatmapVisualizationProps): JSX.Element => {
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  const getMetricValue = (item: HeatmapData): number => {
    switch (selectedMetric) {
      case 'clicks': return item.clickCount;
      case 'time': return item.timeSpent;
      case 'scroll': return item.scrollDepth;
      case 'conversion': return item.conversionRate;
      default: return 0;
    }
  };

  const maxValue = Math.max(...data.map(getMetricValue));

  const getHeatIntensity = (value: number): string => {
    const intensity = Math.min((value / maxValue) * 100, 100);
    
    if (intensity > 80) return 'bg-red-500 bg-opacity-70';
    if (intensity > 60) return 'bg-orange-500 bg-opacity-60';
    if (intensity > 40) return 'bg-yellow-500 bg-opacity-50';
    if (intensity > 20) return 'bg-green-500 bg-opacity-40';
    return 'bg-blue-500 bg-opacity-30';
  };

  const metricConfig = {
    clicks: { icon: MousePointer, label: '클릭 수', unit: '회' },
    time: { icon: Clock, label: '체류 시간', unit: '초' },
    scroll: { icon: Eye, label: '스크롤 깊이', unit: '%' },
    conversion: { icon: Zap, label: '전환율', unit: '%' }
  };

  return (
    <div className="space-y-6">
      {/* 메트릭 선택 */}
      <div className="flex gap-4">
        {Object.entries(metricConfig).map(([key, config]) => {
          const Icon = config.icon;
          return (
            <button
              key={key}
              onClick={() => onMetricChange(key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                selectedMetric === key
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {config.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 히트맵 시각화 */}
        <div className="lg:col-span-2">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">
              페이지 히트맵 - {metricConfig[selectedMetric].label}
            </h3>
            
            <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ aspectRatio: '16/10' }}>
              {/* 페이지 스크린샷 배경 */}
              {pageScreenshot && (
                <img 
                  src={pageScreenshot} 
                  alt="Page screenshot"
                  className="w-full h-full object-cover opacity-30"
                />
              )}
              
              {/* 히트맵 오버레이 */}
              <div className="absolute inset-0">
                {data.map((item) => (
                  <div
                    key={item.pageSection}
                    className={`absolute transition-all duration-200 border-2 border-white rounded-lg cursor-pointer ${
                      getHeatIntensity(getMetricValue(item))
                    } ${hoveredSection === item.pageSection ? 'ring-2 ring-primary' : ''}`}
                    style={{
                      top: `${item.position.top}%`,
                      left: `${item.position.left}%`,
                      width: `${item.position.width}%`,
                      height: `${item.position.height}%`
                    }}
                    onMouseEnter={() => setHoveredSection(item.pageSection)}
                    onMouseLeave={() => setHoveredSection(null)}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.pageSection}: {getMetricValue(item)}{metricConfig[selectedMetric].unit}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 범례 */}
            <div className="flex items-center justify-between mt-4 text-sm">
              <span className="text-gray-600">낮음</span>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-blue-500 bg-opacity-30 rounded"></div>
                <div className="w-4 h-4 bg-green-500 bg-opacity-40 rounded"></div>
                <div className="w-4 h-4 bg-yellow-500 bg-opacity-50 rounded"></div>
                <div className="w-4 h-4 bg-orange-500 bg-opacity-60 rounded"></div>
                <div className="w-4 h-4 bg-red-500 bg-opacity-70 rounded"></div>
              </div>
              <span className="text-gray-600">높음</span>
            </div>
          </Card>
        </div>

        {/* 상세 통계 */}
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">섹션별 상세 데이터</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {data
                .sort((a, b) => getMetricValue(b) - getMetricValue(a))
                .map((item) => (
                  <div
                    key={item.pageSection}
                    className={`p-3 rounded-lg border-2 transition-colors cursor-pointer ${
                      hoveredSection === item.pageSection
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onMouseEnter={() => setHoveredSection(item.pageSection)}
                    onMouseLeave={() => setHoveredSection(null)}
                  >
                    <div className="font-medium text-sm mb-2">{item.pageSection}</div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <MousePointer className="w-3 h-3" />
                        {item.clickCount}회
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {Math.round(item.timeSpent / 1000)}초
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {item.scrollDepth}%
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {item.conversionRate}%
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          </Card>

          {/* 현재 선택된 메트릭 요약 */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">
              {metricConfig[selectedMetric].label} 요약
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">최고값</span>
                <span className="font-medium">
                  {maxValue}{metricConfig[selectedMetric].unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">평균값</span>
                <span className="font-medium">
                  {Math.round(data.reduce((acc, item) => acc + getMetricValue(item), 0) / data.length)}
                  {metricConfig[selectedMetric].unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">활성 섹션</span>
                <span className="font-medium">
                  {data.filter(item => getMetricValue(item) > maxValue * 0.5).length}개
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};