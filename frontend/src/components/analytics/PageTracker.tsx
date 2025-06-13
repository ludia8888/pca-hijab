import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AnalyticsEvents } from '@/utils/analytics';

interface PageTrackerProps {
  children: React.ReactNode;
}

export const PageTracker = ({ children }: PageTrackerProps): JSX.Element => {
  let location;
  
  try {
    location = useLocation();
  } catch (error) {
    // If not in router context, just render children without tracking
    return <>{children}</>;
  }

  useEffect(() => {
    if (!location) return;
    
    // Track page view on route change
    const pageName = getPageName(location.pathname);
    AnalyticsEvents.PAGE_VIEW(location.pathname);
    
    // Update document title for better tracking
    if (pageName) {
      document.title = `${pageName} | PCA Hijab`;
    }
  }, [location]);

  return <>{children}</>;
};

// Helper function to get readable page names
const getPageName = (pathname: string): string => {
  const pageMap: Record<string, string> = {
    '/': 'Home',
    '/upload': 'Upload Photo',
    '/analyzing': 'Analyzing',
    '/result': 'Analysis Result',
    '/recommendation': 'Hijab Preferences',
    '/completion': 'Completion',
    '/admin/login': 'Admin Login',
    '/admin/dashboard': 'Admin Dashboard',
  };

  // Handle dynamic routes
  if (pathname.startsWith('/admin/recommendations/')) {
    return 'Admin User Detail';
  }

  return pageMap[pathname] || 'Unknown Page';
};