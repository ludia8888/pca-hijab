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
      // 좌/우 아이콘(버튼 포함) 지원 - 하위 호환을 위해 prefix/suffix도 유지
      leftIcon,
      rightIcon,
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

    // 좌/우 컨텐츠 병합 (leftIcon/rightIcon 우선, 없으면 prefix/suffix 사용)
    const left = leftIcon ?? prefix;
    const right = rightIcon ?? suffix;

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
        'pl-10': !!left,
        'pr-10': !!right,
        'px-3': !left && !right,
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
          {/* 좌측 아이콘/버튼 래퍼 - 포커스 방해를 피하기 위해 absolute 위치 */}
          {left && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
              {left}
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
            // Provide sensible autocomplete defaults to remove console warnings and improve UX
            autoComplete={
              props.autoComplete ?? (
                props.type === 'password'
                  ? 'current-password'
                  : props.type === 'email'
                    ? 'email'
                    : undefined
              )
            }
            {...props}
          />

          {/* 우측 아이콘/버튼 래퍼 - 비밀번호 보기 토글 등의 클릭을 지원 */}
          {right && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
              {right}
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
