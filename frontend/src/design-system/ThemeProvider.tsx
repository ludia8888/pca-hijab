import React, { createContext, useContext, useEffect, useState } from 'react';
import { tokens } from './tokens';
import type { Theme } from './types';

// Theme context
interface ThemeContextValue {
  theme: Theme;
  setMode: (mode: 'light' | 'dark') => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// Hook to use theme
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// CSS custom properties generator
const generateCSSVariables = (theme: Theme): Record<string, string> => {
  const cssVars: Record<string, string> = {};
  
  // Colors
  Object.entries(theme.tokens.colors).forEach(([colorKey, colorValue]) => {
    if (typeof colorValue === 'string') {
      cssVars[`--color-${colorKey}`] = colorValue;
    } else if (typeof colorValue === 'object') {
      Object.entries(colorValue).forEach(([shade, value]) => {
        if (typeof value === 'string') {
          cssVars[`--color-${colorKey}-${shade}`] = value;
        }
      });
    }
  });
  
  // Spacing
  Object.entries(theme.tokens.spacing).forEach(([key, value]) => {
    cssVars[`--spacing-${key}`] = value;
  });
  
  // Typography
  Object.entries(theme.tokens.typography.fontSize).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      cssVars[`--font-size-${key}`] = value[0];
      if (value[1]?.lineHeight) {
        cssVars[`--line-height-${key}`] = value[1].lineHeight;
      }
    }
  });
  
  // Shadows
  Object.entries(theme.tokens.shadows).forEach(([key, value]) => {
    cssVars[`--shadow-${key}`] = value;
  });
  
  // Border radius
  Object.entries(theme.tokens.borders.radius).forEach(([key, value]) => {
    cssVars[`--radius-${key}`] = value;
  });
  
  return cssVars;
};

// Theme provider component
export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultMode?: 'light' | 'dark';
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  defaultMode = 'light' 
}) => {
  const [mode, setMode] = useState<'light' | 'dark'>(defaultMode);
  
  // Create theme object
  const theme: Theme = {
    tokens,
    mode,
  };
  
  // Toggle theme mode
  const toggleMode = () => {
    setMode(prevMode => prevMode === 'light' ? 'dark' : 'light');
  };
  
  // Apply CSS variables to root
  useEffect(() => {
    const cssVars = generateCSSVariables(theme);
    const root = document.documentElement;
    
    // Apply CSS variables
    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    
    // Add theme mode class
    root.classList.remove('theme-light', 'theme-dark');
    root.classList.add(`theme-${mode}`);
    
    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        mode === 'light' ? tokens.colors.white : tokens.colors.gray[900]
      );
    }
  }, [theme, mode]);
  
  // Persist theme preference
  useEffect(() => {
    const savedMode = localStorage.getItem('theme-mode') as 'light' | 'dark' | null;
    if (savedMode) {
      setMode(savedMode);
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem('theme-mode', mode);
  }, [mode]);
  
  const value: ThemeContextValue = {
    theme,
    setMode,
    toggleMode,
  };
  
  return (
    <ThemeContext.Provider value={value}>
      <div className={`theme-provider theme-${mode}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

// HOC for applying theme to components
export function withTheme<P extends object>(
  Component: React.ComponentType<P & { theme: Theme }>
): React.ComponentType<P> {
  return function ThemedComponent(props: P) {
    const { theme } = useTheme();
    return <Component {...props} theme={theme} />;
  };
}