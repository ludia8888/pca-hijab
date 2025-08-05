import { tokens } from './src/design-system/tokens.ts';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    // Use our design tokens as the base
    colors: tokens.colors,
    spacing: tokens.spacing,
    fontSize: tokens.typography.fontSize,
    fontWeight: tokens.typography.fontWeight,
    fontFamily: tokens.typography.fontFamily,
    boxShadow: tokens.shadows,
    borderRadius: tokens.borders.radius,
    transitionDuration: tokens.transitions.duration,
    transitionTimingFunction: tokens.transitions.timing,
    screens: tokens.breakpoints,
    zIndex: tokens.zIndex,
    
    extend: {
      // Semantic typography sizes
      fontSize: {
        ...tokens.typography.heading,
        ...Object.entries(tokens.typography.body).reduce((acc, [key, value]) => ({
          ...acc,
          [`body-${key}`]: value,
        }), {}),
      },
      
      // Custom animations
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}