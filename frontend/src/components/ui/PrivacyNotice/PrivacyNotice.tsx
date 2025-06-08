import { useState } from 'react';
import { cn } from '@/utils/cn';

interface PrivacyNoticeProps {
  className?: string;
}

export const PrivacyNotice = ({ className }: PrivacyNoticeProps): JSX.Element => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={cn('bg-blue-50 border border-blue-200 rounded-lg p-4', className)}>
      <div className="flex items-start gap-3">
        {/* Security Icon */}
        <div className="flex-shrink-0">
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none"
            className="text-blue-600"
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
        
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
            Your Privacy is Protected
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              No Storage
            </span>
          </h3>
          
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" className="text-green-600 mt-0.5 flex-shrink-0">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Photo is analyzed instantly and deleted immediately</span>
            </div>
            
            <div className="flex items-start gap-2">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" className="text-green-600 mt-0.5 flex-shrink-0">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>No face data is stored on our servers</span>
            </div>
            
            <div className="flex items-start gap-2">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" className="text-green-600 mt-0.5 flex-shrink-0">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Only color values are extracted for analysis</span>
            </div>
            
            {isExpanded && (
              <>
                <div className="flex items-start gap-2">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" className="text-green-600 mt-0.5 flex-shrink-0">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Analysis happens in isolated environment</span>
                </div>
                
                <div className="flex items-start gap-2">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" className="text-green-600 mt-0.5 flex-shrink-0">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>GDPR compliant data processing</span>
                </div>
              </>
            )}
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2"
          >
            {isExpanded ? 'Show less' : 'Learn more about our privacy practices'}
          </button>
        </div>
      </div>
      
      {/* Visual representation of photo deletion */}
      <div className="mt-4 pt-4 border-t border-blue-200">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-blue-600">
                <path d="M4 16L8.586 11.414C9.367 10.633 10.633 10.633 11.414 11.414L16 16M14 14L15.586 12.414C16.367 11.633 17.633 11.633 18.414 12.414L20 14M14 8H14.01M6 20H18C19.105 20 20 19.105 20 18V6C20 4.895 19.105 4 18 4H6C4.895 4 4 4.895 4 6V18C4 19.105 4.895 20 6 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span>Upload</span>
          </div>
          
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-gray-400">
            <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-blue-600">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span>Analyze</span>
          </div>
          
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-gray-400">
            <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-green-600">
                <path d="M19 7L18.132 19.142C18.056 20.189 17.184 21 16.134 21H7.866C6.816 21 5.944 20.189 5.868 19.142L5 7M10 11V17M14 11V17M15 7V4C15 3.448 14.552 3 14 3H10C9.448 3 9 3.448 9 4V7M4 7H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span>Auto-delete</span>
          </div>
        </div>
      </div>
    </div>
  );
};