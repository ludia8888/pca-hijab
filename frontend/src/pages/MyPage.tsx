import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout';
import { PersonalColorSection, ViewedProducts, SavedProducts } from '@/components/mypage';
import { User, Settings } from 'lucide-react';
import { useAppStore } from '@/store';
import { Text } from '@/components/ui';
import { useAuthStore } from '@/store/useAuthStore';
import { trackEvent } from '@/utils/analytics';

const MyPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { instagramId, sessionId } = useAppStore();
  const { isAuthenticated, user } = useAuthStore();
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      trackEvent('mypage_auth_redirect', {
        from: 'mypage',
        reason: 'not_authenticated'
      });
      navigate('/login', { state: { from: { pathname: '/mypage' } } });
    }
  }, [isAuthenticated, navigate]);
  
  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">마이페이지</h1>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{user?.email || user?.fullName || 'Guest'}</span>
            </div>
            {sessionId && (
              <div className="flex items-center gap-1">
                <Settings className="w-4 h-4" />
                <span>세션: {sessionId.slice(0, 8)}...</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Main Content */}
        <div className="space-y-6">
          {/* Personal Color Section */}
          <PersonalColorSection />
          
          {/* Products Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recently Viewed Products */}
            <ViewedProducts />
            
            {/* Saved Products */}
            <SavedProducts />
          </div>
          
          {/* Additional Features (Future) */}
          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <Text variant="body-sm" color="gray" mb="2">
              더 많은 기능이 곧 추가됩니다!
            </Text>
            <div className="flex justify-center gap-4">
              <Text variant="caption" color="gray">• 주문 내역</Text>
              <Text variant="caption" color="gray">• 리뷰 관리</Text>
              <Text variant="caption" color="gray">• 알림 설정</Text>
              <Text variant="caption" color="gray">• 프로필 편집</Text>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default MyPage;