import { useNavigate, Link } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { trackEvent } from '@/utils/analytics';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui';
import { User, LogOut } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode[];
  className?: string;
}

export const Header = ({
  title = 'Noor.AI',
  showBack = false,
  onBack,
  actions,
  className,
}: HeaderProps): JSX.Element => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();

  const handleBack = (): void => {
    // Track back button click
    trackEvent('button_click', {
      button_name: 'back',
      page: 'header'
    });
    
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const handleLogout = async (): Promise<void> => {
    try {
      trackEvent('logout_click', {
        page: 'header',
        user_email: user?.email
      });
      
      await logout();
      toast.success('로그아웃되었습니다');
      navigate('/');
    } catch (error) {
      toast.error('로그아웃 실패');
    }
  };

  return (
    <header className={cn('sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm safe-top border-b border-gray-100', className)}>
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-between h-14 tablet:h-16">
          {/* Left section */}
          <div className="flex items-center">
            {showBack && (
              <button
                onClick={handleBack}
                className="mr-3 p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Go back"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-gray-700"
                >
                  <path
                    d="M15 18L9 12L15 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
            <h1 className="text-h4 tablet:text-h3 font-bold text-primary">
              {title}
            </h1>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-2">
            {actions && actions.length > 0 && actions}
            
            {/* Auth buttons */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link to="/profile" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <User className="w-5 h-5 text-gray-700" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Logout"
                >
                  <LogOut className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            ) : (
              <Link to="/login">
                <Button variant="secondary" size="sm">
                  로그인
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
