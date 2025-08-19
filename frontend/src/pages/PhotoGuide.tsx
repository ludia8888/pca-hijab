import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';

const PhotoGuide: React.FC = () => {
  const navigate = useNavigate();
  const [scaleFactor, setScaleFactor] = useState(1);
  
  const handleNext = () => {
    navigate(ROUTES.DONTWORRY);
  };

  // Calculate optimal scale to prevent overlapping
  useEffect(() => {
    const calculateScale = () => {
      const BASE_W = 402;
      const BASE_H = 874;
      
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      
      // Calculate scale based on both width and height to maintain aspect ratio
      const scaleX = vw / BASE_W;
      const scaleY = vh / BASE_H;
      
      // Use the smaller scale to ensure everything fits without overlapping
      const scale = Math.min(scaleX, scaleY) * 0.95; // 0.95 for safety margin
      
      setScaleFactor(scale);
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    
    return () => {
      window.removeEventListener('resize', calculateScale);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div 
        className="relative"
        style={{
          width: `${402 * scaleFactor}px`,
          height: `${874 * scaleFactor}px`,
          maxWidth: '100vw',
          maxHeight: '100vh',
        }}
      >
        {/* PhotoGuide Page - Empty for now, button at bottom */}
        
        {/* CTA Button - Same as HIGLandingPage, positioned at bottom */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 flex flex-col justify-center items-center"
          style={{ 
            width: `${402 * scaleFactor}px`,
            padding: `0 ${16 * scaleFactor}px`,
            gap: `${10 * scaleFactor}px`,
            bottom: `${90 * scaleFactor}px`,
          }}
        >
          <button 
            onClick={handleNext}
            className="flex items-center justify-center cursor-pointer transition-all"
            style={{ 
              width: '100%',
              height: `${57 * scaleFactor}px`,
              padding: `${10 * scaleFactor}px ${16 * scaleFactor}px`,
              borderRadius: `${10 * scaleFactor}px`,
              background: '#FFF3A1',
              border: 'none',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 19, 137, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onTouchStart={(e) => {
              e.currentTarget.style.transform = 'scale(0.98)';
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <span 
              style={{ 
                color: '#3B1389',
                textAlign: 'center',
                fontFamily: 'Pretendard',
                fontSize: `${20 * scaleFactor}px`,
                fontWeight: 700,
                lineHeight: '140%'
              }}
            >
              Next
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhotoGuide;