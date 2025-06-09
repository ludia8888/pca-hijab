import { Navigate, Outlet } from 'react-router-dom';
import { useAdminStore } from '@/store/useAdminStore';

export const ProtectedAdminRoute = (): JSX.Element => {
  const { isAuthenticated } = useAdminStore();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};