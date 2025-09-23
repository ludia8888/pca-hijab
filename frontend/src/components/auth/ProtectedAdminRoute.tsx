import { Navigate, Outlet } from 'react-router-dom';
import { useAdminStore } from '@/store/useAdminStore';

export const ProtectedAdminRoute = (): JSX.Element => {
  // Temporarily disable authentication check for development
  // const { isAuthenticated } = useAdminStore();

  // if (!isAuthenticated) {
  //   return <Navigate to="/admin/login" replace />;
  // }

  // Always allow access without login
  return <Outlet />;
};