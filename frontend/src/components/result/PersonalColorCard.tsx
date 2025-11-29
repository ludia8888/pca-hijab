import React from 'react';
import type { PersonalColorResult } from '@/types';
import springCharacter from '@/assets/봄웜_캐릭터.png';
import summerCharacter from '@/assets/여름_캐릭터.png';
import autumnCharacter from '@/assets/가을_캐릭터.png';
import winterCharacter from '@/assets/겨울_캐릭터.png';

// Season type mapping for character and colors
export const SEASON_DATA = {
  spring: {
    title: 'Spring Warm',
    titleEn: 'Spring Warm',
    headerColor: '#FFDED0',
    backgroundColor: '#FFF5E6',
    accentColor: '#FF9999',
    character: springCharacter,
    description: 'Radiant and lively hues perfect for Spring Warm tones.',
  },
  summer: {
    title: 'Summer Cool',
    titleEn: 'Summer Cool',
    headerColor: '#B9DDFF',
    backgroundColor: '#E6F2FF',
    accentColor: '#87CEEB',
    character: summerCharacter,
    description: 'Soft, breezy colors that flatter Summer Cool complexions.',
  },
  autumn: {
    title: 'Autumn Warm',
    titleEn: 'Autumn Warm',
    headerColor: '#6B4418',
    backgroundColor: '#FFF0E6',
    accentColor: '#CD853F',
    character: autumnCharacter,
    description: 'Rich, warm shades that highlight Autumn Warm depth.',
  },
  winter: {
    title: 'Winter Cool',
    titleEn: 'Winter Cool',
    headerColor: '#BF0166',
    backgroundColor: '#F0E6FF',
    accentColor: '#9370DB',
    character: winterCharacter,
    description: 'Crisp, high-contrast tones for bold Winter Cool looks.',
  }
};

interface PersonalColorCardProps {
  result: PersonalColorResult;
  userName?: string;
}

export const PersonalColorCard: React.FC<PersonalColorCardProps> = ({ result, userName }) => {
  // Get season key from result
  const getSeasonKey = (personalColorEn: string): keyof typeof SEASON_DATA => {
    const seasonMap: Record<string, keyof typeof SEASON_DATA> = {
      'Spring Warm': 'spring',
      'Summer Cool': 'summer',
      'Autumn Warm': 'autumn',
      'Winter Cool': 'winter'
    };
    return seasonMap[personalColorEn] || 'spring';
  };

  const seasonKey = getSeasonKey(result.personal_color_en);
  const seasonData = SEASON_DATA[seasonKey];

  return (
    <div className="flex flex-col items-center w-full">
      {/* Card Component - responsive min-height with proper z-index */}
      <div className="relative overflow-hidden flex flex-col w-full" style={{ 
        backgroundColor: seasonData.headerColor, 
        minHeight: '331px',
        zIndex: 1, // Ensure card background is above page background but below character
        '@media (min-width: 768px)': {
          minHeight: '400px'
        },
        '@media (min-width: 1024px)': {
          minHeight: '450px'
        }
      }}>
        {/* Top colored section with back arrow and title - with proper z-index */}
        <div 
          className="flex items-center gap-2.5 p-4 md:p-6 lg:p-8 w-full flex-shrink-0 relative"
          style={{ 
            backgroundColor: seasonData.headerColor,
            zIndex: 20 // Ensure interactive elements are above character
          }}
        >
          <button 
            onClick={() => window.history.back()}
            className="flex-shrink-0"
            style={{ color: seasonKey === 'autumn' || seasonKey === 'winter' ? '#FFFFFF' : '#000000' }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span 
            className="text-[15px] md:text-[18px] lg:text-[20px] font-bold leading-[140%]"
            style={{ color: seasonKey === 'autumn' || seasonKey === 'winter' ? '#FFFFFF' : '#000000' }}
          >
            Matching Result
          </span>
        </div>

        {/* White content section - with spacing for character */}
        <div className="flex-1 flex flex-col justify-center p-6 md:p-8 lg:p-10" style={{
          paddingTop: '80px', // Add space for character
          minHeight: '200px'
        }}>
        </div>
      </div>
      
      {/* Result Text Below Card - with proper z-index */}
      <div 
        className="w-full md:px-8 lg:px-12 relative"
        style={{
          display: 'flex',
          padding: '16px',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '10px',
          marginTop: '10px',
          marginBottom: '10px',
          zIndex: 20 // Ensure text is above character
        }}
      >
        <h1 
          className="md:text-[30px] lg:text-[36px]"
          style={{
            color: '#000',
            textAlign: 'center',
            fontFamily: '"Plus Jakarta Sans"',
            fontSize: '24px',
            fontStyle: 'normal',
            fontWeight: 800,
            lineHeight: '140%'
          }}
        >
          {seasonData.title}
        </h1>
      </div>
      
      {/* Color Palette Text - with proper z-index */}
      <div 
        className="w-full md:px-8 lg:px-12 relative"
        style={{
          padding: '8px 18px',
          borderRadius: '10px',
          background: 'transparent',
          zIndex: 20 // Ensure text is above character
        }}
      >
        <span className="md:text-[22px] lg:text-[26px]" style={{
          color: '#000',
          fontFamily: 'Pretendard',
          fontSize: '18px',
          fontStyle: 'normal',
          fontWeight: 700,
          lineHeight: '140%'
        }}>
          Your Color Palette
        </span>
      </div>
    </div>
  );
};
