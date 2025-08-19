import React from 'react';
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

  // 402x874 기준 비율 계산
  const BASE_W = 402;
  const BASE_H = 874;

  return (
    <main 
      className="relative w-full overflow-hidden bg-white"
      style={{
        minHeight: '100vh',
        minHeight: '100dvh',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
        backgroundImage: `url(${backgroundImage_1x})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Container that maintains aspect ratio */}
      <div 
        className="relative w-full mx-auto"
        style={{
          maxWidth: '402px',
          minHeight: '100vh',
          minHeight: '100dvh',
        }}
      >
        {/* Header Section - 원본 위치: top: 66px */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{ 
            width: '100%',
            height: 'calc(177 / 874 * 100vh)',
            top: 'calc(66 / 874 * 100vh)',
          }}
        >
          {/* Star 1 */}
          <img 
            src={star1} 
            alt="" 
            aria-hidden="true"
            className="absolute"
            style={{
              width: 'clamp(1.8rem, calc(38 / 402 * 100vw), 2.4rem)',
              height: 'auto',
              left: 'calc(31.34 / 402 * 100%)',
              top: 'calc(22.32 / 177 * 100%)',
            }}
          />
          
          {/* Logo */}
          <img 
            src={mynoorLogo} 
            alt="Mynoor"
            style={{
              width: 'clamp(150px, calc(200 / 402 * 100%), 200px)',
              height: 'auto',
              marginTop: 'calc(14.5 / 177 * 100%)',
              marginLeft: 'auto',
              marginRight: 'auto',
              display: 'block',
            }}
          />
          
          {/* Star 2 */}
          <img 
            src={star2} 
            alt="" 
            aria-hidden="true"
            className="absolute"
            style={{
              width: 'clamp(1.6rem, calc(34 / 402 * 100vw), 2.1rem)',
              height: 'auto',
              right: 'calc(31.42 / 402 * 100%)',
              bottom: 'calc(62 / 177 * 100%)',
            }}
          />
        </div>

        {/* Character Group - 원본 위치: top: 201px, width: 547px, height: 531px */}
        <div 
          className="absolute"
          style={{ 
            width: 'min(136%, calc(547 / 402 * 100vw))',
            aspectRatio: '547 / 531',
            top: 'calc(201 / 874 * 100vh)',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          {/* Inner Container */}
          <div className="relative w-full h-full">
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
            
            {/* Orbit - 원본 크기 유지 */}
            <img 
              src={orbitImage} 
              alt=""
              aria-hidden="true"
              className="absolute"
              style={{ 
                width: 'calc(505.2 / 547 * 100%)',
                height: 'auto',
                bottom: 'calc(100 / 531 * 100%)',
                right: 'calc(14 / 547 * 100%)',
              }} 
            />
            
            {/* Star on Orbit */}
            <img 
              src={starOnOrbit} 
              alt=""
              aria-hidden="true"
              className="absolute"
              style={{ 
                width: 'calc(32 / 547 * 100%)',
                height: 'auto',
                top: 'calc(282 / 531 * 100%)',
                left: 'calc(409 / 547 * 100%)',
              }} 
            />
            
            {/* Star 3 */}
            <img 
              src={star3} 
              alt=""
              aria-hidden="true"
              className="absolute"
              style={{ 
                width: 'calc(77 / 547 * 100%)',
                height: 'auto',
                top: 'calc(94.1 / 531 * 100%)',
                left: 'calc(95.3 / 547 * 100%)',
              }} 
            />
            
            {/* Eyes Group */}
            <div 
              className="absolute"
              style={{ 
                width: 'calc(245.732 / 547 * 100%)',
                height: 'calc(166.493 / 531 * 100%)',
                top: 'calc(196 / 531 * 100%)',
                left: 'calc(146 / 547 * 100%)',
              }}
            >
              <img 
                src={closedEye} 
                alt=""
                aria-hidden="true"
                className="absolute"
                style={{ 
                  width: 'calc(118.267 / 245.732 * 100%)',
                  height: 'auto',
                  top: 'calc(59.9 / 166.493 * 100%)',
                  right: 'calc(118 / 245.732 * 100%)',
                }} 
              />
              <img 
                src={openEye} 
                alt=""
                aria-hidden="true"
                className="absolute"
                style={{ 
                  width: 'calc(111.931 / 245.732 * 100%)',
                  height: 'auto',
                  left: 'calc(115 / 245.732 * 100%)',
                  bottom: 'calc(2.21 / 166.493 * 100%)',
                }} 
              />
            </div>
          </div>
        </div>

        {/* Tagline - 원본 위치: bottom: 589px from bottom */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 flex flex-col justify-center items-center"
          style={{ 
            width: '100%',
            bottom: 'calc(589 / 874 * 100vh)',
            padding: '0 1rem',
          }}
        >
          <h1 
            style={{
              color: '#3B1389',
              textAlign: 'center',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 'clamp(1.125rem, calc(20 / 402 * 100vw), 1.25rem)',
              fontWeight: 800,
              lineHeight: '140%',
              zIndex: 10,
            }}
          >
            Find Your Color. Glow in Hijab.
          </h1>
        </div>

        {/* CTA Button - 원본 위치: bottom: 90px */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 flex flex-col justify-center items-center"
          style={{ 
            width: '100%',
            padding: '0 1rem',
            bottom: `max(calc(90 / 874 * 100vh), calc(env(safe-area-inset-bottom) + 1rem))`,
          }}
        >
          <button 
            onClick={handleStartAnalysis}
            className="flex items-center justify-center cursor-pointer transition-all"
            style={{ 
              width: '100%',
              maxWidth: '370px',
              height: 'clamp(3rem, calc(57 / 874 * 100vh), 3.5rem)',
              padding: '0.625rem 1rem',
              borderRadius: '0.625rem',
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
                fontSize: 'clamp(1.125rem, calc(20 / 402 * 100vw), 1.25rem)',
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