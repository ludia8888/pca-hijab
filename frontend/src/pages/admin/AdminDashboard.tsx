import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '@/store/useAdminStore';
import { AdminAPI } from '@/services/api/admin';
import { Card, Button, LoadingSpinner } from '@/components/ui';
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
      
      alert('사용자 삭제에 실패했습니다.');
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


        {/* Filter Tabs */}
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
                }}
              >
                {status === 'all' ? '전체 히잡 추천' : status === 'pending' ? '추천 대기중' : status === 'processing' ? '처리 중' : '추천 완료'}
              </Button>
            ))}
          </div>
          <div className="text-sm text-gray-500">
            히잡 추천 요청 사용자 목록
          </div>
        </div>

            {/* Recommendations Table */}
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
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
                      <tr key={rec.id} className="hover:bg-gray-50">
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/admin/recommendations/${rec.id}`)}
                            className="flex items-center gap-1"
                          >
                            보기
                            <ChevronRight className="w-4 h-4" />
                          </Button>
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
                      <tr key={user.id} className="hover:bg-gray-50">
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
                              setUserToDelete(user);
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

        {/* Delete Confirmation Modal */}
        {userToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-md w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                사용자 삭제 확인
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                정말로 <strong>@{userToDelete.instagramId}</strong> 사용자를 삭제하시겠습니까?
                <br />
                이 작업은 되돌릴 수 없습니다.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="ghost"
                  onClick={() => {
                    trackEvent('admin_modal_action', {
                      action_type: 'delete_cancel',
                      user_id: userToDelete.id,
                      instagram_id: userToDelete.instagramId,
                      user_flow_step: 'admin_delete_cancelled'
                    });
                    setUserToDelete(null);
                  }}
                >
                  취소
                </Button>
                <Button
                  variant="primary"
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => {
                    trackEvent('admin_modal_action', {
                      action_type: 'delete_confirm',
                      user_id: userToDelete.id,
                      instagram_id: userToDelete.instagramId,
                      user_flow_step: 'admin_delete_confirmed'
                    });
                    handleDeleteUser(userToDelete);
                  }}
                >
                  삭제
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default AdminDashboard;