import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAdminStore } from '@/store/useAdminStore';
import { AdminLoadingState } from '@/components/admin';

const getPersistHelpers = () => {
  const persist = useAdminStore.persist;
  return {
    hasHydrated: persist?.hasHydrated?.() ?? true,
    onHydrate: persist?.onHydrate,
    onFinishHydration: persist?.onFinishHydration,
  };
};

export const ProtectedAdminRoute = (): JSX.Element => {
  const location = useLocation();
  const isAuthenticated = useAdminStore((state) => state.isAuthenticated);
  const [{ hydrated }, setHydrationState] = useState(() => ({
    hydrated: getPersistHelpers().hasHydrated,
  }));

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

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};
