import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { AdminLoadingState } from '@/components/admin';

const getPersistHelpers = () => {
  const persist = useAuthStore.persist;
  return {
    hasHydrated: persist?.hasHydrated?.() ?? true,
    onHydrate: persist?.onHydrate,
    onFinishHydration: persist?.onFinishHydration,
  };
};

export const ProtectedAdminRoute = (): JSX.Element => {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setUser = useAuthStore((state) => state.setUser);
  const isAdminSession = useAuthStore((state) => state.isAdminSession);
  const [{ hydrated }, setHydrationState] = useState(() => ({
    hydrated: getPersistHelpers().hasHydrated,
  }));
  const isAdminUser =
    isAuthenticated &&
    user &&
    ['admin', 'content_manager'].includes(user.role as string);
  // Start idle; trigger verification effect explicitly when needed
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const { onHydrate, onFinishHydration } = getPersistHelpers();

    const unsubscribeHydrate = onHydrate?.(() => {
      setHydrationState({ hydrated: false });
    });

    const unsubscribeFinish = onFinishHydration?.(() => {
      setHydrationState({ hydrated: true });
    });

    return () => {
      unsubscribeHydrate?.();
      unsubscribeFinish?.();
    };
  }, []);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <AdminLoadingState />
      </div>
    );
  }

  // 관리자 접근은 반드시 admin 로그인 화면을 통해 진입해야 함
  // 일반 로그인 상태에서 URL로 직접 접근 시에도 /admin/login으로 강제 이동
  useEffect(() => {
    if (!isAdminSession) {
      setChecking(false);
    }
  }, [isAdminSession]);

  // 관리자 권한만 충족하면 접근 허용 (백엔드와 동일한 롤 기준)
  if (!isAdminUser) {
    // While checking, keep spinner to avoid flicker
    if (checking && hydrated) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <AdminLoadingState />
        </div>
      );
    }
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};
