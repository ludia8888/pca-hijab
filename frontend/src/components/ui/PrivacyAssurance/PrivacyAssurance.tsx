import { useEffect, useState } from 'react';
import { cn } from '@/utils/cn';

interface PrivacyAssuranceProps {
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export const PrivacyAssurance = ({ 
  onClose, 
  autoClose = true,
  autoCloseDelay = 7000 
}: PrivacyAssuranceProps): JSX.Element | null => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Show popup after a short delay for smooth entrance
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 500);

    // Auto close if enabled
    let closeTimer: NodeJS.Timeout;
    if (autoClose) {
      closeTimer = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);
    }

    return () => {
      clearTimeout(showTimer);
      if (closeTimer) clearTimeout(closeTimer);
    };
  }, [autoClose, autoCloseDelay]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        "fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40",
        "transition-all duration-500 ease-out",
        isClosing ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0",
        !isClosing && "animate-gentle-bounce"
      )}
    >
      {/* Glassmorphism Card */}
      <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 max-w-xs mx-4">
        {/* Glass effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-white/10 rounded-2xl" />
        
        <div className="relative p-4">
          {/* Minimal Content */}
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary-light/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-primary">
                <path d="M12 2L4 7V11C4 16 7.5 20.3 12 21C16.5 20.3 20 16 20 11V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            
            {/* Text */}
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Photos deleted instantly
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                We never store your images
              </p>
            </div>

            {/* Close button */}
            <button
              onClick={handleClose}
              className="w-6 h-6 bg-white/50 backdrop-blur rounded-full flex items-center justify-center hover:bg-white/70 transition-colors flex-shrink-0"
              aria-label="Close"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Simple Process Flow */}
          <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-500">
            <span>📸 Upload</span>
            <span className="text-gray-300">→</span>
            <span>🎨 Analyze</span>
            <span className="text-gray-300">→</span>
            <span>🗑️ Delete</span>
          </div>
        </div>
      </div>
    </div>
  );
};