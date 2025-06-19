// 새로운 사용자 중심 관리자 대시보드
// 기존 테이블 중심에서 업무 흐름 중심으로 완전 재설계

import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar,
  BarChart3,
  Users,
  LogOut,
  RefreshCw,
  Bell,
  Search,
  Filter
} from 'lucide-react';
import { Button, LoadingSpinner, useToast } from '@/components/ui';
import { PageLayout } from '@/components/layout';
import { TodaysWork, InsightsDashboard, UserJourneyCard, UserDetailModal, AdvancedFilter } from '@/components/admin';
import AdminLoadingState from '@/components/admin/AdminLoadingState';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { trackEvent } from '@/utils/analytics';
import { useAdminStore } from '@/store/useAdminStore';
import { useAdminWorkflow } from '@/hooks/useAdminWorkflow';
import type { UnifiedUserView, AdminActionType } from '@/types/admin';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAdminStore();
  const { addToast } = useToast();
  const [selectedUserForDetail, setSelectedUserForDetail] = React.useState<UnifiedUserView | null>(null);
  
  const {
    // 상태
    userViews,
    todaysWork,
    insights,
    isLoading,
    activeView,
    selectedUsers,
    filters,
    filterExpanded,
    filteredUserViews,
    error,

    // 상태 변경 함수들
    loadData,
    updateUserStatus,
    updateUserPriority,
    escalateUserPriority,
    toggleMessageStatus,
    batchUpdateStatus,
    batchUpdatePriority,
    batchToggleMessage,
    setActiveView,
    updateFilters,
    resetFilters,
    toggleFilterExpanded,
    toggleUserSelection,
    toggleSelectAll,
    retry,
    clearError
  } = useAdminWorkflow();

  const handleLogout = useCallback((): void => {
    trackEvent('button_click', {
      button_name: 'admin_logout',
      page: 'admin_dashboard',
      action: 'logout',
      user_flow_step: 'admin_logged_out'
    });
    
    logout();
    navigate('/admin/login');
  }, [logout, navigate]);

  const handleViewAll = useCallback((category: string): void => {
    trackEvent('admin_view_all', {
      category,
      user_flow_step: 'admin_view_all_clicked'
    });
    
    // 해당 카테고리에 맞는 필터 설정 후 사용자 뷰로 전환
    switch (category) {
      case 'newRecommendationRequests':
        updateFilters({ journeyStatuses: ['recommendation_requested'], priorities: ['urgent'] });
        break;
      case 'stalledProcesses':
        updateFilters({ riskFlags: { isAtRisk: false, hasStalled: true, isNewUser: false } });
        break;
      case 'diagnoseOnlyUsers':
        updateFilters({ journeyStatuses: ['diagnosis_done'] });
        break;
      default:
        resetFilters();
    }
    setActiveView('users');
  }, [updateFilters, resetFilters, setActiveView]);

  const handleStatusChange = useCallback(async (user: UnifiedUserView, newStatus: UserJourneyStatus): Promise<void> => {
    trackEvent('admin_status_change', {
      user_id: user.id,
      instagram_id: user.instagramId,
      old_status: user.journeyStatus,
      new_status: newStatus,
      user_flow_step: 'admin_status_changed'
    });

    await updateUserStatus(user, newStatus);
  }, [updateUserStatus]);

  const handlePriorityChange = useCallback(async (user: UnifiedUserView, newPriority: Priority): Promise<void> => {
    trackEvent('admin_priority_change', {
      user_id: user.id,
      instagram_id: user.instagramId,
      old_priority: user.priority,
      new_priority: newPriority,
      user_flow_step: 'admin_priority_changed'
    });

    await updateUserPriority(user, newPriority);
  }, [updateUserPriority]);

  const handleMessageToggle = useCallback(async (user: UnifiedUserView, messageType: 'diagnosis_reminder' | 'reactivation' | 'followup', sent: boolean): Promise<void> => {
    trackEvent('admin_message_toggle', {
      user_id: user.id,
      instagram_id: user.instagramId,
      message_type: messageType,
      sent,
      user_flow_step: 'admin_message_toggled'
    });

    await toggleMessageStatus(user, messageType, sent);
  }, [toggleMessageStatus]);

  const handleBatchStatusChange = useCallback(async (newStatus: UserJourneyStatus): Promise<void> => {
    if (selectedUsers.size === 0) {
      addToast({
        type: 'warning',
        title: '사용자 선택 필요',
        message: '상태를 변경할 사용자를 선택해주세요.'
      });
      return;
    }

    trackEvent('admin_batch_status_change', {
      new_status: newStatus,
      user_count: selectedUsers.size,
      user_flow_step: 'admin_batch_status_changed'
    });

    await batchUpdateStatus(Array.from(selectedUsers), newStatus);
  }, [selectedUsers, addToast, batchUpdateStatus]);

  const handleBatchMessageToggle = useCallback(async (messageType: 'diagnosis_reminder' | 'reactivation' | 'followup', sent: boolean): Promise<void> => {
    if (selectedUsers.size === 0) {
      addToast({
        type: 'warning',
        title: '사용자 선택 필요',
        message: '메시지 상태를 변경할 사용자를 선택해주세요.'
      });
      return;
    }

    trackEvent('admin_batch_message_toggle', {
      message_type: messageType,
      sent,
      user_count: selectedUsers.size,
      user_flow_step: 'admin_batch_message_toggled'
    });

    await batchToggleMessage(Array.from(selectedUsers), messageType, sent);
  }, [selectedUsers, addToast, batchToggleMessage]);

  // Loading state
  if (isLoading && !error) {
    return (
      <PageLayout>
        <AdminLoadingState />
      </PageLayout>
    );
  }

  // Error state
  if (error && !isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              데이터를 불러올 수 없습니다
            </h2>
            <p className="text-gray-600">
              네트워크 연결을 확인하고 다시 시도해주세요.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => retry()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                다시 시도
              </Button>
              <Button
                variant="ghost"
                onClick={handleLogout}
              >
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <ErrorBoundary onError={(error) => console.error('Admin Dashboard Error:', error)}>
        <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* 임시 데이터 경고 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-yellow-800">데이터 제한 사항</h4>
              <p className="text-sm text-yellow-700 mt-1">
                상태 변경(DM 발송, 우선순위 등)은 현재 세션에서만 유지되며, 페이지 새로고침 시 초기화됩니다. 
                추천 상태(pending/processing/completed)만 영구 저장됩니다.
              </p>
            </div>
          </div>
        </div>
        
        {/* 헤더 */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
            <p className="text-gray-600 mt-1">사용자 중심의 스마트 워크플로우</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* 알림 */}
            {insights && (insights.alerts.highAtRiskUsers > 0 || insights.alerts.stalledProcesses > 0) && (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700"
                onClick={() => setActiveView('insights')}
              >
                <Bell className="w-4 h-4 mr-2" />
                {insights.alerts.highAtRiskUsers + insights.alerts.stalledProcesses}개 알림
              </Button>
            )}
            
            {/* 새로고침 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                trackEvent('button_click', {
                  button_name: 'admin_refresh_data',
                  page: 'admin_dashboard',
                  action: 'refresh',
                  current_view: activeView,
                  user_flow_step: 'admin_data_refreshed'
                });
                
                loadData();
              }}
              disabled={isLoading}
              className={isLoading ? 'animate-spin' : ''}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            
            {/* 로그아웃 */}
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              로그아웃
            </Button>
          </div>
        </div>

        {/* 네비게이션 탭 */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'today', label: '오늘의 작업', icon: Calendar },
              { id: 'insights', label: '인사이트', icon: BarChart3 },
              { id: 'users', label: '사용자 관리', icon: Users }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  trackEvent('admin_tab_change', {
                    from_tab: activeView,
                    to_tab: tab.id,
                    user_flow_step: 'admin_tab_switched'
                  });
                  setActiveView(tab.id as any);
                }}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeView === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* 탭 콘텐츠 */}
        {activeView === 'today' && todaysWork && (
          <TodaysWork
            todaysWork={todaysWork}
            onStatusChange={handleStatusChange}
            onViewAll={handleViewAll}
          />
        )}

        {activeView === 'insights' && insights && (
          <InsightsDashboard insights={insights} />
        )}

        {activeView === 'users' && (
          <div className="space-y-6">
            {/* 고급 필터 */}
            <AdvancedFilter
              filters={filters}
              onFiltersChange={updateFilters}
              onReset={resetFilters}
              userCount={filteredUserViews.length}
              isExpanded={filterExpanded}
              onToggleExpanded={toggleFilterExpanded}
            />

            {/* 배치 액션 (선택된 사용자가 있을 때만 표시) */}
            {selectedUsers.size > 0 && (
              <div className="flex items-center justify-between bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-purple-900">
                    {selectedUsers.size}명 선택됨
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      trackEvent('button_click', {
                        button_name: 'admin_deselect_all',
                        page: 'admin_dashboard',
                        action: 'deselect_all',
                        selected_count: selectedUsers.size,
                        user_flow_step: 'admin_users_deselected'
                      });
                      
                      toggleSelectAll();
                    }}
                    className="text-purple-600 hover:text-purple-700"
                  >
                    선택 해제
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* 상태 변경 버튼들 */}
                  {filteredUserViews.filter(u => selectedUsers.has(u.id)).some(u => u.journeyStatus === 'diagnosis_done') && (
                    <Button
                      size="sm"
                      onClick={() => {
                        trackEvent('button_click', {
                          button_name: 'admin_batch_dm_sent',
                          page: 'admin_dashboard',
                          action: 'batch_status_change',
                          new_status: 'offer_sent',
                          user_count: selectedUsers.size,
                          user_flow_step: 'admin_batch_dm_marked_sent'
                        });
                        
                        handleBatchStatusChange('offer_sent');
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      DM 발송됨으로 변경
                    </Button>
                  )}
                  
                  {filteredUserViews.filter(u => selectedUsers.has(u.id)).some(u => u.journeyStatus === 'offer_sent') && (
                    <Button
                      size="sm"
                      onClick={() => {
                        trackEvent('button_click', {
                          button_name: 'admin_batch_revert_diagnosis',
                          page: 'admin_dashboard',
                          action: 'batch_status_revert',
                          new_status: 'diagnosis_done',
                          user_count: selectedUsers.size,
                          user_flow_step: 'admin_batch_reverted_to_diagnosis'
                        });
                        
                        handleBatchStatusChange('diagnosis_done');
                      }}
                      variant="outline"
                      className="border-gray-300"
                    >
                      진단완료로 되돌리기
                    </Button>
                  )}
                  
                  {filteredUserViews.filter(u => selectedUsers.has(u.id)).some(u => u.journeyStatus === 'recommendation_requested') && (
                    <Button
                      size="sm"
                      onClick={() => {
                        trackEvent('button_click', {
                          button_name: 'admin_batch_start_recommendation',
                          page: 'admin_dashboard',
                          action: 'batch_status_change',
                          new_status: 'recommendation_processing',
                          user_count: selectedUsers.size,
                          user_flow_step: 'admin_batch_recommendation_started'
                        });
                        
                        handleBatchStatusChange('recommendation_processing');
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      추천 작업 시작
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    onClick={() => handleBatchMessageToggle('diagnosis_reminder', true)}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    진단 독려 발송됨
                  </Button>
                  
                  <Button
                    size="sm"
                    onClick={() => handleBatchMessageToggle('reactivation', true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    재활성화 발송됨
                  </Button>
                </div>
              </div>
            )}

            {/* 사용자 목록 헤더 */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  사용자 목록 ({filteredUserViews.length}명)
                </h3>
                <p className="text-sm text-gray-600">
                  필터링된 결과를 업무 우선순위 순으로 표시
                </p>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSelectAll}
              >
                {filteredUserViews.every(user => selectedUsers.has(user.id)) ? '전체 해제' : '전체 선택'}
              </Button>
            </div>

            {/* 사용자 카드 목록 */}
            <div className="space-y-4">
              {filteredUserViews.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>조건에 맞는 사용자가 없습니다.</p>
                </div>
              ) : (
                filteredUserViews.map(user => (
                  <div key={user.id} className="relative">
                    {selectedUsers.has(user.id) && (
                      <div className="absolute inset-0 bg-purple-50 rounded-lg z-0" />
                    )}
                    <UserJourneyCard
                      user={user}
                      onStatusChange={handleStatusChange}
                      onPriorityChange={handlePriorityChange}
                      onMessageToggle={handleMessageToggle}
                      onEscalatePriority={() => escalateUserPriority(user)}
                      isSelected={selectedUsers.has(user.id)}
                      onSelect={toggleUserSelection}
                      onViewDetail={() => setSelectedUserForDetail(user)}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* 사용자 상세 모달 */}
      {selectedUserForDetail && (
        <UserDetailModal
          user={selectedUserForDetail}
          isOpen={!!selectedUserForDetail}
          onClose={() => setSelectedUserForDetail(null)}
          onStatusChange={handleStatusChange}
          onPriorityChange={handlePriorityChange}
          onMessageToggle={handleMessageToggle}
        />
      )}
      </ErrorBoundary>
    </PageLayout>
  );
};

export default AdminDashboard;