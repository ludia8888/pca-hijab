import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';
import { faceMeshService } from '@/services/faceMeshService';
import backgroundImage_1x from '../assets/배경1.png';
import dontLogo from '../assets/Dont.png';
import worryLogo from '../assets/worry.png';
import dontWorryStar from '../assets/dontworry별.png';
import whiteStar from '../assets/흰별.svg';
import whiteStarDontWorry from '../assets/흰별돈워리.png';
import orbitStarDontWorry from '../assets/궤도별돈워리.png';
import laptop from '../assets/노트북.png';
import dontWorryOrbit from '../assets/dontworryorbit.png';

const DontWorry: React.FC = () => {
  const navigate = useNavigate();
  const [scaleFactor, setScaleFactor] = useState(1);
  
  const handleNext = () => {
    navigate(ROUTES.DIAGNOSIS);
  };

  const handleBack = () => {
    navigate(ROUTES.LANDING);
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

  // Preload FaceMesh model while user is on this page
  useEffect(() => {
    // Start preloading after 500ms to not block initial render
    const preloadTimer = setTimeout(() => {
      console.log('🔧 [DontWorry] Starting FaceMesh preload in background...');
      const startTime = performance.now();
      
      faceMeshService.initialize()
        .then((success) => {
          if (success) {
            const loadTime = performance.now() - startTime;
            console.log(`✅ [DontWorry] FaceMesh preloaded successfully in ${Math.round(loadTime)}ms`);
            console.log('📊 [DontWorry] Model will be ready when user reaches camera');
          } else {
            console.warn('⚠️ [DontWorry] FaceMesh preload failed, will retry on camera page');
          }
        })
        .catch(error => {
          console.warn('⚠️ [DontWorry] FaceMesh preload error:', error);
          // Don't show error to user - will retry when actually needed
        });
    }, 500);

    return () => {
      clearTimeout(preloadTimer);
      // Note: We don't release the service here because we want it ready for the next page
      // The service will be released when components that use it unmount
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
      {/* Back Button - Top Left */}
      <button
        onClick={handleBack}
        className="absolute z-50 transition-opacity hover:opacity-60"
        style={{
          top: `${20 * scaleFactor}px`,
          left: `${20 * scaleFactor}px`,
          width: `${32 * scaleFactor}px`,
          height: `${32 * scaleFactor}px`,
          background: 'transparent',
          border: `${1 * scaleFactor}px solid rgba(59, 19, 137, 0.15)`,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
        aria-label="Go back"
      >
        <svg 
          width={`${18 * scaleFactor}px`} 
          height={`${18 * scaleFactor}px`} 
          viewBox="0 0 24 24" 
          fill="none"
          style={{ marginRight: `${2 * scaleFactor}px` }}
        >
          <path 
            d="M15 18L9 12L15 6" 
            stroke="rgba(59, 19, 137, 0.4)" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </button>

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
        {/* DontWorry Star - Positioned relative to main container */}
        <img 
          src={dontWorryStar} 
          alt="" 
          aria-hidden="true"
          className="absolute"
          style={{
            width: `${31.346 * scaleFactor}px`,
            height: `${58 * scaleFactor}px`,
            top: `${88 * scaleFactor}px`,
            left: `${16 * scaleFactor}px`,
            animation: 'twinkle 3s ease-in-out infinite',
          }}
        />

        {/* White Star - Positioned relative to main container */}
        <img 
          src={whiteStar} 
          alt="" 
          aria-hidden="true"
          className="absolute"
          style={{
            width: 'auto',
            height: 'auto',
            right: `${17 * scaleFactor}px`,
            bottom: `${626 * scaleFactor}px`,
            transform: `scale(${scaleFactor})`,
            transformOrigin: 'bottom right',
          }}
        />

        {/* DontWorry Orbit - Positioned relative to main container */}
        <img 
          src={dontWorryOrbit} 
          alt="" 
          aria-hidden="true"
          className="absolute"
          style={{
            position: 'absolute',
            left: `${21.383 * scaleFactor}px`,
            bottom: `${213.287 * scaleFactor}px`,
            width: `${355.252 * scaleFactor}px`,
            height: `${169.747 * scaleFactor}px`,
            transform: `rotate(-1.138deg)`,
            aspectRatio: '203/97',
          }}
        />

        {/* White Star DontWorry - Positioned relative to main container */}
        <img 
          src={whiteStarDontWorry} 
          alt="" 
          aria-hidden="true"
          className="absolute"
          style={{
            position: 'absolute',
            left: `${62 * scaleFactor}px`,
            top: `${372 * scaleFactor}px`,
            width: `${53 * scaleFactor}px`,
            height: `${99 * scaleFactor}px`,
            aspectRatio: '53/99',
            zIndex: 999,
            animation: 'twinkle-slow 4s ease-in-out infinite 0.5s',
          }}
        />

        {/* Orbit Star DontWorry - Positioned relative to main container */}
        <img 
          src={orbitStarDontWorry} 
          alt="" 
          aria-hidden="true"
          className="absolute"
          style={{
            position: 'absolute',
            right: `${82.841 * scaleFactor}px`,
            bottom: `${209 * scaleFactor}px`,
            width: `${22.159 * scaleFactor}px`,
            height: `${41 * scaleFactor}px`,
            aspectRatio: '20/37',
            zIndex: 999,
            animation: 'twinkle 3s ease-in-out infinite 2s',
          }}
        />

        {/* Header Section - 원본: top: 66px, height: 177px */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{ 
            width: `${402 * scaleFactor}px`,
            height: `${177 * scaleFactor}px`,
            top: `${66 * scaleFactor}px`,
          }}
        >
          
          {/* Logo Group - Don't & Worry */}
          <div 
            style={{
              marginTop: `${32 * scaleFactor}px`,
              marginLeft: 'auto',
              marginRight: 'auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <img 
              src={dontLogo} 
              alt="Don't"
              style={{
                width: `${200 * scaleFactor}px`,
                height: 'auto',
              }}
            />
            <img 
              src={worryLogo} 
              alt="Worry"
              style={{
                width: `${230 * scaleFactor}px`,
                height: 'auto',
                marginTop: `${-53 * scaleFactor}px`, // Negative margin to overlap with "t" in Don't
              }}
            />
          </div>
          
        </div>

        {/* Character Group - Laptop */}
        <div 
          className="absolute"
          style={{ 
            width: `${330 * scaleFactor}px`,
            height: `${300.093 * scaleFactor}px`,
            bottom: `${162 * scaleFactor}px`, // 90 (button bottom) + 57 (button height) + 32 (margin)
            left: '48%',
            transform: `translateX(-50%)`,
            flexShrink: 0,
          }}
        >
          {/* Laptop */}
          <img 
            src={laptop} 
            alt=""
            aria-hidden="true"
            style={{ 
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }} 
          />
        </div>

        {/* Tagline - Photos deleted instantly, We never store your images */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 flex flex-col justify-center items-center"
          style={{ 
            width: `${358 * scaleFactor}px`,
            height: `${49 * scaleFactor}px`,
            top: `${293 * scaleFactor}px`, // 66 (header top) + 177 (header height) + 32 (don't worry margin top) + 18 (margin below don't worry)
          }}
        >
          <div 
            style={{
              overflow: 'hidden',
              color: '#3B1389',
              textAlign: 'center',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: `${16 * scaleFactor}px`,
              fontStyle: 'normal',
              fontWeight: 800,
              lineHeight: '140%',
            }}
          >
            Photos deleted instantly,
          </div>
          <div 
            style={{
              overflow: 'hidden',
              color: '#3B1389',
              textAlign: 'center',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: `${16 * scaleFactor}px`,
              fontStyle: 'normal',
              fontWeight: 800,
              lineHeight: '140%',
            }}
          >
            We never store your images
          </div>
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
              I'm Ready!
            </span>
          </button>
        </div>
      </div>
    </main>
    </>
  );
};

export default DontWorry;
