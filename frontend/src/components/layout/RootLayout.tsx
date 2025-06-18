import { Outlet } from 'react-router-dom';
import ScrollToTop from '@/components/common/ScrollToTop';

/**
 * Root Layout Component
 * Wraps all routes with common functionality like ScrollToTop
 */
const RootLayout = (): JSX.Element => {
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
};

export default RootLayout;