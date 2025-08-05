import type { ButtonHTMLAttributes } from 'react';
import type { ButtonBaseProps } from '@/design-system';

export interface ButtonProps extends ButtonBaseProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps> {
  // Button component already has all needed props from ButtonBaseProps
  // Any additional button-specific props can be added here
}