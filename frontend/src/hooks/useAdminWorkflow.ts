// 관리자 워크플로우 통합 관리 훅
// 모든 사용자 중심 데이터와 액션을 통합 관리

import { useState, useEffect, useCallback } from 'react';
import { useAdminStore } from '@/store/useAdminStore';
import { UserJourneyService, ActionExecutionService } from '@/services/admin';
import { useToast } from '@/components/ui';
import type { 
  UnifiedUserView, 
  TodaysWork, 
  InsightsDashboard, 
  AdminActionType,
  UserJourneyStatus,
  Priority,
  PersonalColorSeason
} from '@/types/admin';
import type { FilterCriteria } from '@/components/admin/AdvancedFilter';

interface AdminWorkflowState {
  // 데이터 상태
  userViews: UnifiedUserView[];
  todaysWork: TodaysWork | null;
  insights: InsightsDashboard | null;
  
  // UI 상태
  isLoading: boolean;
  activeView: 'today' | 'insights' | 'users';
  selectedUsers: Set<string>;
  filterExpanded: boolean;
  
  // 필터 상태
  filters: FilterCriteria;
  
  // 에러 상태
  error: Error | null;
  retryCount: number;
}

export const useAdminWorkflow = () => {
  const { apiKey } = useAdminStore();
  const { addToast } = useToast();
  
  const [state, setState] = useState<AdminWorkflowState>({
    userViews: [],
    todaysWork: null,
    insights: null,
    isLoading: true,
    activeView: 'today',
    selectedUsers: new Set(),
    filterExpanded: false,
    filters: {
      searchQuery: '',
      journeyStatuses: [],
      priorities: [],
      personalColorSeasons: [],
      hasPersonalColor: null,
      hasRecommendation: null,
      recommendationStatuses: [],
      dateRange: {
        type: 'registration',
        from: null,
        to: null
      },
      daysSinceLastActivity: {
        min: null,
        max: null
      },
      riskFlags: {
        isAtRisk: false,
        hasStalled: false,
        isNewUser: false
      },
      sortBy: 'priority',
      sortOrder: 'desc'
    },
    error: null,
    retryCount: 0
  });

  // 데이터 로드 with retry logic
  const loadData = useCallback(async (isRetry = false) => {
    if (!apiKey) return;

    setState(prev => ({ 
      ...prev, 
      isLoading: true,
      error: null,
      retryCount: isRetry ? prev.retryCount + 1 : 0
    }));
    
    try {
      // 통합 사용자 뷰 로드
      const userViews = await UserJourneyService.getUnifiedUserViews(apiKey);
      
      // 오늘의 작업 생성
      const todaysWork = UserJourneyService.generateTodaysWork(userViews);
      
      // 인사이트 대시보드 생성
      const insights = UserJourneyService.generateInsightsDashboard(userViews);

      setState(prev => ({
        ...prev,
        userViews,
        todaysWork,
        insights,
        isLoading: false,
        error: null,
        retryCount: 0
      }));

    } catch (error) {
      console.error('Failed to load admin workflow data:', error);
      
      const errorObj = error instanceof Error ? error : new Error('Unknown error');
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: errorObj
      }));
      
      // Show error toast only if not retrying
      if (!isRetry || state.retryCount >= 2) {
        addToast({
          type: 'error',
          title: '데이터 로드 실패',
          message: '관리자 대시보드 데이터를 불러오는데 실패했습니다.',
          action: {
            label: '다시 시도',
            onClick: () => loadData(true)
          }
        });
      }
    }
  }, [apiKey, addToast, state.retryCount]);

  // 필터된 사용자 뷰
  const filteredUserViews = useCallback(() => {
    let filtered = state.userViews;
    const { filters } = state;

    // 검색어 필터
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.instagramId.toLowerCase().includes(query) ||
        user.actions.some(action => 
          action.description.toLowerCase().includes(query)
        )
      );
    }

    // 여정 상태 필터
    if (filters.journeyStatuses.length > 0) {
      filtered = filtered.filter(user => 
        filters.journeyStatuses.includes(user.journeyStatus)
      );
    }

    // 우선순위 필터
    if (filters.priorities.length > 0) {
      filtered = filtered.filter(user => 
        filters.priorities.includes(user.priority)
      );
    }

    // 퍼스널 컬러 필터
    if (filters.hasPersonalColor !== null) {
      filtered = filtered.filter(user => 
        filters.hasPersonalColor ? !!user.personalColor : !user.personalColor
      );
    }

    if (filters.personalColorSeasons.length > 0 && filters.hasPersonalColor !== false) {
      filtered = filtered.filter(user => 
        user.personalColor && filters.personalColorSeasons.includes(user.personalColor.season)
      );
    }

    // 추천 필터
    if (filters.hasRecommendation !== null) {
      filtered = filtered.filter(user => 
        filters.hasRecommendation ? !!user.recommendation : !user.recommendation
      );
    }

    if (filters.recommendationStatuses.length > 0 && filters.hasRecommendation !== false) {
      filtered = filtered.filter(user => 
        user.recommendation && filters.recommendationStatuses.includes(user.recommendation.status)
      );
    }

    // 날짜 범위 필터
    if (filters.dateRange.from || filters.dateRange.to) {
      filtered = filtered.filter(user => {
        let dateToCheck: Date | null = null;
        
        switch (filters.dateRange.type) {
          case 'registration':
            dateToCheck = new Date(user.timeline.registeredAt);
            break;
          case 'lastActivity':
            dateToCheck = new Date(user.timeline.lastActivityAt);
            break;
          case 'diagnosis':
            dateToCheck = user.timeline.diagnosisAt ? new Date(user.timeline.diagnosisAt) : null;
            break;
          case 'recommendation':
            dateToCheck = user.timeline.recommendationRequestedAt ? new Date(user.timeline.recommendationRequestedAt) : null;
            break;
        }

        if (!dateToCheck) return false;

        if (filters.dateRange.from && dateToCheck < filters.dateRange.from) return false;
        if (filters.dateRange.to && dateToCheck > filters.dateRange.to) return false;
        
        return true;
      });
    }

    // 활동 기간 필터
    if (filters.daysSinceLastActivity.min !== null || filters.daysSinceLastActivity.max !== null) {
      filtered = filtered.filter(user => {
        const days = user.insights.daysSinceLastActivity;
        
        if (filters.daysSinceLastActivity.min !== null && days < filters.daysSinceLastActivity.min) return false;
        if (filters.daysSinceLastActivity.max !== null && days > filters.daysSinceLastActivity.max) return false;
        
        return true;
      });
    }

    // 위험 신호 필터
    if (filters.riskFlags.isAtRisk) {
      filtered = filtered.filter(user => user.insights.isAtRisk);
    }
    if (filters.riskFlags.hasStalled) {
      filtered = filtered.filter(user => user.insights.hasStalled);
    }
    if (filters.riskFlags.isNewUser) {
      filtered = filtered.filter(user => user.insights.isNewUser);
    }

    // 정렬
    filtered = [...filtered].sort((a, b) => {
      let compareValue = 0;
      
      switch (filters.sortBy) {
        case 'priority':
          const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
          compareValue = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'lastActivity':
          compareValue = new Date(b.timeline.lastActivityAt).getTime() - new Date(a.timeline.lastActivityAt).getTime();
          break;
        case 'registration':
          compareValue = new Date(b.timeline.registeredAt).getTime() - new Date(a.timeline.registeredAt).getTime();
          break;
        case 'instagramId':
          compareValue = a.instagramId.localeCompare(b.instagramId);
          break;
      }
      
      return filters.sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return filtered;
  }, [state.userViews, state.filters]);

  // 사용자 액션 실행
  const executeUserAction = useCallback(async (
    user: UnifiedUserView, 
    action: AdminActionType,
    ...args: any[]
  ) => {
    if (!apiKey) return;

    // 확인이 필요한 액션인지 체크
    if (ActionExecutionService.requiresConfirmation(action)) {
      const confirmMessage = ActionExecutionService.getConfirmationMessage(user, action);
      if (confirmMessage) {
        // TODO: 확인 모달 표시
        console.log('Confirmation required:', confirmMessage);
      }
    }

    try {
      // 액션 실행
      const result = await ActionExecutionService.executeAction(user, action, apiKey, ...args);
      
      if (result.success) {
        addToast({
          type: 'success',
          title: '액션 성공',
          message: result.message
        });
        
        // 데이터 새로고침
        await loadData();
      } else {
        addToast({
          type: 'error',
          title: '액션 실패',
          message: result.message
        });
      }
      
      return result;
    } catch (error) {
      console.error('Failed to execute user action:', error);
      addToast({
        type: 'error',
        title: '액션 실행 실패',
        message: '사용자 액션 실행에 실패했습니다.'
      });
    }
  }, [apiKey, addToast, loadData]);

  // 배치 액션 실행
  const executeBatchAction = useCallback(async (
    userIds: string[], 
    action: AdminActionType
  ) => {
    if (!apiKey || userIds.length === 0) return;

    try {
      // 선택된 사용자들에 대해 배치 액션 실행
      const selectedUsers = state.userViews.filter(user => userIds.includes(user.id));
      
      const result = await ActionExecutionService.executeBatchAction(
        selectedUsers,
        action,
        apiKey
      );

      if (result.successful > 0) {
        addToast({
          type: 'success',
          title: '배치 액션 완료',
          message: `${result.successful}명 성공, ${result.failed}명 실패`
        });
      } else {
        addToast({
          type: 'error',
          title: '배치 액션 실패',
          message: `모든 액션이 실패했습니다. (${result.failed}명)`
        });
      }

      // 데이터 새로고침
      await loadData();

      // 선택 해제
      setState(prev => ({ ...prev, selectedUsers: new Set() }));

    } catch (error) {
      console.error('Failed to execute batch action:', error);
      addToast({
        type: 'error',
        title: '배치 액션 실패',
        message: '배치 액션 실행에 실패했습니다.'
      });
    }
  }, [apiKey, state.userViews, loadData, addToast]);

  // 뷰 변경
  const setActiveView = useCallback((view: AdminWorkflowState['activeView']) => {
    setState(prev => ({ ...prev, activeView: view, selectedUsers: new Set() }));
  }, []);

  // 필터 변경
  const updateFilters = useCallback((
    newFilters: Partial<FilterCriteria> | FilterCriteria
  ) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters },
      selectedUsers: new Set()
    }));
  }, []);

  // 필터 리셋
  const resetFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      filters: {
        searchQuery: '',
        journeyStatuses: [],
        priorities: [],
        personalColorSeasons: [],
        hasPersonalColor: null,
        hasRecommendation: null,
        recommendationStatuses: [],
        dateRange: {
          type: 'registration',
          from: null,
          to: null
        },
        daysSinceLastActivity: {
          min: null,
          max: null
        },
        riskFlags: {
          isAtRisk: false,
          hasStalled: false,
          isNewUser: false
        },
        sortBy: 'priority',
        sortOrder: 'desc'
      },
      selectedUsers: new Set()
    }));
  }, []);

  // 필터 확장 토글
  const toggleFilterExpanded = useCallback(() => {
    setState(prev => ({ ...prev, filterExpanded: !prev.filterExpanded }));
  }, []);

  // 사용자 선택/해제
  const toggleUserSelection = useCallback((userId: string) => {
    setState(prev => {
      const newSelected = new Set(prev.selectedUsers);
      if (newSelected.has(userId)) {
        newSelected.delete(userId);
      } else {
        newSelected.add(userId);
      }
      return { ...prev, selectedUsers: newSelected };
    });
  }, []);

  // 전체 선택/해제
  const toggleSelectAll = useCallback(() => {
    const filtered = filteredUserViews();
    const allSelected = filtered.every(user => state.selectedUsers.has(user.id));
    
    setState(prev => ({
      ...prev,
      selectedUsers: allSelected 
        ? new Set() 
        : new Set(filtered.map(user => user.id))
    }));
  }, [filteredUserViews, state.selectedUsers]);

  // 초기 데이터 로드
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    // 상태
    ...state,
    filteredUserViews: filteredUserViews(),

    // 액션
    loadData,
    executeUserAction,
    executeBatchAction,
    setActiveView,
    updateFilters,
    resetFilters,
    toggleFilterExpanded,
    toggleUserSelection,
    toggleSelectAll,
    
    // 에러 처리
    retry: () => loadData(true),
    clearError: () => setState(prev => ({ ...prev, error: null }))
  };
};