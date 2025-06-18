import React, { useState, useCallback } from 'react';
import {
  Filter,
  X,
  Calendar,
  User,
  Target,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Clock,
  Search,
  SlidersHorizontal
} from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { useDebouncedCallback } from '@/hooks/useDebounce';
import type { UserJourneyStatus, Priority, PersonalColorSeason } from '@/types/admin';

export interface FilterCriteria {
  // 텍스트 검색
  searchQuery: string;
  
  // 상태 필터
  journeyStatuses: UserJourneyStatus[];
  priorities: Priority[];
  
  // 퍼스널 컬러
  personalColorSeasons: PersonalColorSeason[];
  hasPersonalColor: boolean | null;
  
  // 추천 관련
  hasRecommendation: boolean | null;
  recommendationStatuses: ('pending' | 'processing' | 'completed')[];
  
  // 날짜 범위
  dateRange: {
    type: 'registration' | 'lastActivity' | 'diagnosis' | 'recommendation';
    from: Date | null;
    to: Date | null;
  };
  
  // 활동 기간
  daysSinceLastActivity: {
    min: number | null;
    max: number | null;
  };
  
  // 위험 신호
  riskFlags: {
    isAtRisk: boolean;
    hasStalled: boolean;
    isNewUser: boolean;
  };
  
  // 정렬
  sortBy: 'priority' | 'lastActivity' | 'registration' | 'instagramId';
  sortOrder: 'asc' | 'desc';
}

interface AdvancedFilterProps {
  filters: FilterCriteria;
  onFiltersChange: (filters: FilterCriteria) => void;
  onReset: () => void;
  userCount?: number;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
}

const AdvancedFilter: React.FC<AdvancedFilterProps> = ({
  filters,
  onFiltersChange,
  onReset,
  userCount = 0,
  isExpanded = false,
  onToggleExpanded
}) => {
  const [activeSection, setActiveSection] = useState<string | null>('status');
  const [localSearchQuery, setLocalSearchQuery] = useState(filters.searchQuery);

  // 필터 업데이트 헬퍼
  const updateFilter = <K extends keyof FilterCriteria>(
    key: K,
    value: FilterCriteria[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };
  
  // Debounced search update
  const debouncedSearchUpdate = useDebouncedCallback(
    (value: string) => {
      updateFilter('searchQuery', value);
    },
    300
  );
  
  const handleSearchChange = useCallback((value: string) => {
    setLocalSearchQuery(value);
    debouncedSearchUpdate(value);
  }, [debouncedSearchUpdate]);

  // 여정 상태 옵션
  const journeyStatusOptions: { value: UserJourneyStatus; label: string; icon: React.ReactNode; color: string }[] = [
    { value: 'just_started', label: '방금 가입', icon: <User className="w-4 h-4" />, color: 'text-gray-600' },
    { value: 'diagnosis_pending', label: '진단 대기', icon: <Clock className="w-4 h-4" />, color: 'text-yellow-600' },
    { value: 'diagnosis_done', label: '진단 완료', icon: <Sparkles className="w-4 h-4" />, color: 'text-green-600' },
    { value: 'offer_sent', label: 'DM 발송됨', icon: <Send className="w-4 h-4" />, color: 'text-blue-600' },
    { value: 'recommendation_requested', label: '추천 요청', icon: <Target className="w-4 h-4" />, color: 'text-blue-600' },
    { value: 'recommendation_processing', label: '추천 작업 중', icon: <Sparkles className="w-4 h-4" />, color: 'text-purple-600' },
    { value: 'recommendation_completed', label: '추천 완료', icon: <Target className="w-4 h-4" />, color: 'text-green-600' },
    { value: 'inactive', label: '비활성', icon: <AlertTriangle className="w-4 h-4" />, color: 'text-red-600' }
  ];

  // 우선순위 옵션
  const priorityOptions: { value: Priority; label: string; color: string }[] = [
    { value: 'urgent', label: '긴급', color: 'bg-red-100 text-red-800 border-red-200' },
    { value: 'high', label: '높음', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    { value: 'medium', label: '보통', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { value: 'low', label: '낮음', color: 'bg-gray-100 text-gray-800 border-gray-200' }
  ];

  // 퍼스널 컬러 옵션
  const personalColorOptions: { value: PersonalColorSeason; label: string; color: string }[] = [
    { value: 'spring', label: '봄', color: 'bg-pink-100 text-pink-800' },
    { value: 'summer', label: '여름', color: 'bg-blue-100 text-blue-800' },
    { value: 'autumn', label: '가을', color: 'bg-orange-100 text-orange-800' },
    { value: 'winter', label: '겨울', color: 'bg-purple-100 text-purple-800' }
  ];

  // 활성 필터 개수 계산
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.searchQuery) count++;
    if (filters.journeyStatuses.length > 0) count += filters.journeyStatuses.length;
    if (filters.priorities.length > 0) count += filters.priorities.length;
    if (filters.personalColorSeasons.length > 0) count += filters.personalColorSeasons.length;
    if (filters.hasPersonalColor !== null) count++;
    if (filters.hasRecommendation !== null) count++;
    if (filters.recommendationStatuses.length > 0) count += filters.recommendationStatuses.length;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (filters.daysSinceLastActivity.min !== null || filters.daysSinceLastActivity.max !== null) count++;
    if (filters.riskFlags.isAtRisk || filters.riskFlags.hasStalled || filters.riskFlags.isNewUser) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  // 간단한 뷰 (접힌 상태)
  if (!isExpanded) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* 검색 바 */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={localSearchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="인스타그램 ID 검색..."
                className="pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 w-64"
              />
            </div>

            {/* 빠른 필터 */}
            <div className="flex items-center gap-2">
              {/* 우선순위 */}
              <select
                value={filters.priorities[0] || ''}
                onChange={(e) => updateFilter('priorities', e.target.value ? [e.target.value as Priority] : [])}
                className="text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">모든 우선순위</option>
                {priorityOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>

              {/* 상태 */}
              <select
                value={filters.journeyStatuses[0] || ''}
                onChange={(e) => updateFilter('journeyStatuses', e.target.value ? [e.target.value as UserJourneyStatus] : [])}
                className="text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">모든 상태</option>
                {journeyStatusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* 활성 필터 표시 */}
            {activeFilterCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{activeFilterCount}개 필터 적용 중</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onReset}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                  초기화
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* 결과 수 */}
            <span className="text-sm text-gray-500">{userCount}명</span>

            {/* 고급 필터 토글 */}
            {onToggleExpanded && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleExpanded}
                className="flex items-center gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                고급 필터
                <ChevronDown className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // 고급 필터 뷰 (펼친 상태)
  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Filter className="w-5 h-5" />
            고급 필터
          </h3>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {activeFilterCount}개 필터 적용 중 • {userCount}명 검색됨
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-red-600"
            >
              <X className="w-4 h-4 mr-1" />
              모두 초기화
            </Button>
            
            {onToggleExpanded && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleExpanded}
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* 검색 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">검색</label>
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={localSearchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="인스타그램 ID, 태그, 노트 내용 검색..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* 섹션별 필터 */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* 여정 상태 */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">여정 상태</h4>
            <div className="space-y-2">
              {journeyStatusOptions.map(option => (
                <label
                  key={option.value}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.journeyStatuses.includes(option.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateFilter('journeyStatuses', [...filters.journeyStatuses, option.value]);
                      } else {
                        updateFilter('journeyStatuses', filters.journeyStatuses.filter(s => s !== option.value));
                      }
                    }}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className={`flex items-center gap-2 ${option.color}`}>
                    {option.icon}
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 우선순위 & 위험 신호 */}
          <div className="space-y-6">
            {/* 우선순위 */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">우선순위</h4>
              <div className="grid grid-cols-2 gap-2">
                {priorityOptions.map(option => (
                  <label
                    key={option.value}
                    className={`flex items-center justify-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                      filters.priorities.includes(option.value)
                        ? option.color
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={filters.priorities.includes(option.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateFilter('priorities', [...filters.priorities, option.value]);
                        } else {
                          updateFilter('priorities', filters.priorities.filter(p => p !== option.value));
                        }
                      }}
                      className="sr-only"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            {/* 위험 신호 */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">특별 관리 대상</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.riskFlags.isAtRisk}
                    onChange={(e) => updateFilter('riskFlags', { ...filters.riskFlags, isAtRisk: e.target.checked })}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="w-4 h-4" />
                    이탈 위험
                  </span>
                </label>
                
                <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.riskFlags.hasStalled}
                    onChange={(e) => updateFilter('riskFlags', { ...filters.riskFlags, hasStalled: e.target.checked })}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="flex items-center gap-2 text-orange-600">
                    <Clock className="w-4 h-4" />
                    프로세스 중단
                  </span>
                </label>
                
                <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.riskFlags.isNewUser}
                    onChange={(e) => updateFilter('riskFlags', { ...filters.riskFlags, isNewUser: e.target.checked })}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="flex items-center gap-2 text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    신규 사용자
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* 퍼스널 컬러 & 추천 */}
        <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
          {/* 퍼스널 컬러 */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">퍼스널 컬러</h4>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="hasPersonalColor"
                    checked={filters.hasPersonalColor === null}
                    onChange={() => updateFilter('hasPersonalColor', null)}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm">전체</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="hasPersonalColor"
                    checked={filters.hasPersonalColor === true}
                    onChange={() => updateFilter('hasPersonalColor', true)}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm">진단 완료</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="hasPersonalColor"
                    checked={filters.hasPersonalColor === false}
                    onChange={() => updateFilter('hasPersonalColor', false)}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm">진단 전</span>
                </label>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {personalColorOptions.map(option => (
                  <label
                    key={option.value}
                    className={`flex items-center justify-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                      filters.personalColorSeasons.includes(option.value)
                        ? option.color
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={filters.personalColorSeasons.includes(option.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateFilter('personalColorSeasons', [...filters.personalColorSeasons, option.value]);
                        } else {
                          updateFilter('personalColorSeasons', filters.personalColorSeasons.filter(s => s !== option.value));
                        }
                      }}
                      className="sr-only"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* 히잡 추천 */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">히잡 추천</h4>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="hasRecommendation"
                    checked={filters.hasRecommendation === null}
                    onChange={() => updateFilter('hasRecommendation', null)}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm">전체</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="hasRecommendation"
                    checked={filters.hasRecommendation === true}
                    onChange={() => updateFilter('hasRecommendation', true)}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm">요청함</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="hasRecommendation"
                    checked={filters.hasRecommendation === false}
                    onChange={() => updateFilter('hasRecommendation', false)}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm">요청 안함</span>
                </label>
              </div>
              
              {filters.hasRecommendation && (
                <div className="flex items-center gap-2">
                  {(['pending', 'processing', 'completed'] as const).map(status => (
                    <label
                      key={status}
                      className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-sm cursor-pointer transition-colors ${
                        filters.recommendationStatuses.includes(status)
                          ? status === 'completed' ? 'bg-green-100 text-green-700' :
                            status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={filters.recommendationStatuses.includes(status)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateFilter('recommendationStatuses', [...filters.recommendationStatuses, status]);
                          } else {
                            updateFilter('recommendationStatuses', filters.recommendationStatuses.filter(s => s !== status));
                          }
                        }}
                        className="sr-only"
                      />
                      {status === 'pending' ? '대기' : status === 'processing' ? '처리 중' : '완료'}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 날짜 & 활동 기간 */}
        <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
          {/* 날짜 범위 */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">날짜 범위</h4>
            
            <div className="space-y-3">
              <select
                value={filters.dateRange.type}
                onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, type: e.target.value as any })}
                className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="registration">가입일</option>
                <option value="lastActivity">마지막 활동</option>
                <option value="diagnosis">진단일</option>
                <option value="recommendation">추천 요청일</option>
              </select>
              
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={filters.dateRange.from ? filters.dateRange.from.toISOString().split('T')[0] : ''}
                  onChange={(e) => updateFilter('dateRange', { 
                    ...filters.dateRange, 
                    from: e.target.value ? new Date(e.target.value) : null 
                  })}
                  className="text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="시작일"
                />
                
                <input
                  type="date"
                  value={filters.dateRange.to ? filters.dateRange.to.toISOString().split('T')[0] : ''}
                  onChange={(e) => updateFilter('dateRange', { 
                    ...filters.dateRange, 
                    to: e.target.value ? new Date(e.target.value) : null 
                  })}
                  className="text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="종료일"
                />
              </div>
            </div>
          </div>

          {/* 마지막 활동 */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">마지막 활동 (일)</h4>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500">최소</label>
                  <input
                    type="number"
                    value={filters.daysSinceLastActivity.min || ''}
                    onChange={(e) => updateFilter('daysSinceLastActivity', {
                      ...filters.daysSinceLastActivity,
                      min: e.target.value ? parseInt(e.target.value) : null
                    })}
                    className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="0"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-gray-500">최대</label>
                  <input
                    type="number"
                    value={filters.daysSinceLastActivity.max || ''}
                    onChange={(e) => updateFilter('daysSinceLastActivity', {
                      ...filters.daysSinceLastActivity,
                      max: e.target.value ? parseInt(e.target.value) : null
                    })}
                    className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="365"
                    min="0"
                  />
                </div>
              </div>
              
              {/* 빠른 선택 */}
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateFilter('daysSinceLastActivity', { min: 0, max: 7 })}
                  className="text-xs"
                >
                  최근 1주
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateFilter('daysSinceLastActivity', { min: 7, max: 30 })}
                  className="text-xs"
                >
                  1주-1달
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateFilter('daysSinceLastActivity', { min: 30, max: null })}
                  className="text-xs"
                >
                  1달 이상
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 정렬 */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">정렬</h4>
          
          <div className="grid md:grid-cols-2 gap-3">
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value as any)}
              className="text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="priority">우선순위</option>
              <option value="lastActivity">마지막 활동</option>
              <option value="registration">가입일</option>
              <option value="instagramId">인스타그램 ID</option>
            </select>
            
            <select
              value={filters.sortOrder}
              onChange={(e) => updateFilter('sortOrder', e.target.value as any)}
              className="text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="desc">내림차순</option>
              <option value="asc">오름차순</option>
            </select>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AdvancedFilter;