import { cn } from '@/utils/cn';
import { useLocation } from 'react-router-dom';
import { BottomNavigation } from '@/components/navigation';
import { ROUTES } from '@/utils/constants';

interface PageLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const PageLayout = ({
  children,
  header,
  footer,
  className,
  noPadding = false,
}: PageLayoutProps): JSX.Element => {
  const location = useLocation();
  
  // Don't show bottom navigation on landing page and admin pages
  const showBottomNav = location.pathname !== ROUTES.LANDING && !location.pathname.startsWith('/admin');
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {header}
      
      <main 
        className={cn(
          'flex-1',
          !noPadding && 'px-4 py-6 tablet:py-8',
          showBottomNav && 'pb-20', // Add bottom padding when nav is shown
          className
        )}
      >
        {children}
      </main>
      
      {footer}
      
      {/* Bottom Navigation - shown on all pages except landing */}
      {showBottomNav && <BottomNavigation />}
    </div>
  );
};