import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '@/store/useAdminStore';
import { AdminAPI } from '@/services/api/admin';
import { Card, Button, LoadingSpinner } from '@/components/ui';
import { PageLayout } from '@/components/layout';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  LogOut,
  ChevronRight,
  Palette
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

const AdminDashboard = (): JSX.Element => {
  const navigate = useNavigate();
  const { apiKey, logout } = useAdminStore();
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'processing' | 'completed'>('all');

  useEffect(() => {
    if (!apiKey) {
      navigate('/admin/login');
      return;
    }

    loadData();
  }, [apiKey, statusFilter]);

  const loadData = async (): Promise<void> => {
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
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold">{statistics.total}</p>
                </div>
                <Users className="w-8 h-8 text-gray-400" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {statistics.byStatus.pending}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Processing</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {statistics.byStatus.processing}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-blue-400" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {statistics.byStatus.completed}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </Card>
          </div>
        )}

        {/* Personal Color Distribution */}
        {statistics && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Personal Color Distribution
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(statistics.byPersonalColor).map(([color, count]) => (
                <div key={color} className="text-center">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPersonalColorClass(color)}`}>
                    {color.toUpperCase()}
                  </div>
                  <p className="text-2xl font-bold mt-2">{count}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Filter Tabs */}
        <div className="flex space-x-2">
          {(['all', 'pending', 'processing', 'completed'] as const).map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>

        {/* Recommendations Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Instagram ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Personal Color
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preferences
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recommendations.map((rec) => (
                  <tr key={rec.id} className="hover:bg-gray-50">
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
                        <p>Style: {rec.userPreferences.style.join(', ')}</p>
                        <p className="text-gray-500">Price: {rec.userPreferences.priceRange}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(rec.status)}`}>
                        {getStatusIcon(rec.status)}
                        {rec.status}
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
                        View
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
};

export default AdminDashboard;