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
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto auto',
        gap: 'clamp(0.5rem, 2vw, 1.5rem)',
      }}
    >
      {/* Header Section - Semantic Flex Layout */}
      <header 
        className="relative flex justify-center items-center"
        style={{
          paddingTop: 'clamp(1.5rem, 7vh, 3.5rem)',
          paddingBottom: 'clamp(0.5rem, 2vh, 1rem)',
          minHeight: 'clamp(120px, 20vh, 180px)',
        }}
      >
        {/* Decorative Star 1 */}
        <img 
          src={star1} 
          alt="" 
          aria-hidden="true"
          className="absolute"
          style={{
            width: 'clamp(1.8rem, 9vw, 2.4rem)',
            height: 'auto',
            left: 'clamp(1rem, 8%, 3rem)',
            top: 'clamp(1.5rem, 15%, 3rem)',
          }}
        />
        
        {/* Logo - Responsive with aspect ratio */}
        <img 
          src={mynoorLogo} 
          alt="Mynoor"
          style={{
            width: 'clamp(150px, 50vw, 200px)',
            height: 'auto',
            aspectRatio: '200 / 151',
            zIndex: 2,
          }}
        />
        
        {/* Decorative Star 2 */}
        <img 
          src={star2} 
          alt="" 
          aria-hidden="true"
          className="absolute"
          style={{
            width: 'clamp(1.6rem, 8vw, 2.1rem)',
            height: 'auto',
            right: 'clamp(1rem, 8%, 3rem)',
            bottom: 'clamp(1.5rem, 35%, 3rem)',
          }}
        />
      </header>

      {/* Hero Section - Character Group */}
      <section 
        className="relative flex items-center justify-center"
        style={{
          minHeight: 'clamp(280px, 55vh, 530px)',
        }}
      >
        {/* Character Group Container - Responsive scaling */}
        <div 
          className="relative"
          style={{ 
            width: 'clamp(320px, 90vw, 547px)',
            aspectRatio: '547 / 531',
            maxWidth: '90vw',
          }}
        >
          {/* Inner Container for all character elements */}
          <div 
            className="relative w-full h-full"
            style={{
              transform: `scale(${typeof window !== 'undefined' && window.innerWidth < 640 ? 0.9 : 1})`,
              transformOrigin: 'center center',
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
            
            {/* Orbit - Percentage based within container */}
            <img 
              src={orbitImage} 
              alt=""
              aria-hidden="true"
              className="absolute"
              style={{ 
                width: '92.3%',
                height: 'auto',
                bottom: '18.8%',
                right: '2.6%',
              }} 
            />
            
            {/* Star on Orbit - Percentage based */}
            <img 
              src={starOnOrbit} 
              alt=""
              aria-hidden="true"
              className="absolute"
              style={{ 
                width: '5.8%',
                height: 'auto',
                top: '53.1%',
                left: '74.8%',
              }} 
            />
            
            {/* Star 3 - Percentage based */}
            <img 
              src={star3} 
              alt=""
              aria-hidden="true"
              className="absolute"
              style={{ 
                width: '14%',
                height: 'auto',
                top: '17.7%',
                left: '17.4%',
              }} 
            />
            
            {/* Eyes Group - Percentage based */}
            <div 
              className="absolute"
              style={{ 
                width: '45%',
                height: '31.4%',
                top: '36.9%',
                left: '26.7%',
              }}
            >
              <img 
                src={closedEye} 
                alt=""
                aria-hidden="true"
                className="absolute"
                style={{ 
                  width: '48.1%',
                  height: 'auto',
                  top: '36%',
                  right: '48%',
                }} 
              />
              <img 
                src={openEye} 
                alt=""
                aria-hidden="true"
                className="absolute"
                style={{ 
                  width: '45.6%',
                  height: 'auto',
                  left: '46.8%',
                  bottom: '1.3%',
                }} 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tagline Section - Semantic with clamp() */}
      <section 
        className="flex justify-center items-center"
        style={{
          padding: '0 clamp(1rem, 4vw, 2rem)',
          paddingBottom: 'clamp(0.5rem, 2vh, 1rem)',
        }}
      >
        <h1 
          style={{
            color: '#3B1389',
            textAlign: 'center',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 'clamp(1.125rem, 2.5vw, 1.25rem)',
            fontWeight: 800,
            lineHeight: '140%',
            maxWidth: '100%',
          }}
        >
          Find Your Color. Glow in Hijab.
        </h1>
      </section>

      {/* CTA Button Section - Semantic Footer */}
      <footer 
        className="flex justify-center items-center"
        style={{
          padding: '0 clamp(1rem, 4vw, 2rem)',
          paddingBottom: `max(clamp(2.5rem, 10vh, 5.5rem), calc(env(safe-area-inset-bottom) + 1rem))`,
          marginTop: 'auto',
        }}
      >
        <button 
          onClick={handleStartAnalysis}
          className="flex items-center justify-center cursor-pointer transition-all hover:scale-105 hover:shadow-lg"
          style={{ 
            width: 'clamp(280px, 90vw, 370px)',
            height: 'clamp(3rem, 7vh, 3.5rem)',
            padding: 'clamp(0.625rem, 2vw, 1rem) clamp(1rem, 4vw, 1.5rem)',
            borderRadius: 'clamp(0.5rem, 1.5vw, 0.625rem)',
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
              fontSize: 'clamp(1.125rem, 2.5vw, 1.25rem)',
              fontWeight: 700,
              lineHeight: '140%'
            }}
          >
            Start Analysis
          </span>
        </button>
      </footer>
    </main>
  );
};

export default HIGLandingPage;