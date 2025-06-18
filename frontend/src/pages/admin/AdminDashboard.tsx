// 새로운 사용자 중심 관리자 대시보드
// 기존 테이블 중심에서 업무 흐름 중심으로 완전 재설계

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar,
  BarChart3,
  Users,
  LogOut,
  Settings,
  Bell,
  Search,
  Filter
} from 'lucide-react';
import { Button, LoadingSpinner, useToast } from '@/components/ui';
import { PageLayout } from '@/components/layout';
import { TodaysWork, InsightsDashboard, UserJourneyCard } from '@/components/admin';
import { useAdminStore } from '@/store/useAdminStore';
import { useAdminWorkflow } from '@/hooks/useAdminWorkflow';
import { trackEvent } from '@/utils/analytics';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAdminStore();
  const { addToast } = useToast();
  
  const {
    // 상태
    userViews,
    todaysWork,
    insights,
    isLoading,
    activeView,
    selectedUsers,
    filters,
    filteredUserViews,

    // 액션
    loadData,
    executeUserAction,
    executeBatchAction,
    setActiveView,
    updateFilters,
    toggleUserSelection,
    toggleSelectAll
  } = useAdminWorkflow();

  const handleLogout = (): void => {
    logout();
    navigate('/admin/login');
  };

  const handleViewAll = (category: string): void => {
    trackEvent('admin_view_all', {
      category,
      user_flow_step: 'admin_view_all_clicked'
    });
    
    // 해당 카테고리에 맞는 필터 설정 후 사용자 뷰로 전환
    switch (category) {
      case 'newRecommendationRequests':
        updateFilters({ status: 'recommendation_requested', priority: 'urgent' });
        break;
      case 'stalledProcesses':
        updateFilters({ status: 'all', priority: 'all' });
        break;
      case 'diagnoseOnlyUsers':
        updateFilters({ status: 'diagnosis_done' });
        break;
      default:
        updateFilters({ status: 'all', priority: 'all' });
    }
    setActiveView('users');
  };

  const handleUserAction = async (user: any, action: string): Promise<void> => {
    trackEvent('admin_user_action', {
      action,
      user_id: user.id,
      instagram_id: user.instagramId,
      journey_status: user.journeyStatus,
      user_flow_step: 'admin_user_action_executed'
    });

    await executeUserAction(user, action);
  };

  const handleBatchAction = async (action: string): Promise<void> => {
    if (selectedUsers.size === 0) {
      addToast({
        type: 'warning',
        title: '사용자 선택 필요',
        message: '액션을 실행할 사용자를 선택해주세요.'
      });
      return;
    }

    trackEvent('admin_batch_action', {
      action,
      user_count: selectedUsers.size,
      user_flow_step: 'admin_batch_action_executed'
    });

    await executeBatchAction(Array.from(selectedUsers), action);
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto p-4 space-y-6">
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
              onClick={loadData}
              disabled={isLoading}
            >
              <Settings className="w-4 h-4" />
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
            onUserAction={handleUserAction}
            onViewAll={handleViewAll}
          />
        )}

        {activeView === 'insights' && insights && (
          <InsightsDashboard insights={insights} />
        )}

        {activeView === 'users' && (
          <div className="space-y-6">
            {/* 필터 및 검색 */}
            <div className="flex flex-col lg:flex-row gap-4 justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="인스타그램 ID 검색..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <select
                  value={filters.priority}
                  onChange={(e) => updateFilters({ priority: e.target.value as any })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">모든 우선순위</option>
                  <option value="urgent">긴급</option>
                  <option value="high">높음</option>
                  <option value="medium">보통</option>
                  <option value="low">낮음</option>
                </select>
                
                <select
                  value={filters.status}
                  onChange={(e) => updateFilters({ status: e.target.value as any })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">모든 상태</option>
                  <option value="just_started">방금 가입</option>
                  <option value="diagnosis_pending">진단 대기</option>
                  <option value="diagnosis_done">진단 완료</option>
                  <option value="recommendation_requested">추천 요청됨</option>
                  <option value="recommendation_processing">추천 작업 중</option>
                  <option value="recommendation_completed">추천 완료</option>
                </select>
              </div>

              {/* 배치 액션 */}
              {selectedUsers.size > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">
                    {selectedUsers.size}명 선택됨
                  </span>
                  <Button
                    size="sm"
                    onClick={() => handleBatchAction('send_recommendation_offer')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    추천 제안 발송
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleBatchAction('add_note')}
                    variant="ghost"
                  >
                    노트 추가
                  </Button>
                </div>
              )}
            </div>

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
                      onAction={handleUserAction}
                      isSelected={selectedUsers.has(user.id)}
                      onSelect={toggleUserSelection}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default AdminDashboard;