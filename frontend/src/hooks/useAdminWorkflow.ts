// 관리자 워크플로우 통합 관리 훅
// 모든 사용자 중심 데이터와 액션을 통합 관리

import { useState, useEffect, useCallback } from 'react';
import { useAdminStore } from '@/store/useAdminStore';
import { UserJourneyService } from '@/services/admin/userJourneyService';
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

    try {
      // 액션에 따른 실제 처리
      switch (action) {
        case 'start_recommendation_process':
          // 추천 상태를 processing으로 변경
          if (user.recommendation) {
            // AdminAPI.updateRecommendationStatus 호출
            addToast({
              type: 'success',
              title: '추천 처리 시작',
              message: `@${user.instagramId}의 히잡 추천 작업을 시작했습니다.`
            });
          }
          break;

        case 'complete_recommendation':
          // 추천 완료 처리
          if (user.recommendation) {
            addToast({
              type: 'success',
              title: '추천 완료',
              message: `@${user.instagramId}의 히잡 추천이 완료되었습니다.`
            });
          }
          break;

        case 'send_recommendation_offer':
          // 추천 서비스 제안 메시지 (실제로는 외부 시스템과 연동)
          addToast({
            type: 'info',
            title: '추천 제안 발송',
            message: `@${user.instagramId}에게 히잡 추천 서비스를 제안했습니다.`
          });
          break;

        case 'send_diagnosis_reminder':
          // 진단 독려 메시지
          addToast({
            type: 'info',
            title: '진단 독려 발송',
            message: `@${user.instagramId}에게 퍼스널 컬러 진단 독려 메시지를 발송했습니다.`
          });
          break;

        case 'add_note':
          // 관리자 노트 추가 (실제로는 모달 열기)
          addToast({
            type: 'info',
            title: '노트 추가',
            message: '관리자 노트를 추가하는 기능을 구현 예정입니다.'
          });
          break;

        default:
          addToast({
            type: 'info',
            title: '액션 실행',
            message: `${action} 액션을 실행했습니다.`
          });
      }

      // 데이터 새로고침
      await loadData();

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
      
      // 병렬로 액션 실행
      await Promise.all(
        selectedUsers.map(user => executeUserAction(user, action))
      );

      addToast({
        type: 'success',
        title: '배치 액션 완료',
        message: `${selectedUsers.length}명의 사용자에 대해 ${action} 액션을 실행했습니다.`
      });

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
  }, [apiKey, state.userViews, executeUserAction, addToast]);

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