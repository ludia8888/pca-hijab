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
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 max-w-sm mx-4">
        <div className="p-5">
          {/* Header with icon */}
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none"
                  className="text-green-600"
                >
                  <path 
                    d="M12 2L4 7V11C4 16 7.5 20.3 12 21C16.5 20.3 20 16 20 11V7L12 2Z" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  <path 
                    d="M9 12L11 14L15 10" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-base mb-1">
                Your photo is safe with us 💚
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                We understand your privacy concerns. Your photo will be analyzed instantly and <span className="font-medium text-gray-800">deleted immediately</span> - we never store any images or facial data.
              </p>
            </div>

            {/* Close button */}
            <button
              onClick={handleClose}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Visual representation */}
          <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                📸
              </div>
              <span className="text-gray-600">Upload</span>
            </div>
            
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-400">
              <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            
            <div className="flex items-center gap-1.5">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                🎨
              </div>
              <span className="text-gray-600">Analyze</span>
            </div>
            
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-400">
              <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            
            <div className="flex items-center gap-1.5">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                🗑️
              </div>
              <span className="text-gray-600">Auto-delete</span>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="mt-3 flex items-center justify-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" className="text-green-500">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>100% Private</span>
            </div>
            <div className="flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" className="text-green-500">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Instant Delete</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};