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
        gap: 'clamp(1rem, 3vw, 2rem)',
      }}
    >
      {/* Header Section - Semantic Flex Layout */}
      <header 
        className="relative flex justify-center items-center"
        style={{
          paddingTop: 'clamp(2rem, 7.5vh, 4rem)',
          paddingBottom: 'clamp(1rem, 2vh, 1.5rem)',
          minHeight: 'clamp(150px, 20vh, 200px)',
        }}
      >
        {/* Decorative Star 1 - Absolute */}
        <img 
          src={star1} 
          alt="" 
          className="absolute"
          style={{
            width: 'clamp(1.5rem, 9vw, 2.375rem)',
            height: 'auto',
            left: '7.8%',
            top: 'clamp(1rem, 12%, 2.5rem)',
          }}
        />
        
        {/* Logo - Responsive Sizing */}
        <img 
          src={mynoorLogo} 
          alt="Mynoor"
          style={{
            width: 'min(50%, 200px)',
            height: 'auto',
            aspectRatio: '200 / 151',
            zIndex: 2,
          }}
        />
        
        {/* Decorative Star 2 - Absolute */}
        <img 
          src={star2} 
          alt="" 
          className="absolute"
          style={{
            width: 'clamp(1.3rem, 8vw, 2.1rem)',
            height: 'auto',
            right: '7.8%',
            bottom: 'clamp(2rem, 35%, 3.5rem)',
          }}
        />
      </header>

      {/* Hero Decorative Section - Absolute Positioned Elements */}
      <section 
        className="relative flex items-center justify-center"
        style={{
          minHeight: 'clamp(300px, 50vh, 530px)',
        }}
      >
        {/* Decorative Container */}
        <div 
          className="relative flex items-center justify-center"
          style={{
            width: 'min(136%, 550px)',
            height: '100%',
            maxWidth: '100vw',
          }}
        >
          {/* Body Character - Centered */}
          <img 
            src={bodyImage} 
            alt=""
            style={{
              width: 'min(100%, 547px)',
              height: 'auto',
              opacity: 0.84,
              zIndex: 1,
            }}
          />
          
          {/* Orbit - Percentage Positioned */}
          <img 
            src={orbitImage} 
            alt=""
            className="absolute"
            style={{
              width: 'min(92.3%, 505px)',
              height: 'auto',
              bottom: '18.8%',
              right: '2.6%',
              zIndex: 2,
            }}
          />
          
          {/* Star on Orbit - Percentage Positioned */}
          <img 
            src={starOnOrbit} 
            alt=""
            className="absolute"
            style={{
              width: 'clamp(1.5rem, 5.8vw, 2rem)',
              height: 'auto',
              top: '53.1%',
              left: '74.8%',
              zIndex: 3,
            }}
          />
          
          {/* Star 3 - Percentage Positioned */}
          <img 
            src={star3} 
            alt=""
            className="absolute"
            style={{
              width: 'clamp(3rem, 14vw, 4.8rem)',
              height: 'auto',
              top: '17.7%',
              left: '17.4%',
              zIndex: 2,
            }}
          />
          
          {/* Eyes Group - Percentage Positioned */}
          <div 
            className="absolute"
            style={{
              width: 'min(45%, 246px)',
              height: 'min(31%, 166px)',
              top: '36.9%',
              left: '26.7%',
              zIndex: 3,
            }}
          >
            <img 
              src={closedEye} 
              alt=""
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
      </section>

      {/* Tagline Section - Semantic Flex Layout */}
      <section 
        className="flex justify-center items-center"
        style={{
          padding: '0 clamp(1rem, 4vw, 2rem)',
        }}
      >
        <h1 
          style={{
            color: '#3B1389',
            textAlign: 'center',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
            fontWeight: 800,
            lineHeight: '140%',
            maxWidth: '100%',
          }}
        >
          Find Your Color. Glow in Hijab.
        </h1>
      </section>

      {/* CTA Button Section - Semantic Flex Layout */}
      <footer 
        className="flex justify-center items-center"
        style={{
          padding: '0 clamp(1rem, 4vw, 2rem)',
          marginTop: 'auto',
          paddingBottom: 'max(clamp(2rem, 10vh, 5rem), env(safe-area-inset-bottom))',
        }}
      >
        <button 
          onClick={handleStartAnalysis}
          className="flex items-center justify-center cursor-pointer"
          style={{ 
            width: 'min(90%, 370px)',
            height: 'clamp(3rem, 7vh, 3.5rem)',
            padding: 'clamp(0.625rem, 2vw, 1rem) clamp(1rem, 4vw, 1.5rem)',
            borderRadius: 'clamp(0.5rem, 1.5vw, 0.625rem)',
            background: '#FFF3A1',
            border: 'none',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <span 
            style={{ 
              color: '#3B1389',
              textAlign: 'center',
              fontFamily: 'Pretendard',
              fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
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