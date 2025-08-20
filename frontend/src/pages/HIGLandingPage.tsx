import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';
import { useAppStore } from '@/store';
import { SessionAPI } from '@/services/api/session';
import { trackSessionStart } from '@/utils/analytics';
import backgroundImage_1x from '../assets/배경1.png';
import mynoorLogo from '../assets/Mynoor.png';
import star1 from '../assets/별1.png';
import star2 from '../assets/별2.png';
import bodyImage from '../assets/몸뚱아리.svg';
import orbitImage from '../assets/궤도.png';
import starOnOrbit from '../assets/궤도위의별.png';
import star3 from '../assets/별3.png';
import closedEye from '../assets/감은눈.png';
import openEye from '../assets/뜬눈.png';

const HIGLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { setSessionData } = useAppStore();
  const [scaleFactor, setScaleFactor] = useState(1);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  
  const handleStartAnalysis = async () => {
    if (isCreatingSession) return; // Prevent double clicks
    
    setIsCreatingSession(true);
    try {
      // Create a session before navigating
      const response = await SessionAPI.createSession();
      setSessionData(response.data.sessionId, response.data.instagramId);
      trackSessionStart(response.data.instagramId || 'anonymous');
      console.log('✅ Session created:', response.data.sessionId);
      
      // Navigate to photo guide
      navigate(ROUTES.PHOTOGUIDE);
    } catch (error) {
      console.error('Failed to create session:', error);
      // Still navigate even if session creation fails (it will be handled downstream)
      navigate(ROUTES.PHOTOGUIDE);
    } finally {
      setIsCreatingSession(false);
    }
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

  useEffect(() => {
    // Prevent scrolling on this page
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    document.body.style.touchAction = 'none';
    
    // Prevent pull-to-refresh on mobile
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.position = 'fixed';
    document.documentElement.style.width = '100%';
    document.documentElement.style.height = '100%';
    
    return () => {
      // Cleanup on unmount
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.body.style.touchAction = '';
      
      document.documentElement.style.overflow = '';
      document.documentElement.style.position = '';
      document.documentElement.style.width = '';
      document.documentElement.style.height = '';
    };
  }, []);

  // Prevent touch move events for scroll
  useEffect(() => {
    const preventScroll = (e: TouchEvent) => {
      e.preventDefault();
    };

    document.addEventListener('touchmove', preventScroll, { passive: false });
    
    return () => {
      document.removeEventListener('touchmove', preventScroll);
    };
  }, []);

  return (
    <>
      <style>
        {`
          @keyframes twinkle {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.6;
              transform: scale(0.95);
            }
          }
          
          @keyframes twinkle-slow {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.7;
              transform: scale(0.97);
            }
          }
        `}
      </style>
    <main 
      className="fixed inset-0 w-screen h-screen overflow-hidden bg-white"
      style={{
        width: '100vw',
        height: '100vh',
        height: '100dvh',
        backgroundImage: `url(${backgroundImage_1x})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        touchAction: 'none',
        overscrollBehavior: 'none',
        WebkitOverflowScrolling: 'touch',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      {/* Main Container - 402x874 기준 with dynamic scale */}
      <div 
        className="relative"
        style={{
          width: `${402 * scaleFactor}px`,
          height: `${874 * scaleFactor}px`,
          maxWidth: '100vw',
          maxHeight: '100vh',
        }}
      >
        {/* Header Section - 원본: top: 66px, height: 177px */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{ 
            width: `${402 * scaleFactor}px`,
            height: `${177 * scaleFactor}px`,
            top: `${66 * scaleFactor}px`,
          }}
        >
          {/* Star 1 - 원본: 38x56.682px */}
          <img 
            src={star1} 
            alt="" 
            aria-hidden="true"
            className="absolute"
            style={{
              width: `${38 * scaleFactor}px`,
              height: `${56.682 * scaleFactor}px`,
              left: `${31.34 * scaleFactor}px`,
              top: `${22.32 * scaleFactor}px`,
              animation: 'twinkle 3s ease-in-out infinite',
            }}
          />
          
          {/* Logo - 원본: 200x151.291px */}
          <img 
            src={mynoorLogo} 
            alt="Mynoor"
            style={{
              width: `${200 * scaleFactor}px`,
              height: `${151.291 * scaleFactor}px`,
              marginTop: `${14.5 * scaleFactor}px`,
              marginLeft: 'auto',
              marginRight: 'auto',
              display: 'block',
            }}
          />
          
          {/* Star 2 - 원본: 34.069x50.818px */}
          <img 
            src={star2} 
            alt="" 
            aria-hidden="true"
            className="absolute"
            style={{
              width: `${34.069 * scaleFactor}px`,
              height: `${50.818 * scaleFactor}px`,
              right: `${31.42 * scaleFactor}px`,
              bottom: `${62 * scaleFactor}px`,
              animation: 'twinkle-slow 4s ease-in-out infinite 1s',
            }}
          />
        </div>

        {/* Character Group - 원본: 547.161x530.778px, top: 201px */}
        <div 
          className="absolute"
          style={{ 
            width: `${547.161 * scaleFactor}px`,
            height: `${530.778 * scaleFactor}px`,
            top: `${201 * scaleFactor}px`,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          {/* Body Character */}
          <img 
            src={bodyImage} 
            alt=""
            aria-hidden="true"
            className="absolute"
            style={{ 
              opacity: 0.84,
              width: '100%',
              height: '100%',
              top: '0',
              left: '0',
              objectFit: 'contain',
            }} 
          />
          
          {/* Orbit - 원본: 505.2x341.16px */}
          <img 
            src={orbitImage} 
            alt=""
            aria-hidden="true"
            className="absolute"
            style={{ 
              width: `${505.2 * scaleFactor}px`,
              height: `${341.16 * scaleFactor}px`,
              bottom: `${100 * scaleFactor}px`,
              right: `${14 * scaleFactor}px`,
            }} 
          />
          
          {/* Star on Orbit - 원본: 32x59px */}
          <img 
            src={starOnOrbit} 
            alt=""
            aria-hidden="true"
            className="absolute"
            style={{ 
              width: `${32 * scaleFactor}px`,
              height: `${59 * scaleFactor}px`,
              top: `${282 * scaleFactor}px`,
              left: `${409 * scaleFactor}px`,
              animation: 'twinkle 2.5s ease-in-out infinite 0.5s',
            }} 
          />
          
          {/* Star 3 - 원본: 77x143px */}
          <img 
            src={star3} 
            alt=""
            aria-hidden="true"
            className="absolute"
            style={{ 
              width: `${77 * scaleFactor}px`,
              height: `${143 * scaleFactor}px`,
              top: `${94.1 * scaleFactor}px`,
              left: `${95.3 * scaleFactor}px`,
              animation: 'twinkle-slow 3.5s ease-in-out infinite 2s',
            }} 
          />
          
          {/* Eyes Group - 원본: 245.732x166.493px */}
          <div 
            className="absolute"
            style={{ 
              width: `${245.732 * scaleFactor}px`,
              height: `${166.493 * scaleFactor}px`,
              top: `${196 * scaleFactor}px`,
              left: `${146 * scaleFactor}px`,
            }}
          >
            {/* Closed Eye - 원본: 118.267x94.293px */}
            <img 
              src={closedEye} 
              alt=""
              aria-hidden="true"
              className="absolute"
              style={{ 
                width: `${118.267 * scaleFactor}px`,
                height: `${94.293 * scaleFactor}px`,
                top: `${59.9 * scaleFactor}px`,
                right: `${118 * scaleFactor}px`,
              }} 
            />
            {/* Open Eye - 원본: 111.931x150.984px */}
            <img 
              src={openEye} 
              alt=""
              aria-hidden="true"
              className="absolute"
              style={{ 
                width: `${111.931 * scaleFactor}px`,
                height: `${150.984 * scaleFactor}px`,
                left: `${115 * scaleFactor}px`,
                bottom: `${2.21 * scaleFactor}px`,
              }} 
            />
          </div>
        </div>

        {/* Tagline - 원본: bottom: 589px, font: 20px */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 flex flex-col justify-center items-center"
          style={{ 
            width: `${402 * scaleFactor}px`,
            bottom: `${589 * scaleFactor}px`,
            gap: `${10 * scaleFactor}px`,
          }}
        >
          <h1 
            style={{
              color: '#3B1389',
              textAlign: 'center',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: `${20 * scaleFactor}px`,
              fontWeight: 800,
              lineHeight: '140%',
              zIndex: 10,
            }}
          >
            Find Your Color. Glow in Hijab.
          </h1>
        </div>

        {/* CTA Button - 원본: bottom: 90px, height: 57px */}
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
            onClick={handleStartAnalysis}
            disabled={isCreatingSession}
            className="flex items-center justify-center cursor-pointer transition-all"
            style={{ 
              width: '100%',
              height: `${57 * scaleFactor}px`,
              padding: `${10 * scaleFactor}px ${16 * scaleFactor}px`,
              borderRadius: `${10 * scaleFactor}px`,
              background: '#FFF3A1',
              border: 'none',
              transition: 'all 0.2s ease',
              opacity: isCreatingSession ? 0.7 : 1,
              cursor: isCreatingSession ? 'wait' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!isCreatingSession) e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 19, 137, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onTouchStart={(e) => {
              if (!isCreatingSession) e.currentTarget.style.transform = 'scale(0.98)';
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
              {isCreatingSession ? 'Starting...' : "Let's Find Your Colors!"}
            </span>
          </button>
        </div>
      </div>
    </main>
    </>
  );
};

export default HIGLandingPage;