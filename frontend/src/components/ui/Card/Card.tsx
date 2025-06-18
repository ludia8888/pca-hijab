import { forwardRef, memo } from 'react';
import { cn } from '@/utils/cn';
import type { CardProps } from './Card.types';

const CardComponent = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      hover = false,
      padding = 'md',
      shadow = 'md',
      className,
      onClick,
      ...props
    },
    ref,
  ) => {
    // Base styles
    const baseStyles = cn(
      'bg-white rounded-xl border border-gray-200',
      'transition-all duration-normal',
    );

    // Padding styles
    const paddingStyles = {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    // Shadow styles
    const shadowStyles = {
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
    };

    // Hover styles
    const hoverStyles = hover
      ? cn(
          'cursor-pointer',
          'hover:shadow-lg hover:translate-y-[-4px]',
          'active:translate-y-0 active:shadow-md',
        )
      : '';

    // Interactive styles
    const interactiveStyles = onClick ? 'cursor-pointer' : '';

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          paddingStyles[padding],
          shadowStyles[shadow],
          hoverStyles,
          interactiveStyles,
          className,
        )}
        onClick={onClick}
        {...props}
      >
        {children}
      </div>
    );
  },
);

CardComponent.displayName = 'Card';

// Memoize Card component
export const Card = memo(CardComponent);