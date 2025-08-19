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

const BASE_W = 402;
const BASE_H = 874;

const HIGLandingPage: React.FC = () => {
  const navigate = useNavigate();
  
  const handleStartAnalysis = () => {
    navigate(ROUTES.DIAGNOSIS);
  };

  // CSS 변수로 스케일 계산: min(vw/BASE_W, dvh/BASE_H)
  const scaleStyle: React.CSSProperties = {
    // iOS 사파리 대응: 100dvh 사용
    // --scale = min(100vw/402, 100dvh/874)
    ['--scale' as any]: `min(calc(100vw / ${BASE_W}), calc(100dvh / ${BASE_H}))`,
  };

  return (
    <div className="fixed inset-0 bg-white overflow-hidden">
      {/* 아트보드 래퍼: 화면 중앙 정렬 */}
      <div className="w-full h-full flex items-center justify-center" style={scaleStyle}>
        {/* 실제 아트보드(기준 크기) */}
        <div
          className="relative"
          style={{
            width: `${BASE_W}px`,
            height: `${BASE_H}px`,
            transform: 'scale(var(--scale))',
            transformOrigin: 'center center',
            // iOS 노치 대응 여유
            paddingTop: 'max(env(safe-area-inset-top), 0px)',
            paddingBottom: 'max(env(safe-area-inset-bottom), 0px)',
            paddingLeft: 'max(env(safe-area-inset-left), 0px)',
            paddingRight: 'max(env(safe-area-inset-right), 0px)',
            // 배경 이미지
            backgroundImage: `url(${backgroundImage_1x})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            borderRadius: '16px', // 선택(테스트용)
          }}
        >
          {/* ↓↓↓ 아래는 기존 내용 그대로 (px 좌표/크기 유지) ↓↓↓ */}
          <div
            className="absolute left-1/2 -translate-x-1/2"
            style={{ width: '402px', height: '177px', top: '66px' }}
          >
            <img src={star1} alt="Star" style={{ width: '38px', height: '56.682px', position: 'absolute', left: '31.34px', top: '22.32px' }} />
            <img src={mynoorLogo} alt="Mynoor" style={{ width: '200px', height: '151.291px', marginTop: '14.5px', marginLeft: 'auto', marginRight: 'auto', display: 'block' }} />
            <img src={star2} alt="Star 2" style={{ width: '34.069px', height: '50.818px', position: 'absolute', right: '31.42px', bottom: '62px' }} />
          </div>

          <div className="absolute flex items-center justify-center" style={{ width: '547.161px', height: '530.778px', top: '201px', left: '-70px' }}>
            <img src={bodyImage} alt="Body" style={{ opacity: 0.84 }} />
            <img src={orbitImage} alt="Orbit" style={{ position: 'absolute', bottom: '100px', right: '14px', width: '505.2px', height: '341.16px' }} />
            <img src={starOnOrbit} alt="Star on Orbit" style={{ width: '32px', height: '59px', position: 'absolute', top: '282px', left: '409px' }} />
            <img src={star3} alt="Star 3" style={{ width: '77px', height: '143px', position: 'absolute', top: '94.1px', left: '95.3px' }} />
            <div style={{ width: '245.732px', height: '166.493px', position: 'absolute', top: '196px', left: '146px' }}>
              <img src={closedEye} alt="Closed Eye" style={{ width: '118.267px', height: '94.293px', position: 'absolute', top: '59.9px', right: '118px' }} />
              <img src={openEye} alt="Open Eye" style={{ width: '111.931px', height: '150.984px', position: 'absolute', left: '115px', bottom: '2.21px' }} />
            </div>
          </div>

          <div className="flex flex-col justify-center items-center absolute left-1/2 -translate-x-1/2" style={{ width: '402px', gap: '10px', bottom: '589px' }}>
            <span style={{
              color: '#3B1389',
              textAlign: 'center',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              // 폰트는 스케일 대상이므로 여기 px 유지 가능
              fontSize: '20px', fontWeight: 800, lineHeight: '140%', zIndex: 10
            }}>
              Find Your Color. Glow in Hijab.
            </span>
          </div>

          <div className="flex flex-col justify-center items-center absolute left-1/2 -translate-x-1/2" style={{ width: '402px', padding: '0 16px', gap: '10px', bottom: '90px' }}>
            <button 
              onClick={handleStartAnalysis}
              style={{ 
                height: '57px', 
                padding: '10px 16px', 
                borderRadius: '10px', 
                background: '#FFF3A1', 
                width: '100%',
                cursor: 'pointer',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <span style={{ color: '#3B1389', textAlign: 'center', fontFamily: 'Pretendard', fontSize: '20px', fontWeight: 700, lineHeight: '140%' }}>
                Start Analysis
              </span>
            </button>
          </div>
          {/* ↑↑↑ 기존 내용 끝 */}
        </div>
      </div>
    </div>
  );
};

export default HIGLandingPage;