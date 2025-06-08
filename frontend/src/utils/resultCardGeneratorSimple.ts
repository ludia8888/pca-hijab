import type { PersonalColorResult } from '@/types';
import { SEASON_DESCRIPTIONS } from './constants';
import { SEASON_COLORS } from './colorData';
import { SEASON_DATA, SEASON_GRADIENTS, type SeasonType } from './seasonData';

// Helper function to convert API response to season key
function getSeasonKey(personalColorEn: string): keyof typeof SEASON_DESCRIPTIONS {
  const seasonMap: Record<string, keyof typeof SEASON_DESCRIPTIONS> = {
    'Spring Warm': 'spring',
    'Summer Cool': 'summer',
    'Autumn Warm': 'autumn',
    'Winter Cool': 'winter'
  };
  
  return seasonMap[personalColorEn] || 'spring';
}

/**
 * Generates a simple test result card without custom fonts
 */
export const generateSimpleResultCard = async (
  result: PersonalColorResult,
  instagramId: string
): Promise<Blob> => {
  console.log('generateSimpleResultCard called');
  
  // Create canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Failed to create canvas context');
  }

  // Canvas dimensions
  const width = 1080;
  const height = 1920;
  canvas.width = width;
  canvas.height = height;

  // Get season info
  const seasonKey = getSeasonKey(result.personal_color_en) as SeasonType;
  const seasonInfo = SEASON_DESCRIPTIONS[seasonKey];
  const seasonData = SEASON_DATA[seasonKey];
  const gradientColors = SEASON_GRADIENTS[seasonKey];
  
  // Simple gradient background
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, gradientColors[0]);
  gradient.addColorStop(1, gradientColors[1]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // White card
  ctx.fillStyle = 'white';
  ctx.fillRect(60, 150, width - 120, 1600);

  // Title
  ctx.fillStyle = '#333';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Personal Color Analysis', width / 2, 250);
  
  // Season
  ctx.font = 'bold 72px Arial';
  ctx.fillText(seasonInfo.en, width / 2, 350);
  
  // Keywords
  ctx.font = '32px Arial';
  ctx.fillStyle = '#666';
  ctx.fillText('Keywords', width / 2, 450);
  
  ctx.font = '24px Arial';
  const keywordsText = seasonData.keywords.join(' • ');
  ctx.fillText(keywordsText, width / 2, 500);
  
  // Best colors
  ctx.font = '32px Arial';
  ctx.fillStyle = '#666';
  ctx.fillText('Best Hijab Colors', width / 2, 600);
  
  // Color swatches
  const colors = SEASON_COLORS[seasonKey].bestColors.slice(0, 6);
  const swatchSize = 120;
  const spacing = 20;
  const startX = (width - (6 * swatchSize + 5 * spacing)) / 2;
  
  colors.forEach((color, index) => {
    const x = startX + index * (swatchSize + spacing);
    const y = 650;
    
    ctx.fillStyle = color.hex;
    ctx.fillRect(x, y, swatchSize, swatchSize);
    
    ctx.fillStyle = '#666';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(color.name, x + swatchSize / 2, y + swatchSize + 25);
  });
  
  // Makeup
  ctx.font = '32px Arial';
  ctx.fillStyle = '#666';
  ctx.fillText('Makeup Recommendations', width / 2, 900);
  
  ctx.font = '20px Arial';
  ctx.fillText('Lips: ' + seasonData.makeupColors.lips.slice(0, 3).join(', '), width / 2, 950);
  
  // Perfume
  ctx.fillText('Perfume: ' + seasonData.perfumeNotes.family, width / 2, 1000);
  
  // Jewelry
  ctx.fillText('Jewelry: ' + seasonData.accessories.metal.toUpperCase(), width / 2, 1050);
  
  // Atmosphere
  ctx.font = 'italic 24px Arial';
  ctx.fillStyle = '#888';
  ctx.fillText('"' + seasonData.atmosphere + '"', width / 2, 1150);
  
  // Footer
  ctx.font = '24px Arial';
  ctx.fillStyle = '#666';
  ctx.fillText('@' + instagramId, width / 2, 1650);
  ctx.fillText('Hijab Personal Color AI', width / 2, 1700);

  // Convert to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to generate image'));
      }
    }, 'image/jpeg', 0.95);
  });
};