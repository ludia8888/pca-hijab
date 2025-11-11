import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import ScrollToTop from '@/components/common/ScrollToTop';

/**
 * Root Layout Component
 * Wraps all routes with common functionality like ScrollToTop
 */
const RootLayout = (): JSX.Element => {
  const { isAuthenticated, user, checkAuth } = useAuthStore();

  // 앱 전역 1회 사용자 동기화: 새로고침/직접 접근 시 'Guest' 표기 방지
  useEffect(() => {
    const w = window as unknown as { __AUTH_INIT__?: boolean };
    if (!w.__AUTH_INIT__) {
      w.__AUTH_INIT__ = true;
      if (isAuthenticated && !user) {
        void checkAuth().catch(() => {});
      }
    }
  }, [isAuthenticated, user, checkAuth]);

  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
};

export default RootLayout;
