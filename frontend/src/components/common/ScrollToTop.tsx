import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * Ensures viewport always starts at the top when navigating between routes
 * Prevents UX issues where users see content from previous scroll position
 */
const ScrollToTop = (): null => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // Use instant to avoid animation delay
    });

    // Also reset document scroll position for better compatibility
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  return null;
};

export default ScrollToTop;