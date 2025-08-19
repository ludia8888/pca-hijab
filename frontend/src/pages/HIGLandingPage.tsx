import React from 'react';
import backgroundImage from '../assets/배경1.png';
import mynoorLogo from '../assets/Mynoor.png';
import star1 from '../assets/별1.png';
import star2 from '../assets/별2.png';
import bodyImage from '../assets/몸뚱아리.svg';
import orbitImage from '../assets/궤도.svg';
import starOnOrbit from '../assets/궤도위의별.png';

const HIGLandingPage: React.FC = () => {
  return (
    <div className="w-full h-screen bg-white overflow-hidden">
      <div 
        className="mx-auto bg-cover bg-center bg-no-repeat relative flex flex-col"
        style={{ 
          width: '402px', 
          height: '874px',
          maxWidth: '100%',
          backgroundImage: `url(${backgroundImage})`
        }}
      >
        <div
          className="absolute left-1/2 transform -translate-x-1/2"
          style={{
            width: '402px',
            height: '177px',
            flexShrink: 0,
            top: '66px',
            border: '1px solid rgba(0, 0, 0, 0.2)'
          }}
        >
          <img 
            src={star1}
            alt="Star"
            style={{
              width: '38px',
              height: '56.682px',
              flexShrink: 0,
              position: 'absolute',
              left: '31.34px',
              top: '22.32px'
            }}
          />
          <img 
            src={mynoorLogo}
            alt="Mynoor"
            style={{
              width: '200px',
              height: '151.291px',
              flexShrink: 0,
              marginTop: '14.5px',
              marginLeft: 'auto',
              marginRight: 'auto',
              display: 'block'
            }}
          />
          <img 
            src={star2}
            alt="Star 2"
            style={{
              width: '34.069px',
              height: '50.818px',
              flexShrink: 0,
              position: 'absolute',
              right: '31.42px',
              bottom: '62px'
            }}
          />
        </div>
        <div
          className="absolute flex items-center justify-center"
          style={{
            width: '547.161px',
            height: '530.778px',
            flexShrink: 0,
            top: '201px',
            left: '-70px',
            border: '1px solid rgba(0, 0, 0, 0.2)'
          }}
        >
          <img 
            src={bodyImage}
            alt="Body"
            style={{
              opacity: 0.84
            }}
          />
          <img 
            src={orbitImage}
            alt="Orbit"
            style={{
              position: 'absolute',
              bottom: '100px',
              right: '70.3px'
            }}
          />
          <img 
            src={starOnOrbit}
            alt="Star on Orbit"
            style={{
              width: '32px',
              height: '59px',
              flexShrink: 0,
              aspectRatio: '32/59',
              position: 'absolute',
              top: '282px',
              left: '409px'
            }}
          />
        </div>
        <div
          className="flex flex-col justify-center items-center absolute left-1/2 transform -translate-x-1/2"
          style={{
            display: 'flex',
            width: '402px',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '10px',
            bottom: '589px',
            border: '1px solid rgba(0, 0, 0, 0.2)'
          }}
        >
          <span
            style={{
              color: '#3B1389',
              textAlign: 'center',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '20px',
              fontStyle: 'normal',
              fontWeight: '800',
              lineHeight: '140%',
              zIndex: 10
            }}
          >
            Find Your Color. Glow in Hijab.
          </span>
        </div>
        <div
          className="flex flex-col justify-center items-center absolute left-1/2 transform -translate-x-1/2"
          style={{
            display: 'flex',
            width: '402px',
            padding: '0 16px',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '10px',
            bottom: '90px',
            border: '1px solid rgba(0, 0, 0, 0.2)'
          }}
        >
          <button
            style={{
              display: 'flex',
              height: '57px',
              padding: '10px 16px',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '10px',
              alignSelf: 'stretch',
              borderRadius: '10px',
              background: '#FFF3A1'
            }}
          >
            <span
              style={{
                color: '#3B1389',
                textAlign: 'center',
                fontFamily: 'Pretendard',
                fontSize: '20px',
                fontStyle: 'normal',
                fontWeight: '700',
                lineHeight: '140%'
              }}
            >
              Start Analysis
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HIGLandingPage;