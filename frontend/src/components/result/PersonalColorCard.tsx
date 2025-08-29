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
    description: '화사하고 따뜻한 이미지의 봄 웜톤',
  },
  summer: {
    title: 'Summer Cool',
    titleEn: 'Summer Cool',
    headerColor: '#B9DDFF',
    backgroundColor: '#E6F2FF',
    accentColor: '#87CEEB',
    character: summerCharacter,
    description: '시원하고 부드러운 이미지의 여름 쿨톤',
  },
  autumn: {
    title: 'Autumn Warm',
    titleEn: 'Autumn Warm',
    headerColor: '#6B4418',
    backgroundColor: '#FFF0E6',
    accentColor: '#CD853F',
    character: autumnCharacter,
    description: '깊고 따뜻한 이미지의 가을 웜톤',
  },
  winter: {
    title: 'Winter Cool',
    titleEn: 'Winter Cool',
    headerColor: '#BF0166',
    backgroundColor: '#F0E6FF',
    accentColor: '#9370DB',
    character: winterCharacter,
    description: '차갑고 선명한 이미지의 겨울 쿨톤',
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
      {/* Card Component */}
      <div className="relative overflow-hidden flex flex-col w-full" style={{ backgroundColor: seasonData.headerColor, minHeight: '331px' }}>
        {/* Top colored section with back arrow and title */}
        <div 
          className="flex items-center gap-2.5 p-4 w-full flex-shrink-0"
          style={{ backgroundColor: seasonData.headerColor }}
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
            className="text-[15px] font-bold leading-[140%]"
            style={{ color: seasonKey === 'autumn' || seasonKey === 'winter' ? '#FFFFFF' : '#000000' }}
          >
            {userName ? `${userName}'s` : 'Your'} Matching Result
          </span>
        </div>

        {/* White content section */}
        <div className="flex-1 flex flex-col justify-center p-6">
        </div>
      </div>
      
      {/* Result Text Below Card */}
      <div 
        className="w-full"
        style={{
          display: 'flex',
          padding: '16px',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '10px',
          marginTop: '10px',
          marginBottom: '10px'
        }}
      >
        <h1 
          style={{
            color: '#000',
            textAlign: 'center',
            fontFamily: 'Pretendard',
            fontSize: '18px',
            fontStyle: 'normal',
            fontWeight: 700,
            lineHeight: '140%'
          }}
        >
          You are{' '}
          <span 
            style={{
              color: '#000',
              fontFamily: '"Plus Jakarta Sans"',
              fontSize: '24px',
              fontStyle: 'normal',
              fontWeight: 800,
              lineHeight: '140%'
            }}
          >
            {seasonData.title}
          </span>
        </h1>
      </div>
      
      {/* Color Palette Text */}
      <div 
        className="w-full"
        style={{
          padding: '8px 18px',
          borderRadius: '10px',
          background: 'transparent'
        }}
      >
        <span style={{
          color: '#000',
          fontFamily: 'Pretendard',
          fontSize: '18px',
          fontStyle: 'normal',
          fontWeight: 700,
          lineHeight: '140%'
        }}>
          {userName ? `${userName}'s` : 'Your'} Color Palette
        </span>
      </div>
    </div>
  );
};