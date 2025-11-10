import React from 'react';
import { Loader2 } from 'lucide-react';

interface ActionLoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ActionLoader: React.FC<ActionLoaderProps> = ({ 
  message = 'Processing...', 
  size = 'md',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-purple-600`} />
      <span className="text-sm text-gray-600">{message}</span>
    </div>
  );
};

export default ActionLoader;
