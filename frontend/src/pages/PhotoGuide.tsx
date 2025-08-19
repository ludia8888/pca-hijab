import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';
import frame16 from '@/assets/Frame 16.png';
import frame17 from '@/assets/Frame 17.png';
import frame18 from '@/assets/Frame 18.png';
import frame19 from '@/assets/Frame 19.png';
import guideBackground from '@/assets/가이드배경.jpg';
import starIcon from '@/assets/포토가이드별.png';

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
    <div className="min-h-screen relative overflow-hidden">
      {/* Full screen background */}
      <div 
        className="absolute"
        style={{
          width: '150vh',
          height: '150vw',
          top: '50%',
          left: '50%',
          background: `linear-gradient(0deg, rgba(59, 19, 137, 0.20) 0%, rgba(59, 19, 137, 0.20) 100%), url(${guideBackground}) lightgray 50% / cover no-repeat`,
          transform: 'translate(-50%, -50%) rotate(90deg)',
          zIndex: 0,
        }}
      />
      
      {/* Content container */}
      <div className="min-h-screen flex items-center justify-center relative z-10">
        <div 
          className="relative"
          style={{
            width: `${402 * scaleFactor}px`,
            height: `${874 * scaleFactor}px`,
            maxWidth: '100vw',
            maxHeight: '100vh',
          }}
        >
          {/* Star icon at top */}
          <div
            style={{
              position: 'absolute',
              top: `${45 * scaleFactor}px`,
              left: '50%',
              transform: 'translateX(-50%)',
              width: `${18.646 * scaleFactor}px`,
              height: `${34.5 * scaleFactor}px`,
            }}
          >
            <img 
              src={starIcon}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          </div>
          
          {/* Header */}
          <div
            style={{
              position: 'absolute',
              top: `${(45 + 34.5 + 10) * scaleFactor}px`, // star top margin + star height + gap
              display: 'flex',
              width: `${402 * scaleFactor}px`,
              height: `${115 * scaleFactor}px`,
              padding: `${6 * scaleFactor}px ${16 * scaleFactor}px`,
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: `${4 * scaleFactor}px`,
              boxSizing: 'border-box',
            }}
          >
            <h1
              style={{
                display: '-webkit-box',
                width: `${348 * scaleFactor}px`,
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 1,
                overflow: 'hidden',
                color: '#FFF',
                textAlign: 'center',
                textOverflow: 'ellipsis',
                fontFamily: '"Plus Jakarta Sans"',
                fontSize: `${36 * scaleFactor}px`,
                fontStyle: 'normal',
                fontWeight: 800,
                lineHeight: '140%',
                margin: 0,
              }}
            >
              Photo Guide
            </h1>
            <p
              style={{
                width: `${358 * scaleFactor}px`,
                height: `${49 * scaleFactor}px`,
                flexShrink: 0,
                overflow: 'hidden',
                color: '#FFF',
                textAlign: 'center',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontFamily: 'Pretendard',
                fontSize: `${16 * scaleFactor}px`,
                fontStyle: 'normal',
                fontWeight: 400,
                lineHeight: '140%',
                margin: 0,
              }}
            >
              촬영 가이드
            </p>
          </div>
          
          {/* Flex container for photo guide cards */}
          <div
            className="absolute left-1/2 -translate-x-1/2"
            style={{
              bottom: `${(90 + 57 + 45) * scaleFactor}px`, // 90 (button bottom) + 57 (button height) + 45 (gap)
              display: 'flex',
              width: `${402 * scaleFactor}px`,
              height: `${485 * scaleFactor}px`,
              padding: `${16 * scaleFactor}px`,
              justifyContent: 'center',
              alignItems: 'flex-start',
              alignContent: 'flex-start',
              gap: `${20 * scaleFactor}px`,
              flexWrap: 'wrap',
              boxSizing: 'border-box',
            }}
          >
            {/* 2x2 Grid of images - Frame 16, 18 on top row, 17, 19 on bottom */}
            <img 
              src={frame16} 
              alt="Frame 16"
              style={{
                width: `${168 * scaleFactor}px`,
                height: `${216 * scaleFactor}px`,
                objectFit: 'cover',
                borderRadius: `${8 * scaleFactor}px`,
              }}
            />
            <img 
              src={frame18} 
              alt="Frame 18"
              style={{
                width: `${168 * scaleFactor}px`,
                height: `${216 * scaleFactor}px`,
                objectFit: 'cover',
                borderRadius: `${8 * scaleFactor}px`,
              }}
            />
            <img 
              src={frame17} 
              alt="Frame 17"
              style={{
                width: `${168 * scaleFactor}px`,
                height: `${216 * scaleFactor}px`,
                objectFit: 'cover',
                borderRadius: `${8 * scaleFactor}px`,
              }}
            />
            <img 
              src={frame19} 
              alt="Frame 19"
              style={{
                width: `${168 * scaleFactor}px`,
                height: `${216 * scaleFactor}px`,
                objectFit: 'cover',
                borderRadius: `${8 * scaleFactor}px`,
              }}
            />
          </div>
          
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
    </div>
  );
};

export default PhotoGuide;