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
  AdminActionType 
} from '@/types/admin';

interface AdminWorkflowState {
  // 데이터 상태
  userViews: UnifiedUserView[];
  todaysWork: TodaysWork | null;
  insights: InsightsDashboard | null;
  
  // UI 상태
  isLoading: boolean;
  activeView: 'today' | 'insights' | 'users';
  selectedUsers: Set<string>;
  
  // 필터 상태
  filters: {
    priority: 'all' | 'urgent' | 'high' | 'medium' | 'low';
    status: 'all' | 'just_started' | 'diagnosis_pending' | 'diagnosis_done' | 'recommendation_requested' | 'recommendation_processing' | 'recommendation_completed';
    timeRange: 'today' | 'week' | 'month';
  };
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
    filters: {
      priority: 'all',
      status: 'all',
      timeRange: 'today'
    }
  });

  // 데이터 로드
  const loadData = useCallback(async () => {
    if (!apiKey) return;

    setState(prev => ({ ...prev, isLoading: true }));
    
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
        isLoading: false
      }));

    } catch (error) {
      console.error('Failed to load admin workflow data:', error);
      addToast({
        type: 'error',
        title: '데이터 로드 실패',
        message: '관리자 대시보드 데이터를 불러오는데 실패했습니다.'
      });
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [apiKey, addToast]);

  // 필터된 사용자 뷰
  const filteredUserViews = useCallback(() => {
    let filtered = state.userViews;

    // 우선순위 필터
    if (state.filters.priority !== 'all') {
      filtered = filtered.filter(user => user.priority === state.filters.priority);
    }

    // 상태 필터
    if (state.filters.status !== 'all') {
      filtered = filtered.filter(user => user.journeyStatus === state.filters.status);
    }

    // 시간 범위 필터
    if (state.filters.timeRange !== 'month') {
      const days = state.filters.timeRange === 'today' ? 1 : 7;
      filtered = filtered.filter(user => user.insights.daysSinceLastActivity < days);
    }

    return filtered;
  }, [state.userViews, state.filters]);

  // 사용자 액션 실행
  const executeUserAction = useCallback(async (
    user: UnifiedUserView, 
    action: AdminActionType
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
      const result = await ActionExecutionService.executeAction(user, action, apiKey);
      
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
    filters: Partial<AdminWorkflowState['filters']>
  ) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...filters },
      selectedUsers: new Set()
    }));
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
    toggleUserSelection,
    toggleSelectAll
  };
};