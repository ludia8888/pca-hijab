// Design System Types - Unified component prop interfaces

import type { ReactNode, HTMLAttributes, CSSProperties } from 'react';
import type { Colors, Spacing, Typography, Shadows, Borders } from './tokens';

// Base variant types used across all components
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type Color = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'gray';
export type Variant = 'solid' | 'outline' | 'ghost' | 'soft';
export type Radius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type Shadow = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Spacing prop types
export type SpacingValue = keyof Spacing | 'auto';
export interface SpacingProps {
  // Padding
  p?: SpacingValue;
  px?: SpacingValue;
  py?: SpacingValue;
  pt?: SpacingValue;
  pr?: SpacingValue;
  pb?: SpacingValue;
  pl?: SpacingValue;
  
  // Margin
  m?: SpacingValue;
  mx?: SpacingValue;
  my?: SpacingValue;
  mt?: SpacingValue;
  mr?: SpacingValue;
  mb?: SpacingValue;
  ml?: SpacingValue;
  
  // Gap (for flex/grid)
  gap?: SpacingValue;
  gapX?: SpacingValue;
  gapY?: SpacingValue;
}

// Typography prop types
export interface TypographyProps {
  fontSize?: keyof Typography['fontSize'];
  fontWeight?: keyof Typography['fontWeight'];
  lineHeight?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textColor?: Color | 'inherit' | 'current';
}

// Layout prop types
export interface LayoutProps {
  display?: 'block' | 'inline-block' | 'flex' | 'inline-flex' | 'grid' | 'none';
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  width?: string | number;
  height?: string | number;
  maxWidth?: string | number;
  maxHeight?: string | number;
  minWidth?: string | number;
  minHeight?: string | number;
  overflow?: 'visible' | 'hidden' | 'auto' | 'scroll';
}

// Flex prop types
export interface FlexProps {
  flexDirection?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  flexWrap?: 'wrap' | 'nowrap' | 'wrap-reverse';
  justifyContent?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  alignItems?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  alignContent?: 'start' | 'end' | 'center' | 'between' | 'around' | 'stretch';
  flex?: string | number;
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: string | number;
}

// Grid prop types
export interface GridProps {
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  gridColumn?: string;
  gridRow?: string;
  gridGap?: SpacingValue;
  gridColumnGap?: SpacingValue;
  gridRowGap?: SpacingValue;
}

// Border prop types
export interface BorderProps {
  border?: boolean | number;
  borderTop?: boolean | number;
  borderRight?: boolean | number;
  borderBottom?: boolean | number;
  borderLeft?: boolean | number;
  borderColor?: Color | string;
  borderRadius?: Radius;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
}

// Effect prop types
export interface EffectProps {
  shadow?: Shadow;
  opacity?: number;
  cursor?: 'auto' | 'pointer' | 'not-allowed' | 'wait' | 'text' | 'move';
  transition?: boolean | string;
  transform?: string;
  zIndex?: number;
}

// Base component props that all components should extend
export interface BaseComponentProps extends 
  SpacingProps, 
  TypographyProps, 
  LayoutProps, 
  BorderProps, 
  EffectProps,
  HTMLAttributes<HTMLElement> {
  as?: keyof JSX.IntrinsicElements;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

// Common component prop patterns
export interface InteractiveComponentProps {
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  onHover?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export interface FormComponentProps {
  name?: string;
  value?: any;
  defaultValue?: any;
  onChange?: (value: any) => void;
  onBlur?: () => void;
  error?: boolean;
  errorMessage?: string;
  required?: boolean;
  placeholder?: string;
  label?: string;
  helperText?: string;
}

// Component-specific base props
export interface ButtonBaseProps extends BaseComponentProps, InteractiveComponentProps {
  variant?: Variant;
  size?: Size;
  color?: Color;
  fullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

export interface CardBaseProps extends BaseComponentProps {
  variant?: 'elevated' | 'outlined' | 'filled';
  interactive?: boolean;
  hover?: boolean;
}

export interface InputBaseProps extends BaseComponentProps, FormComponentProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  size?: Size;
  variant?: 'outline' | 'filled' | 'underline';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

export interface TextBaseProps extends BaseComponentProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'body-lg' | 'body-sm' | 'caption';
  color?: Color | 'inherit' | 'current';
  weight?: keyof Typography['fontWeight'];
  align?: 'left' | 'center' | 'right' | 'justify';
  truncate?: boolean;
  clamp?: number;
}

// Theme context types
export interface Theme {
  tokens: {
    colors: Colors;
    spacing: Spacing;
    typography: Typography;
    shadows: Shadows;
    borders: Borders;
  };
  mode: 'light' | 'dark';
}

// Style generation utilities types
export type StyleProps = Partial<BaseComponentProps>;
export type ComponentStyles = Record<string, CSSProperties>;

// Responsive prop types
export type ResponsiveValue<T> = T | {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
};

// Make all base props responsive
export type ResponsiveProps<T> = {
  [K in keyof T]?: ResponsiveValue<T[K]>;
};