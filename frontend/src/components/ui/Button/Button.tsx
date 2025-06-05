import { forwardRef } from 'react';
import { cn } from '@/utils/cn';
import type { ButtonProps } from './Button.types';

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      children,
      loading = false,
      fullWidth = false,
      icon,
      iconPosition = 'left',
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    // Base styles
    const baseStyles = cn(
      'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-normal',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'active:scale-[0.98]',
      'no-select',
    );

    // Variant styles
    const variantStyles = {
      primary: cn(
        'bg-primary text-white shadow-primary',
        'hover:bg-primary-dark hover:shadow-md',
        'focus-visible:ring-primary',
      ),
      secondary: cn(
        'bg-white text-primary border-2 border-primary',
        'hover:bg-gray-50',
        'focus-visible:ring-primary',
      ),
      ghost: cn(
        'bg-transparent text-gray-600 border border-gray-300',
        'hover:bg-gray-100 hover:text-gray-700',
        'focus-visible:ring-gray-400',
      ),
    };

    // Size styles
    const sizeStyles = {
      sm: 'px-4 py-2 text-body-sm min-h-[40px]',
      md: 'px-6 py-3 text-body min-h-[44px]',
      lg: 'px-8 py-4 text-body-lg min-h-[52px]',
    };

    // Width styles
    const widthStyles = fullWidth ? 'w-full' : '';

    // Loading spinner
    const LoadingSpinner = (): JSX.Element => (
      <svg
        className="animate-spin h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          widthStyles,
          className,
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span className={cn(iconPosition === 'left' ? 'mr-2' : 'order-2 ml-2')}>
            <LoadingSpinner />
          </span>
        )}
        {icon && !loading && (
          <span
            className={cn(
              'inline-flex',
              iconPosition === 'left' ? 'mr-2' : 'order-2 ml-2',
            )}
          >
            {icon}
          </span>
        )}
        <span className="truncate">{children}</span>
      </button>
    );
  },
);

Button.displayName = 'Button';

export { Button };