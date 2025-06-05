import { forwardRef, useId } from 'react';
import { cn } from '@/utils/cn';
import type { InputProps } from './Input.types';

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      size = 'md',
      fullWidth = false,
      prefix,
      suffix,
      className,
      required,
      disabled,
      ...props
    },
    ref,
  ) => {
    const inputId = useId();
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    // Base styles
    const containerStyles = cn('relative', fullWidth && 'w-full');

    const inputStyles = cn(
      'w-full rounded-lg border bg-white text-gray-900 transition-all duration-normal',
      'placeholder:text-gray-400',
      'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
      'disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500',
      {
        'border-gray-300': !error,
        'border-error': error,
        'pl-10': prefix,
        'pr-10': suffix,
        'px-3': !prefix && !suffix,
      },
    );

    // Size styles
    const sizeStyles = {
      sm: 'py-2 text-body-sm min-h-[40px]',
      md: 'py-3 text-body min-h-[44px]',
      lg: 'py-4 text-body-lg min-h-[48px]',
    };

    return (
      <div className={containerStyles}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-body font-medium text-gray-700 mb-2"
          >
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {prefix && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
              {prefix}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(inputStyles, sizeStyles[size], className)}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            disabled={disabled}
            required={required}
            {...props}
          />

          {suffix && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
              {suffix}
            </span>
          )}
        </div>

        {error && (
          <p id={errorId} className="mt-2 text-body-sm text-error">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={helperId} className="mt-2 text-body-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export { Input };