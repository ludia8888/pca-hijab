import React from 'react';
import { SEASON_COLORS } from '@/utils/colorData';

interface ColorPaletteSectionProps {
  seasonKey: 'spring' | 'summer' | 'autumn' | 'winter';
}

export const ColorPaletteSection: React.FC<ColorPaletteSectionProps> = ({ seasonKey }) => {
  // Check if screen is tablet or larger (768px breakpoint)
  const [isTabletOrLarger, setIsTabletOrLarger] = React.useState(false);

  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsTabletOrLarger(window.innerWidth >= 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  const seasonColors = SEASON_COLORS[seasonKey];
  const bestColors = seasonColors.bestColors;
  const worstColors = seasonColors.worstColors;

  const seasonNames = {
    spring: 'Spring Warm',
    summer: 'Summer Cool',
    autumn: 'Autumn Warm',
    winter: 'Winter Cool'
  };

  return (
    <div className="space-y-6">
      {/* Best Colors */}
      <div 
        style={{
          display: 'flex',
          minHeight: '202px',
          padding: '32px 18px',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '10px',
          alignSelf: 'stretch',
          borderRadius: '10px',
          background: '#FFF'
        }}
      >
        <h3 style={{
          color: '#000',
          fontFamily: 'Pretendard',
          fontSize: '15px',
          fontStyle: 'normal',
          fontWeight: 700,
          lineHeight: '140%',
          alignSelf: 'stretch'
        }}>Best Color</h3>
        
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          alignContent: 'flex-start',
          gap: '4px',
          alignSelf: 'stretch',
          flexWrap: 'wrap',
          width: '100%'
        }}>
          {bestColors.slice(0, 10).map((color, index) => (
            <div
              key={index}
              style={{ 
                backgroundColor: color.hex,
                width: isTabletOrLarger ? 'calc((100% - 36px) / 10)' : 'calc((100% - 16px) / 5)',
                aspectRatio: '1/1',
                borderRadius: '10px',
                flexShrink: 0
              }}
            />
          ))}
        </div>
      </div>

      {/* Worst Colors */}
      <div 
        style={{
          display: 'flex',
          minHeight: '202px',
          padding: '32px 18px',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '10px',
          alignSelf: 'stretch',
          borderRadius: '10px',
          background: '#FFF'
        }}
      >
        <h3 style={{
          color: '#000',
          fontFamily: 'Pretendard',
          fontSize: '15px',
          fontStyle: 'normal',
          fontWeight: 700,
          lineHeight: '140%',
          alignSelf: 'stretch'
        }}>Worst Color</h3>
        
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          alignContent: 'flex-start',
          gap: '4px',
          alignSelf: 'stretch',
          flexWrap: 'wrap',
          width: '100%'
        }}>
          {worstColors.slice(0, 10).map((color, index) => (
            <div
              key={index}
              style={{ 
                backgroundColor: color.hex,
                width: isTabletOrLarger ? 'calc((100% - 36px) / 10)' : 'calc((100% - 16px) / 5)',
                aspectRatio: '1/1',
                borderRadius: '10px',
                opacity: 0.6,
                flexShrink: 0
              }}
            />
          ))}
        </div>
      </div>

      {/* Season Text */}
      <div 
        style={{
          display: 'flex',
          width: '100%',
          padding: '8px 16px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}
      >
        <span style={{
          color: '#FEB394',
          fontFamily: 'Pretendard',
          fontSize: '18px',
          fontStyle: 'normal',
          fontWeight: 700,
          lineHeight: '140%'
        }}>
          {seasonNames[seasonKey]}
        </span>
        <span style={{
          color: '#000',
          fontFamily: 'Pretendard',
          fontSize: '18px',
          fontStyle: 'normal',
          fontWeight: 700,
          lineHeight: '140%'
        }}>
          Recommended Hijab - Click to view
        </span>
      </div>
    </div>
  );
};