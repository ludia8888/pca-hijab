import { NavigateFunction } from 'react-router-dom';

/**
 * Navigate with scroll reset
 * Ensures viewport is at top when navigating programmatically
 */
export const navigateWithScrollReset = (navigate: NavigateFunction, path: string): void => {
  // Reset scroll position before navigation
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  
  // Navigate to new path
  navigate(path);
  
  // Double-check scroll reset after navigation
  requestAnimationFrame(() => {
    window.scrollTo(0, 0);
  });
};