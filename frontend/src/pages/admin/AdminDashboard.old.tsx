import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '@/store/useAdminStore';
import { AdminAPI } from '@/services/api/admin';
import { Card, Button, LoadingSpinner, useToast, ConfirmModal } from '@/components/ui';
import { PageLayout } from '@/components/layout';
import { trackEvent, trackError, trackEngagement } from '@/utils/analytics';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  LogOut,
  ChevronRight,
  Trash2,
  ShirtIcon
} from 'lucide-react';
import type { Recommendation } from '@/types';

interface Statistics {
  total: number;
  byStatus: {
    pending: number;
    processing: number;
    completed: number;
  };
  byPersonalColor: Record<string, number>;
  recentRequests: Array<{
    id: string;
    instagramId: string;
    personalColor: string;
    status: string;
    createdAt: Date;
  }>;
}

interface User {
  id: string;
  instagramId: string;
  personalColor: string | null;
  personalColorKo: string | null;
  uploadedImageUrl: string | null;
  requestedAt: string;
  completedAt: string | null;
  status: string;
  hasRecommendation: boolean;
  hasAnalysis: boolean;
}

const AdminDashboard = (): JSX.Element => {
  const navigate = useNavigate();
  const { apiKey, logout } = useAdminStore();
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'processing' | 'completed'>('all');
  const [activeTab, setActiveTab] = useState<'recommendations' | 'users'>('recommendations');
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<'none' | 'delete' | 'process' | 'complete'>('none');
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    type: 'deleteUser' | 'bulkDelete' | 'statusUpdate' | null;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, type: null, title: '', message: '', onConfirm: () => {} });
  
  const { addToast } = useToast();

  const loadData = useCallback(async (): Promise<void> => {
    if (!apiKey) return;

    setIsLoading(true);
    try {
      // Load statistics
      const stats = await AdminAPI.getStatistics(apiKey);
      setStatistics(stats);

      // Load recommendations
      const params = statusFilter === 'all' ? {} : { status: statusFilter };
      const response = await AdminAPI.getRecommendations(apiKey, params);
      setRecommendations(response.recommendations);

      // Load all users if on users tab
      if (activeTab === 'users') {
        const usersResponse = await AdminAPI.getUsers(apiKey);
        setUsers(usersResponse.data);
      }
    } catch {
      // Handle error silently, data will remain as loading state
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, statusFilter, activeTab]);

  const handleDeleteUser = async (user: User): Promise<void> => {
    if (!apiKey || !user) return;
    
    // Track delete attempt
    trackEvent('admin_action', {
      action_type: 'user_delete_attempt',
      user_id: user.id,
      instagram_id: user.instagramId,
      user_has_analysis: user.hasAnalysis,
      user_has_recommendation: user.hasRecommendation,
      user_flow_step: 'admin_user_deletion_initiated'
    });

    trackEngagement('admin_action', 'user_deletion');
    
    try {
      await AdminAPI.deleteUser(apiKey, user.id);
      
      // Track successful deletion
      trackEvent('admin_action_success', {
        action_type: 'user_delete_success',
        user_id: user.id,
        instagram_id: user.instagramId,
        user_flow_step: 'admin_user_deletion_completed'
      });
      
      // Refresh user list
      const usersResponse = await AdminAPI.getUsers(apiKey);
      setUsers(usersResponse.data);
      setUserToDelete(null);
      
      addToast({
        type: 'success',
        title: '삭제 완료',
        message: `@${user.instagramId} 사용자가 삭제되었습니다.`
      });
    } catch (error) {
      console.error('Failed to delete user:', error);
      
      // Track deletion failure
      trackError('admin_user_deletion_failed', error instanceof Error ? error.message : 'Unknown deletion error', 'admin_dashboard');
      trackEvent('admin_action_failed', {
        action_type: 'user_delete_failed',
        user_id: user.id,
        error_message: error instanceof Error ? error.message : 'Unknown error',
        user_flow_step: 'admin_user_deletion_failed'
      });
      
      addToast({
        type: 'error',
        title: '삭제 실패',
        message: '사용자 삭제에 실패했습니다. 다시 시도해주세요.'
      });
    }
  };

  const handleStatusUpdate = async (recommendationId: string, newStatus: Recommendation['status']): Promise<void> => {
    if (!apiKey) return;
    
    // Track status update attempt
    trackEvent('admin_action', {
      action_type: 'status_update_attempt',
      recommendation_id: recommendationId,
      new_status: newStatus,
      user_flow_step: 'admin_status_update_initiated'
    });

    trackEngagement('admin_action', 'status_update');
    
    try {
      await AdminAPI.updateRecommendationStatus(apiKey, recommendationId, newStatus);
      
      // Track successful status update
      trackEvent('admin_action_success', {
        action_type: 'status_update_success',
        recommendation_id: recommendationId,
        new_status: newStatus,
        user_flow_step: 'admin_status_update_completed'
      });
      
      // Refresh recommendations list
      loadData();
      
      addToast({
        type: 'success',
        title: '상태 업데이트 완료',
        message: `추천 상태가 ${newStatus === 'processing' ? '처리 중' : '완료'}으로 변경되었습니다.`
      });
    } catch (error) {
      console.error('Failed to update status:', error);
      
      // Track status update failure
      trackError('admin_status_update_failed', error instanceof Error ? error.message : 'Unknown status update error', 'admin_dashboard');
      trackEvent('admin_action_failed', {
        action_type: 'status_update_failed',
        recommendation_id: recommendationId,
        new_status: newStatus,
        error_message: error instanceof Error ? error.message : 'Unknown error',
        user_flow_step: 'admin_status_update_failed'
      });
      
      addToast({
        type: 'error',
        title: '상태 업데이트 실패',
        message: '상태 업데이트에 실패했습니다. 다시 시도해주세요.'
      });
    }
  };

  const handleSelectItem = (itemId: string, checked: boolean): void => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(itemId);
    } else {
      newSelected.delete(itemId);
    }
    setSelectedItems(newSelected);

    // Track selection
    trackEvent('admin_selection', {
      action_type: checked ? 'item_selected' : 'item_deselected',
      item_id: itemId,
      total_selected: newSelected.size,
      tab: activeTab,
      user_flow_step: 'admin_item_selection_changed'
    });
  };

  const handleSelectAll = (checked: boolean): void => {
    const items = activeTab === 'recommendations' ? recommendations : users;
    const newSelected = checked ? new Set(items.map(item => item.id)) : new Set<string>();
    setSelectedItems(newSelected);

    // Track select all
    trackEvent('admin_selection', {
      action_type: checked ? 'select_all' : 'deselect_all',
      total_selected: newSelected.size,
      tab: activeTab,
      user_flow_step: 'admin_select_all_changed'
    });
  };

  const handleBulkAction = async (action: typeof bulkAction): Promise<void> => {
    if (selectedItems.size === 0) return;

    // Track bulk action attempt
    trackEvent('admin_bulk_action', {
      action_type: action,
      item_count: selectedItems.size,
      tab: activeTab,
      user_flow_step: 'admin_bulk_action_initiated'
    });

    trackEngagement('admin_action', 'bulk_action');

    try {
      if (action === 'delete' && activeTab === 'users') {
        // Bulk delete users
        const deletePromises = Array.from(selectedItems).map(userId => 
          AdminAPI.deleteUser(apiKey!, userId)
        );
        await Promise.all(deletePromises);
      } else if ((action === 'process' || action === 'complete') && activeTab === 'recommendations') {
        // Bulk status update for recommendations
        const newStatus = action === 'process' ? 'processing' as const : 'completed' as const;
        const updatePromises = Array.from(selectedItems).map(recId => 
          AdminAPI.updateRecommendationStatus(apiKey!, recId, newStatus)
        );
        await Promise.all(updatePromises);
      }

      // Track successful bulk action
      trackEvent('admin_bulk_action_success', {
        action_type: action,
        item_count: selectedItems.size,
        tab: activeTab,
        user_flow_step: 'admin_bulk_action_completed'
      });

      // Clear selection and refresh data
      setSelectedItems(new Set());
      setBulkAction('none');
      loadData();
      
      const actionText = action === 'delete' ? '삭제' : action === 'process' ? '처리 시작' : '완료 처리';
      addToast({
        type: 'success',
        title: '일괄 작업 완료',
        message: `${selectedItems.size}개 항목의 ${actionText}가 완료되었습니다.`
      });
    } catch (error) {
      console.error('Bulk action failed:', error);
      
      // Track bulk action failure
      trackError('admin_bulk_action_failed', error instanceof Error ? error.message : 'Unknown bulk action error', 'admin_dashboard');
      trackEvent('admin_bulk_action_failed', {
        action_type: action,
        item_count: selectedItems.size,
        tab: activeTab,
        error_message: error instanceof Error ? error.message : 'Unknown error',
        user_flow_step: 'admin_bulk_action_failed'
      });

      addToast({
        type: 'error',
        title: '일괄 작업 실패',
        message: '일괄 작업에 실패했습니다. 다시 시도해주세요.'
      });
    }
  };

  useEffect(() => {
    if (!apiKey) {
      navigate('/admin/login');
      return;
    }

    // Track admin dashboard access
    trackEvent('admin_dashboard_access', {
      page: 'admin_dashboard',
      active_tab: activeTab,
      status_filter: statusFilter,
      user_flow_step: 'admin_dashboard_loaded'
    });

    loadData();
  }, [apiKey, statusFilter, activeTab, navigate, loadData]);

  const handleLogout = (): void => {
    logout();
    navigate('/admin/login');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'processing':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPersonalColorClass = (color: string) => {
    switch (color) {
      case 'spring':
        return 'bg-pink-100 text-pink-800';
      case 'summer':
        return 'bg-blue-100 text-blue-800';
      case 'autumn':
        return 'bg-orange-100 text-orange-800';
      case 'winter':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            로그아웃
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => {
                trackEvent('admin_tab_change', {
                  from_tab: activeTab,
                  to_tab: 'recommendations',
                  user_flow_step: 'admin_tab_switched_to_recommendations'
                });
                setActiveTab('recommendations');
                setSelectedItems(new Set()); // Clear selection when switching tabs
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'recommendations'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ShirtIcon className="w-4 h-4 inline-block mr-2" />
              히잡 추천 관리
            </button>
            <button
              onClick={() => {
                trackEvent('admin_tab_change', {
                  from_tab: activeTab,
                  to_tab: 'users',
                  user_flow_step: 'admin_tab_switched_to_users'
                });
                setActiveTab('users');
                setSelectedItems(new Set()); // Clear selection when switching tabs
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="w-4 h-4 inline-block mr-2" />
              전체 사용자 관리
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'recommendations' ? (
          <>
            {/* Statistics Cards */}
            {statistics && (
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">추천 대기중</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {statistics.byStatus.pending}명
                      </p>
                      <p className="text-xs text-gray-500 mt-1">히잡 추천 요청한 사용자</p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-400" />
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">추천 완료</p>
                      <p className="text-2xl font-bold text-green-600">
                        {statistics.byStatus.completed}명
                      </p>
                      <p className="text-xs text-gray-500 mt-1">히잡 추천까지 완료</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">총 추천 요청</p>
                      <p className="text-2xl font-bold">{statistics.total}명</p>
                      <p className="text-xs text-gray-500 mt-1">전체 히잡 추천 사용자</p>
                    </div>
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                </Card>
              </div>
            )}

        {/* User Type Info Banner */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900">사용자 유형 안내</h3>
              <p className="text-sm text-blue-700 mt-1">
                현재 <strong>히잡 추천을 요청한 사용자</strong>만 표시됩니다. 
                퍼스널 컬러만 측정받은 사용자는 별도 추적이 필요합니다.
              </p>
            </div>
          </div>
        </Card>


        {/* Filter Tabs and Bulk Actions */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            {(['pending', 'completed', 'all'] as const).map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => {
                  trackEvent('admin_filter_change', {
                    from_filter: statusFilter,
                    to_filter: status,
                    tab: activeTab,
                    user_flow_step: 'admin_filter_changed'
                  });
                  setStatusFilter(status);
                  setSelectedItems(new Set()); // Clear selection when filter changes
                }}
              >
                {status === 'all' ? '전체 히잡 추천' : status === 'pending' ? '추천 대기중' : status === 'processing' ? '처리 중' : '추천 완료'}
              </Button>
            ))}
          </div>
          
          {/* Bulk Actions */}
          {selectedItems.size > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                {selectedItems.size}개 선택됨
              </span>
              <div className="flex space-x-2">
                {activeTab === 'recommendations' && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600"
                      onClick={() => {
                        trackEvent('admin_bulk_button_click', {
                          action_type: 'bulk_process',
                          item_count: selectedItems.size,
                          user_flow_step: 'admin_bulk_process_clicked'
                        });
                        setConfirmModalState({
                          isOpen: true,
                          type: 'statusUpdate',
                          title: '일괄 처리 시작',
                          message: `선택된 ${selectedItems.size}개 추천을 처리 중 상태로 변경하시겠습니까?`,
                          onConfirm: () => {
                            setConfirmModalState(prev => ({ ...prev, isOpen: false }));
                            handleBulkAction('process');
                          }
                        });
                      }}
                    >
                      일괄 처리 시작
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-green-600"
                      onClick={() => {
                        trackEvent('admin_bulk_button_click', {
                          action_type: 'bulk_complete',
                          item_count: selectedItems.size,
                          user_flow_step: 'admin_bulk_complete_clicked'
                        });
                        setConfirmModalState({
                          isOpen: true,
                          type: 'statusUpdate',
                          title: '일괄 완료 처리',
                          message: `선택된 ${selectedItems.size}개 추천을 완료 상태로 변경하시겠습니까?`,
                          onConfirm: () => {
                            setConfirmModalState(prev => ({ ...prev, isOpen: false }));
                            handleBulkAction('complete');
                          }
                        });
                      }}
                    >
                      일괄 완료 처리
                    </Button>
                  </>
                )}
                {activeTab === 'users' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600"
                    onClick={() => {
                      trackEvent('admin_bulk_button_click', {
                        action_type: 'bulk_delete',
                        item_count: selectedItems.size,
                        user_flow_step: 'admin_bulk_delete_clicked'
                      });
                      setConfirmModalState({
                        isOpen: true,
                        type: 'bulkDelete',
                        title: '일괄 삭제 확인',
                        message: `정말로 선택된 ${selectedItems.size}개 사용자를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`,
                        onConfirm: () => {
                          setConfirmModalState(prev => ({ ...prev, isOpen: false }));
                          handleBulkAction('delete');
                        }
                      });
                    }}
                  >
                    일괄 삭제
                  </Button>
                )}
              </div>
            </div>
          )}
          
          {selectedItems.size === 0 && (
            <div className="text-sm text-gray-500">
              {activeTab === 'recommendations' ? '히잡 추천 요청 사용자 목록' : '전체 사용자 목록'}
            </div>
          )}
        </div>

            {/* Recommendations Table */}
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={recommendations.length > 0 && recommendations.every(rec => selectedItems.has(rec.id))}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        사용자 유형
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        인스타그램 ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        퍼스널 컬러
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        선호 사항
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        추천 상태
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        요청일
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        작업
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recommendations.map((rec) => (
                      <tr key={rec.id} className={`hover:bg-gray-50 ${selectedItems.has(rec.id) ? 'bg-purple-50' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedItems.has(rec.id)}
                            onChange={(e) => handleSelectItem(rec.id, e.target.checked)}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            <Users className="w-3 h-3" />
                            히잡 추천
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            @{rec.instagramId}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPersonalColorClass(rec.personalColorResult.personal_color_en)}`}>
                            {rec.personalColorResult.personal_color_en}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            <p>스타일: {rec.userPreferences.style?.join(', ') || rec.userPreferences.fitStyle?.join(', ') || '-'}</p>
                            <p className="text-gray-500">가격대: {rec.userPreferences.priceRange || '-'}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(rec.status)}`}>
                            {getStatusIcon(rec.status)}
                            {rec.status === 'pending' ? '대기 중' : rec.status === 'processing' ? '처리 중' : '완료'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(rec.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                trackEvent('admin_button_click', {
                                  button_name: 'view_recommendation',
                                  recommendation_id: rec.id,
                                  instagram_id: rec.instagramId,
                                  status: rec.status,
                                  personal_color: rec.personalColorResult.personal_color_en,
                                  user_flow_step: 'admin_recommendation_view_clicked'
                                });
                                navigate(`/admin/recommendations/${rec.id}`);
                              }}
                              className="flex items-center gap-1"
                            >
                              보기
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                            
                            {/* Status Update Button */}
                            {rec.status === 'pending' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-700"
                                onClick={() => {
                                  trackEvent('admin_button_click', {
                                    button_name: 'process_recommendation',
                                    recommendation_id: rec.id,
                                    instagram_id: rec.instagramId,
                                    current_status: rec.status,
                                    user_flow_step: 'admin_recommendation_process_clicked'
                                  });
                                  handleStatusUpdate(rec.id, 'processing');
                                }}
                              >
                                처리 시작
                              </Button>
                            )}
                            
                            {rec.status === 'processing' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:text-green-700"
                                onClick={() => {
                                  trackEvent('admin_button_click', {
                                    button_name: 'complete_recommendation',
                                    recommendation_id: rec.id,
                                    instagram_id: rec.instagramId,
                                    current_status: rec.status,
                                    user_flow_step: 'admin_recommendation_complete_clicked'
                                  });
                                  handleStatusUpdate(rec.id, 'completed');
                                }}
                              >
                                완료 처리
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        ) : (
          /* Users Tab Content */
          <>
            {/* User Statistics */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">전체 사용자</p>
                    <p className="text-2xl font-bold">{users.length}명</p>
                    <p className="text-xs text-gray-500 mt-1">퍼스널 컬러 진단 받은 모든 사용자</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-400" />
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">진단 완료</p>
                    <p className="text-2xl font-bold text-green-600">
                      {users.filter(u => u.hasAnalysis).length}명
                    </p>
                    <p className="text-xs text-gray-500 mt-1">컬러 진단이 완료된 사용자</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">히잡 추천 요청</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {users.filter(u => u.hasRecommendation).length}명
                    </p>
                    <p className="text-xs text-gray-500 mt-1">히잡 추천까지 요청한 사용자</p>
                  </div>
                  <ShirtIcon className="w-8 h-8 text-purple-400" />
                </div>
              </Card>
            </div>

            {/* Users Table */}
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={users.length > 0 && users.every(user => selectedItems.has(user.id))}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        인스타그램 ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        퍼스널 컬러
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        상태
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        가입일
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        히잡 추천
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        작업
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className={`hover:bg-gray-50 ${selectedItems.has(user.id) ? 'bg-blue-50' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedItems.has(user.id)}
                            onChange={(e) => handleSelectItem(user.id, e.target.checked)}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            @{user.instagramId}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.personalColor ? (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPersonalColorClass(user.personalColor)}`}>
                              {user.personalColor}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.hasAnalysis ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.hasAnalysis ? '진단 완료' : '진단 전'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.requestedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.hasRecommendation ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              <ShirtIcon className="w-3 h-3" />
                              요청함
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => {
                              trackEvent('admin_button_click', {
                                button_name: 'delete_user',
                                user_id: user.id,
                                instagram_id: user.instagramId,
                                user_has_analysis: user.hasAnalysis,
                                user_has_recommendation: user.hasRecommendation,
                                user_flow_step: 'admin_delete_button_clicked'
                              });
                              setConfirmModalState({
                                isOpen: true,
                                type: 'deleteUser',
                                title: '사용자 삭제 확인',
                                message: `정말로 @${user.instagramId} 사용자를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`,
                                onConfirm: () => {
                                  setConfirmModalState(prev => ({ ...prev, isOpen: false }));
                                  handleDeleteUser(user);
                                }
                              });
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}

        {/* Confirm Modal */}
        <ConfirmModal
          isOpen={confirmModalState.isOpen}
          type={confirmModalState.type === 'deleteUser' || confirmModalState.type === 'bulkDelete' ? 'danger' : 'info'}
          title={confirmModalState.title}
          message={confirmModalState.message}
          confirmText={confirmModalState.type === 'deleteUser' || confirmModalState.type === 'bulkDelete' ? '삭제' : '확인'}
          cancelText="취소"
          onConfirm={confirmModalState.onConfirm}
          onCancel={() => setConfirmModalState(prev => ({ ...prev, isOpen: false }))}
          isLoading={isDeleting}
        />
      </div>
    </PageLayout>
  );
};

export default AdminDashboard;