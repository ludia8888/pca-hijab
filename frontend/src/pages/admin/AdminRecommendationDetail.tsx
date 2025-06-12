import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdminStore } from '@/store/useAdminStore';
import { AdminAPI } from '@/services/api/admin';
import { Card, Button, LoadingSpinner } from '@/components/ui';
import { PageLayout } from '@/components/layout';
import { ArrowLeft, Instagram, Palette, Tag, Calendar, FileText } from 'lucide-react';
import type { Recommendation } from '@/types';

const AdminRecommendationDetail = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { apiKey } = useAdminStore();
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadRecommendation = useCallback(async (): Promise<void> => {
    if (!apiKey || !id) return;

    setIsLoading(true);
    try {
      const data = await AdminAPI.getRecommendation(apiKey, id);
      setRecommendation(data);
    } catch {
      // Handle error silently
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, id]);

  useEffect(() => {
    if (!apiKey || !id) {
      navigate('/admin/login');
      return;
    }

    loadRecommendation();
  }, [apiKey, id, navigate, loadRecommendation]);

  const handleStatusUpdate = async (newStatus: 'pending' | 'processing' | 'completed'): Promise<void> => {
    if (!apiKey || !id || !recommendation) return;

    setIsUpdating(true);
    try {
      const updated = await AdminAPI.updateRecommendationStatus(apiKey, id, newStatus);
      setRecommendation(updated);
    } catch {
      // Handle error silently
    } finally {
      setIsUpdating(false);
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '대기 중';
      case 'processing':
        return '처리 중';
      case 'completed':
        return '완료';
      default:
        return status;
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

  if (!recommendation) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">추천을 찾을 수 없습니다</p>
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/dashboard')}
            className="mt-4"
          >
            대시보드로 돌아가기
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            대시보드로 돌아가기
          </Button>
        </div>

        {/* User Info Card */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Instagram className="w-5 h-5" />
            사용자 정보
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">인스타그램 ID</p>
              <p className="font-medium">@{recommendation.instagramId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">세션 ID</p>
              <p className="font-mono text-sm">{recommendation.sessionId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">생성일시</p>
              <p className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-gray-400" />
                {new Date(recommendation.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">상태</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(recommendation.status)}`}>
                  {getStatusText(recommendation.status)}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Personal Color Result */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Palette className="w-5 h-5" />
            퍼스널 컬러 분석
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">시즌</p>
                <p className="font-medium capitalize">
                  {recommendation.personalColorResult.personal_color_en} ({recommendation.personalColorResult.personal_color})
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">톤</p>
                <p className="font-medium">
                  {recommendation.personalColorResult.tone_en} ({recommendation.personalColorResult.tone})
                </p>
              </div>
            </div>

            {recommendation.personalColorResult.confidence && (
              <div>
                <p className="text-sm text-gray-600">신뢰도 점수</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${recommendation.personalColorResult.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {(recommendation.personalColorResult.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            )}

            {/* Best Colors */}
            {recommendation.personalColorResult.bestColors && (
              <div>
                <p className="text-sm text-gray-600 mb-2">추천 컬러</p>
                <div className="flex flex-wrap gap-2">
                  {recommendation.personalColorResult.bestColors.map((color, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-md border border-gray-200"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-sm">{color.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* User Preferences */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5" />
            사용자 선호사항
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">스타일 선호도</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {recommendation.userPreferences.style.map((style) => (
                  <span key={style} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                    {style}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600">가격대</p>
              <p className="font-medium">{recommendation.userPreferences.priceRange}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">선호 소재</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {recommendation.userPreferences.material.map((material) => (
                  <span key={material} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                    {material}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600">착용 상황</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {recommendation.userPreferences.occasion.map((occasion) => (
                  <span key={occasion} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                    {occasion}
                  </span>
                ))}
              </div>
            </div>

            {recommendation.userPreferences.additionalNotes && (
              <div>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  추가 메모
                </p>
                <p className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                  {recommendation.userPreferences.additionalNotes}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Status Update Actions */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">상태 업데이트</h2>
          <div className="flex gap-3">
            <Button
              variant={recommendation.status === 'pending' ? 'primary' : 'secondary'}
              onClick={() => handleStatusUpdate('pending')}
              disabled={isUpdating || recommendation.status === 'pending'}
              loading={isUpdating}
            >
              대기 중으로 변경
            </Button>
            <Button
              variant={recommendation.status === 'processing' ? 'primary' : 'secondary'}
              onClick={() => handleStatusUpdate('processing')}
              disabled={isUpdating || recommendation.status === 'processing'}
              loading={isUpdating}
            >
              처리 중으로 변경
            </Button>
            <Button
              variant={recommendation.status === 'completed' ? 'primary' : 'secondary'}
              onClick={() => handleStatusUpdate('completed')}
              disabled={isUpdating || recommendation.status === 'completed'}
              loading={isUpdating}
            >
              완료로 변경
            </Button>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
};

export default AdminRecommendationDetail;