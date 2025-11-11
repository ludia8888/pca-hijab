import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { AdminLoadingState } from '@/components/admin';
import { AdminAPI } from '@/services/api/admin';

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
  const [{ hydrated }, setHydrationState] = useState(() => ({
    hydrated: getPersistHelpers().hasHydrated,
  }));
  const isAdminUser =
    isAuthenticated &&
    user &&
    ['admin', 'content_manager'].includes(user.role as string);
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

  // If authenticated but store lacks admin info, verify with server-side session
  if (isAuthenticated && !isAdminUser && !checking) {
    setChecking(true);
    void AdminAPI.verify()
      .then((res) => {
        // If server confirms admin session, set minimal user to unlock route
        if (res?.success && res?.data?.admin) {
          const admin = res.data.admin as any;
          setUser({
            id: admin.userId ?? 'admin',
            email: admin.email ?? 'admin@local',
            fullName: 'Admin',
            emailVerified: true,
            role: admin.role ?? 'admin',
            createdAt: new Date(),
          } as any);
        }
      })
      .finally(() => setChecking(false));
  }

  if (!isAdminUser) {
    // While checking, keep spinner to avoid flicker
    if (checking) {
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
