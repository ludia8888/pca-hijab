import { useNavigate } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { AnalyticsEvents } from '@/utils/analytics';

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

  const handleBack = (): void => {
    // Track back button click
    AnalyticsEvents.BUTTON_CLICK({
      button_name: 'back',
      page: 'header'
    });
    
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
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
          {actions && actions.length > 0 && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};