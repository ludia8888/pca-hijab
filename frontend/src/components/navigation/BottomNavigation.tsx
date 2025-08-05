import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';
import { useAppStore } from '@/store';
import { SessionAPI } from '@/services/api/session';
import { env } from '@/config/environment';

interface BottomNavItem {
  id: string;
  label: string;
  icon: string;
  activeIcon: string;
  route: string;
}

const NAV_ITEMS: BottomNavItem[] = [
  {
    id: 'home',
    label: '홈',
    icon: '🏠',
    activeIcon: '🏠',
    route: ROUTES.HOME,
  },
  {
    id: 'products',
    label: '추천상품',
    icon: '🛍️',
    activeIcon: '🛍️',
    route: ROUTES.PRODUCTS,
  },
  {
    id: 'diagnosis',
    label: '진단하기',
    icon: '🎨',
    activeIcon: '🎨',
    route: ROUTES.DIAGNOSIS,
  },
  {
    id: 'mypage',
    label: '마이페이지',
    icon: '👤',
    activeIcon: '👤',
    route: ROUTES.MYPAGE,
  },
];

const BottomNavigation = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionId, setSessionData } = useAppStore();

  // Filter navigation items based on environment
  const visibleNavItems = env.isProduction 
    ? NAV_ITEMS.filter(item => item.id === 'home' || item.id === 'diagnosis')
    : NAV_ITEMS;

  const isActive = (route: string): boolean => {
    if (route === ROUTES.HOME) {
      return location.pathname === ROUTES.HOME;
    }
    return location.pathname.startsWith(route);
  };

  const handleNavClick = async (item: BottomNavItem): Promise<void> => {
    // Special handling for diagnosis button
    if (item.id === 'diagnosis' && !sessionId) {
      try {
        // Create session first
        const response = await SessionAPI.createSession();
        setSessionData(response.data.sessionId);
        // Then navigate to diagnosis
        navigate(ROUTES.DIAGNOSIS);
      } catch (error) {
        console.error('Failed to create session:', error);
        // Fallback to home if session creation fails
        navigate(ROUTES.HOME);
      }
    } else {
      navigate(item.route);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-screen-sm mx-auto">
        <div className="flex justify-around items-center py-2">
          {visibleNavItems.map((item) => {
            const active = isActive(item.route);
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 transition-colors ${
                  active 
                    ? 'text-purple-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="text-xl mb-1">
                  {active ? item.activeIcon : item.icon}
                </span>
                <span className="text-xs font-medium truncate">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNavigation;