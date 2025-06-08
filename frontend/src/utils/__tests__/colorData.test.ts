import { describe, it, expect } from 'vitest';
import { SEASON_COLORS, type SeasonType } from '../colorData';

describe('SEASON_COLORS', () => {
  const seasons: SeasonType[] = ['spring', 'summer', 'autumn', 'winter'];
  
  // 기본 구조 검증
  it('should have data for all seasons', () => {
    const expectedSeasons = ['spring', 'summer', 'autumn', 'winter'];
    const actualSeasons = Object.keys(SEASON_COLORS);
    
    expectedSeasons.forEach(season => {
      expect(actualSeasons).toContain(season);
    });
  });

  // 각 계절별 데이터 검증
  seasons.forEach(season => {
    describe(`${season} season`, () => {
      it('should have exactly 4 best colors', () => {
        expect(SEASON_COLORS[season].bestColors).toHaveLength(4);
      });

      it('should have exactly 4 worst colors', () => {
        expect(SEASON_COLORS[season].worstColors).toHaveLength(4);
      });

      it('should have valid color data structure for best colors', () => {
        SEASON_COLORS[season].bestColors.forEach((color) => {
          expect(color).toHaveProperty('name');
          expect(color).toHaveProperty('hex');
          expect(color).toHaveProperty('description');
          
          expect(color.name).toBeTruthy();
          expect(color.description).toBeTruthy();
          
          // Hex color validation
          expect(color.hex).toMatch(/^#[0-9A-F]{6}$/i);
        });
      });

      it('should have valid color data structure for worst colors', () => {
        SEASON_COLORS[season].worstColors.forEach((color) => {
          expect(color).toHaveProperty('name');
          expect(color).toHaveProperty('hex');
          expect(color).toHaveProperty('description');
          
          expect(color.name).toBeTruthy();
          expect(color.description).toBeTruthy();
          
          // Hex color validation
          expect(color.hex).toMatch(/^#[0-9A-F]{6}$/i);
        });
      });

      it('should not have duplicate colors within best colors', () => {
        const hexValues = SEASON_COLORS[season].bestColors.map(c => c.hex);
        const uniqueHexValues = new Set(hexValues);
        expect(hexValues.length).toBe(uniqueHexValues.size);
      });

      it('should not have duplicate colors within worst colors', () => {
        const hexValues = SEASON_COLORS[season].worstColors.map(c => c.hex);
        const uniqueHexValues = new Set(hexValues);
        expect(hexValues.length).toBe(uniqueHexValues.size);
      });
    });
  });


  // 색상 대비 검증 (웜톤/쿨톤)
  describe('color temperature consistency', () => {
    it('spring (warm) should have warm-toned best colors', () => {
      const warmColors = ['#FF7F50', '#FBCEB1', '#FFD700'];
      const springBestHexes = SEASON_COLORS.spring.bestColors.map(c => c.hex);
      
      warmColors.forEach(warmColor => {
        expect(springBestHexes).toContain(warmColor);
      });
    });

    it('summer (cool) should have cool-toned best colors', () => {
      const coolColors = ['#ADD8E6', '#E6E6FA'];
      const summerBestHexes = SEASON_COLORS.summer.bestColors.map(c => c.hex);
      
      coolColors.forEach(coolColor => {
        expect(summerBestHexes).toContain(coolColor);
      });
    });

    it('winter (cool) should have cool/neutral-toned best colors', () => {
      const winterBestColors = SEASON_COLORS.winter.bestColors;
      
      // 겨울은 진한 차가운 색상들을 포함해야 함
      const hasDeepCoolColors = winterBestColors.some(color => 
        color.name.includes('진한') || color.name.includes('차가운')
      );
      expect(hasDeepCoolColors).toBe(true);
    });
  });

  // 설명 텍스트 검증
  describe('description quality', () => {
    seasons.forEach(season => {
      it(`${season} should have meaningful descriptions`, () => {
        const allColors = [
          ...SEASON_COLORS[season].bestColors,
          ...SEASON_COLORS[season].worstColors
        ];

        allColors.forEach(color => {
          // 설명이 최소 5자 이상
          expect(color.description.length).toBeGreaterThanOrEqual(5);
          
          // 설명이 마침표나 의미있는 내용으로 끝나야 함
          expect(color.description).not.toMatch(/\s$/); // 공백으로 끝나지 않음
        });
      });
    });
  });

  // 색상명 일관성 검증
  describe('color naming consistency', () => {
    it('should not have color names ending with "색" in all entries', () => {
      seasons.forEach(season => {
        const allColors = [
          ...SEASON_COLORS[season].bestColors,
          ...SEASON_COLORS[season].worstColors
        ];

        const hasConsistentNaming = allColors.every(color => 
          color.name.endsWith('색') || !color.name.includes('색')
        );
        
        expect(hasConsistentNaming).toBe(true);
      });
    });
  });
});