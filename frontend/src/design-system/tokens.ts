// Design System Tokens - Single Source of Truth for all design values

export const colors = {
  // Primary colors - Soft pink palette
  primary: {
    50: '#FFF5F7',
    100: '#FFE4E9',
    200: '#FFD1DC',
    300: '#FFB6C8',
    400: '#FF00B9', // Main primary - soft pink
    500: '#FF6B8A',
    600: '#FF5178', // Primary dark - deeper pink
    700: '#E94368',
    800: '#CC3654',
    900: '#AA2A44',
  },
  
  // Secondary colors
  secondary: {
    50: '#F0FFFE',
    100: '#E0FFFC',
    200: '#B8FFF8',
    300: '#6ED7D0', // Secondary light
    400: '#4ECDC4', // Main secondary
    500: '#3BB8B0', // Secondary dark
    600: '#2E9B94',
    700: '#227E78',
    800: '#1A615C',
    900: '#124440',
  },
  
  // Neutral colors
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
    950: '#030712',
  },
  
  // Semantic colors
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#10B981', // Main success
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },
  
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B', // Main warning
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444', // Main error
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },
  
  info: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6', // Main info
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  
  // Base colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export const spacing = {
  0: '0',
  px: '1px',
  0.5: '0.125rem', // 2px
  1: '0.25rem',    // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem',     // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem',    // 12px
  3.5: '0.875rem', // 14px
  4: '1rem',       // 16px
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px
  7: '1.75rem',    // 28px
  8: '2rem',       // 32px
  9: '2.25rem',    // 36px
  10: '2.5rem',    // 40px
  11: '2.75rem',   // 44px
  12: '3rem',      // 48px
  14: '3.5rem',    // 56px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
  28: '7rem',      // 112px
  32: '8rem',      // 128px
  36: '9rem',      // 144px
  40: '10rem',     // 160px
  44: '11rem',     // 176px
  48: '12rem',     // 192px
  52: '13rem',     // 208px
  56: '14rem',     // 224px
  60: '15rem',     // 240px
  64: '16rem',     // 256px
  72: '18rem',     // 288px
  80: '20rem',     // 320px
  96: '24rem',     // 384px
} as const;

export const typography = {
  // Font families
  fontFamily: {
    sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
    mono: ['Consolas', 'Monaco', 'monospace'],
  },
  
  // Font sizes with line heights
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
    base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
    '5xl': ['3rem', { lineHeight: '1' }],           // 48px
    '6xl': ['3.75rem', { lineHeight: '1' }],        // 60px
    '7xl': ['4.5rem', { lineHeight: '1' }],         // 72px
    '8xl': ['6rem', { lineHeight: '1' }],           // 96px
    '9xl': ['8rem', { lineHeight: '1' }],           // 128px
  },
  
  // Semantic font sizes
  heading: {
    h1: ['2rem', { lineHeight: '1.2', fontWeight: '700' }],      // 32px
    h2: ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],    // 24px
    h3: ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],   // 20px
    h4: ['1.125rem', { lineHeight: '1.4', fontWeight: '500' }],  // 18px
    h5: ['1rem', { lineHeight: '1.5', fontWeight: '500' }],      // 16px
    h6: ['0.875rem', { lineHeight: '1.5', fontWeight: '500' }],  // 14px
  },
  
  body: {
    lg: ['1.125rem', { lineHeight: '1.75' }],  // 18px
    base: ['1rem', { lineHeight: '1.5' }],     // 16px
    sm: ['0.875rem', { lineHeight: '1.4' }],   // 14px
    xs: ['0.75rem', { lineHeight: '1.3' }],    // 12px
  },
  
  // Font weights
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
} as const;

export const shadows = {
  none: 'none',
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 2px 4px rgba(0, 0, 0, 0.1)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 12px rgba(0, 0, 0, 0.1)',
  lg: '0 8px 24px rgba(0, 0, 0, 0.12)',
  xl: '0 10px 25px rgba(0, 0, 0, 0.12), 0 4px 10px rgba(0, 0, 0, 0.06)',
  '2xl': '0 20px 40px rgba(0, 0, 0, 0.15)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  // Colored shadows
  primary: '0 4px 12px rgba(255, 145, 164, 0.3)', // Updated to match new primary-400
  secondary: '0 4px 12px rgba(78, 205, 196, 0.3)',
} as const;

export const borders = {
  radius: {
    none: '0',
    sm: '0.25rem',    // 4px
    base: '0.375rem', // 6px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    '2xl': '1.5rem',  // 24px
    '3xl': '2rem',    // 32px
    full: '9999px',
  },
  
  width: {
    0: '0',
    1: '1px',
    2: '2px',
    4: '4px',
    8: '8px',
  },
} as const;

export const transitions = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '600ms',
  },
  
  timing: {
    linear: 'linear',
    in: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
    out: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    'in-out': 'cubic-bezier(0.645, 0.045, 0.355, 1)',
  },
} as const;

export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export const zIndex = {
  0: 0,
  10: 10,
  20: 20,
  30: 30,
  40: 40,
  50: 50,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

// Type exports for TypeScript
export type Colors = typeof colors;
export type ColorKey = keyof Colors;
export type Spacing = typeof spacing;
export type SpacingKey = keyof Spacing;
export type Typography = typeof typography;
export type Shadows = typeof shadows;
export type ShadowKey = keyof Shadows;
export type Borders = typeof borders;
export type Transitions = typeof transitions;
export type Breakpoints = typeof breakpoints;
export type BreakpointKey = keyof Breakpoints;
export type ZIndex = typeof zIndex;
export type ZIndexKey = keyof ZIndex;

// Design token types
export interface DesignTokens {
  colors: Colors;
  spacing: Spacing;
  typography: Typography;
  shadows: Shadows;
  borders: Borders;
  transitions: Transitions;
  breakpoints: Breakpoints;
  zIndex: ZIndex;
}

// Export all tokens as a single object
export const tokens: DesignTokens = {
  colors,
  spacing,
  typography,
  shadows,
  borders,
  transitions,
  breakpoints,
  zIndex,
};