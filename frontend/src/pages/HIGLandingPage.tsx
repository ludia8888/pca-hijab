import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';
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
  
  const handleStartAnalysis = () => {
    navigate(ROUTES.DIAGNOSIS);
  };

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
    
    // Create and inject responsive scale styles
    const styleId = 'hig-landing-responsive-styles';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    
    styleElement.textContent = `
      :root {
        /* Default: 402x874 기준 = 1.0 scale */
        --scale-factor: 1;
        --font-scale: 1;
        --button-scale: 1;
      }

      /* Smaller than 402px - scale down */
      @media (max-width: 401px) {
        :root {
          --scale-factor: 0.8;
          --font-scale: 0.8;
          --button-scale: 0.8;
        }
      }

      /* Very small mobile */
      @media (max-width: 320px) {
        :root {
          --scale-factor: 0.7;
          --font-scale: 0.7;
          --button-scale: 0.7;
        }
      }

      /* Larger than 402px - scale up progressively */
      
      /* Small tablets */
      @media (min-width: 640px) {
        :root {
          --scale-factor: 1.1;
          --font-scale: 1.1;
          --button-scale: 1.1;
        }
      }

      /* Tablets */
      @media (min-width: 768px) {
        :root {
          --scale-factor: 1.2;
          --font-scale: 1.2;
          --button-scale: 1.2;
        }
      }

      /* Desktop */
      @media (min-width: 1024px) {
        :root {
          --scale-factor: 1.35;
          --font-scale: 1.35;
          --button-scale: 1.35;
        }
      }

      /* Large Desktop */
      @media (min-width: 1280px) {
        :root {
          --scale-factor: 1.5;
          --font-scale: 1.5;
          --button-scale: 1.5;
        }
      }

      /* XL Desktop */
      @media (min-width: 1536px) {
        :root {
          --scale-factor: 1.7;
          --font-scale: 1.7;
          --button-scale: 1.7;
        }
      }

      /* 2K */
      @media (min-width: 1920px) {
        :root {
          --scale-factor: 2.0;
          --font-scale: 2.0;
          --button-scale: 2.0;
        }
      }

      /* 4K */
      @media (min-width: 2560px) {
        :root {
          --scale-factor: 2.5;
          --font-scale: 2.5;
          --button-scale: 2.5;
        }
      }
      
      /* Prevent any scrolling */
      html, body {
        overflow: hidden !important;
        overscroll-behavior: none !important;
        -webkit-overflow-scrolling: touch !important;
      }
    `;
    
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
      
      if (styleElement && styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
      }
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
      {/* Main Container - 402x874 기준 */}
      <div 
        className="relative"
        style={{
          width: 'calc(402px * var(--scale-factor))',
          height: 'calc(874px * var(--scale-factor))',
          maxWidth: '100vw',
          maxHeight: '100vh',
        }}
      >
        {/* Header Section - 원본: top: 66px, height: 177px */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{ 
            width: 'calc(402px * var(--scale-factor))',
            height: 'calc(177px * var(--scale-factor))',
            top: 'calc(66px * var(--scale-factor))',
          }}
        >
          {/* Star 1 - 원본: 38x56.682px */}
          <img 
            src={star1} 
            alt="" 
            aria-hidden="true"
            className="absolute"
            style={{
              width: 'calc(38px * var(--scale-factor))',
              height: 'calc(56.682px * var(--scale-factor))',
              left: 'calc(31.34px * var(--scale-factor))',
              top: 'calc(22.32px * var(--scale-factor))',
            }}
          />
          
          {/* Logo - 원본: 200x151.291px */}
          <img 
            src={mynoorLogo} 
            alt="Mynoor"
            style={{
              width: 'calc(200px * var(--scale-factor))',
              height: 'calc(151.291px * var(--scale-factor))',
              marginTop: 'calc(14.5px * var(--scale-factor))',
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
              width: 'calc(34.069px * var(--scale-factor))',
              height: 'calc(50.818px * var(--scale-factor))',
              right: 'calc(31.42px * var(--scale-factor))',
              bottom: 'calc(62px * var(--scale-factor))',
            }}
          />
        </div>

        {/* Character Group - 원본: 547.161x530.778px, top: 201px */}
        <div 
          className="absolute"
          style={{ 
            width: 'calc(547.161px * var(--scale-factor))',
            height: 'calc(530.778px * var(--scale-factor))',
            top: 'calc(201px * var(--scale-factor))',
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
              width: 'calc(505.2px * var(--scale-factor))',
              height: 'calc(341.16px * var(--scale-factor))',
              bottom: 'calc(100px * var(--scale-factor))',
              right: 'calc(14px * var(--scale-factor))',
            }} 
          />
          
          {/* Star on Orbit - 원본: 32x59px */}
          <img 
            src={starOnOrbit} 
            alt=""
            aria-hidden="true"
            className="absolute"
            style={{ 
              width: 'calc(32px * var(--scale-factor))',
              height: 'calc(59px * var(--scale-factor))',
              top: 'calc(282px * var(--scale-factor))',
              left: 'calc(409px * var(--scale-factor))',
            }} 
          />
          
          {/* Star 3 - 원본: 77x143px */}
          <img 
            src={star3} 
            alt=""
            aria-hidden="true"
            className="absolute"
            style={{ 
              width: 'calc(77px * var(--scale-factor))',
              height: 'calc(143px * var(--scale-factor))',
              top: 'calc(94.1px * var(--scale-factor))',
              left: 'calc(95.3px * var(--scale-factor))',
            }} 
          />
          
          {/* Eyes Group - 원본: 245.732x166.493px */}
          <div 
            className="absolute"
            style={{ 
              width: 'calc(245.732px * var(--scale-factor))',
              height: 'calc(166.493px * var(--scale-factor))',
              top: 'calc(196px * var(--scale-factor))',
              left: 'calc(146px * var(--scale-factor))',
            }}
          >
            {/* Closed Eye - 원본: 118.267x94.293px */}
            <img 
              src={closedEye} 
              alt=""
              aria-hidden="true"
              className="absolute"
              style={{ 
                width: 'calc(118.267px * var(--scale-factor))',
                height: 'calc(94.293px * var(--scale-factor))',
                top: 'calc(59.9px * var(--scale-factor))',
                right: 'calc(118px * var(--scale-factor))',
              }} 
            />
            {/* Open Eye - 원본: 111.931x150.984px */}
            <img 
              src={openEye} 
              alt=""
              aria-hidden="true"
              className="absolute"
              style={{ 
                width: 'calc(111.931px * var(--scale-factor))',
                height: 'calc(150.984px * var(--scale-factor))',
                left: 'calc(115px * var(--scale-factor))',
                bottom: 'calc(2.21px * var(--scale-factor))',
              }} 
            />
          </div>
        </div>

        {/* Tagline - 원본: bottom: 589px, font: 20px */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 flex flex-col justify-center items-center"
          style={{ 
            width: 'calc(402px * var(--scale-factor))',
            bottom: 'calc(589px * var(--scale-factor))',
            gap: 'calc(10px * var(--scale-factor))',
          }}
        >
          <h1 
            style={{
              color: '#3B1389',
              textAlign: 'center',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 'calc(20px * var(--font-scale))',
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
            width: 'calc(402px * var(--scale-factor))',
            padding: `0 calc(16px * var(--scale-factor))`,
            gap: 'calc(10px * var(--scale-factor))',
            bottom: 'calc(90px * var(--scale-factor))',
          }}
        >
          <button 
            onClick={handleStartAnalysis}
            className="flex items-center justify-center cursor-pointer transition-all"
            style={{ 
              width: '100%',
              height: 'calc(57px * var(--button-scale))',
              padding: `calc(10px * var(--button-scale)) calc(16px * var(--button-scale))`,
              borderRadius: 'calc(10px * var(--button-scale))',
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
                fontSize: 'calc(20px * var(--font-scale))',
                fontWeight: 700,
                lineHeight: '140%'
              }}
            >
              Start Analysis
            </span>
          </button>
        </div>
      </div>
    </main>
  );
};

export default HIGLandingPage;