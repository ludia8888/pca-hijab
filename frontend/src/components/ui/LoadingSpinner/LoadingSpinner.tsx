import { memo } from 'react';
import { cn } from '@/utils/cn';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'gray' | 'white';
  label?: string;
  className?: string;
}

const LoadingSpinnerComponent = ({
  size = 'md',
  color = 'primary',
  label,
  className,
}: LoadingSpinnerProps): JSX.Element => {
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const colorStyles = {
    primary: 'border-primary',
    secondary: 'border-secondary',
    gray: 'border-gray-400',
    white: 'border-white',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <div
        className={cn(
          'rounded-full border-4 border-t-transparent animate-spin',
          sizeStyles[size],
          colorStyles[color],
        )}
        role="status"
        aria-label={label || 'Loading'}
      >
        <span className="sr-only">{label || 'Loading'}</span>
      </div>
      {label && (
        <p className="mt-4 text-body text-gray-600">{label}</p>
      )}
    </div>
  );
};

// Memoize LoadingSpinner component
export const LoadingSpinner = memo(LoadingSpinnerComponent);
export default LoadingSpinner;