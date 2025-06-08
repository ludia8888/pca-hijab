import type { PersonalColorResult } from '@/types';
import { SEASON_DESCRIPTIONS } from './constants';
import { SEASON_COLORS } from './colorData';
import { SEASON_DATA, SEASON_GRADIENTS, type SeasonType } from './seasonData';
import { loadFonts } from './fontLoader';
import { setupCanvasPolyfill } from './canvasPolyfill';

// Setup polyfill
setupCanvasPolyfill();

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

// Helper to draw rounded rectangle with gradient
function drawGradientRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  colors: string[]
) {
  const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
  colors.forEach((color, index) => {
    gradient.addColorStop(index / (colors.length - 1), color);
  });
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  // @ts-ignore - roundRect might not be in types but we have polyfill
  ctx.roundRect(x, y, width, height, radius);
  ctx.fill();
}

// Helper to draw text with shadow
function drawTextWithShadow(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  font: string,
  color: string,
  align: CanvasTextAlign = 'center'
) {
  ctx.font = font;
  ctx.textAlign = align;
  
  // Shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 2;
  
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  
  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

// Helper to wrap text
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
  return currentY + lineHeight;
}

/**
 * Generates a beautiful result card image for sharing
 * @param result - Personal color analysis result
 * @param instagramId - User's Instagram ID
 * @returns Promise<Blob> - Generated image as blob
 */
export const generateResultCard = async (
  result: PersonalColorResult,
  instagramId: string
): Promise<Blob> => {
  console.log('generateResultCard called with:', { result, instagramId });
  
  // Load fonts first
  try {
    await loadFonts();
    console.log('Fonts loaded successfully');
  } catch (error) {
    console.warn('Font loading error:', error);
  }
  
  // Create canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Failed to create canvas context');
  }

  // Canvas dimensions for Instagram story (9:16)
  const width = 1080;
  const height = 1920;
  canvas.width = width;
  canvas.height = height;

  // Get season info
  const seasonKey = getSeasonKey(result.personal_color_en) as SeasonType;
  console.log('Season key:', seasonKey);
  const seasonInfo = SEASON_DESCRIPTIONS[seasonKey];
  const seasonData = SEASON_DATA[seasonKey];
  const seasonColors = SEASON_COLORS[seasonKey];
  const gradientColors = SEASON_GRADIENTS[seasonKey];
  console.log('Season data loaded:', { seasonInfo, seasonData, gradientColors });
  
  if (!seasonData || !gradientColors) {
    console.error('Missing season data for:', seasonKey);
    throw new Error(`Missing season data for ${seasonKey}`);
  }
  
  // Background - Soft gradient
  const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
  bgGradient.addColorStop(0, gradientColors[0]);
  bgGradient.addColorStop(1, gradientColors[1]);
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // Add subtle pattern overlay
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  for (let i = 0; i < 20; i++) {
    ctx.beginPath();
    ctx.arc(
      Math.random() * width,
      Math.random() * height,
      Math.random() * 100 + 50,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Header section with decorative elements
  drawTextWithShadow(ctx, '✨', width / 2 - 150, 100, '48px Noto Sans', '#FFD700');
  drawTextWithShadow(ctx, 'Personal Color Analysis', width / 2, 100, '36px Playfair Display', '#4A4A4A');
  drawTextWithShadow(ctx, '✨', width / 2 + 150, 100, '48px Noto Sans', '#FFD700');

  // Main result card
  const cardX = 60;
  const cardY = 150;
  const cardWidth = width - 120;
  const cardHeight = 1600;
  
  // Card background with shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 10;
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.beginPath();
  // @ts-ignore - roundRect might not be in types but we have polyfill
  ctx.roundRect(cardX, cardY, cardWidth, cardHeight, 30);
  ctx.fill();
  
  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // Season name section
  const seasonY = cardY + 80;
  drawTextWithShadow(ctx, 'Your Season', width / 2, seasonY, '28px Noto Sans', '#888888');
  drawTextWithShadow(ctx, seasonInfo.en.toUpperCase(), width / 2, seasonY + 60, 'bold 52px Playfair Display', '#333333');
  
  // Decorative line
  const lineY = seasonY + 100;
  ctx.strokeStyle = '#E0E0E0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cardX + 100, lineY);
  ctx.lineTo(cardX + cardWidth - 100, lineY);
  ctx.stroke();

  // Keywords section
  const keywordsY = lineY + 50;
  drawTextWithShadow(ctx, 'Keywords', width / 2, keywordsY, '24px Playfair Display', '#666666');
  
  const keywordBoxY = keywordsY + 30;
  seasonData.keywords.forEach((keyword, index) => {
    const x = cardX + 80 + (index % 3) * 280;
    const y = keywordBoxY + Math.floor(index / 3) * 60;
    
    // Keyword box
    drawGradientRoundRect(ctx, x, y, 240, 45, 25, [gradientColors[0], gradientColors[1]]);
    drawTextWithShadow(ctx, keyword, x + 120, y + 30, '20px Noto Sans', '#4A4A4A');
  });

  // Best Colors section
  const colorsY = keywordBoxY + 150;
  drawTextWithShadow(ctx, 'Your Best Hijab Colors', width / 2, colorsY, '24px Playfair Display', '#666666');
  
  const colorSwatchY = colorsY + 40;
  const swatchSize = 120;
  const swatchSpacing = 20;
  const swatchStartX = (width - (6 * swatchSize + 5 * swatchSpacing)) / 2;
  
  seasonColors.bestColors.slice(0, 6).forEach((color, index) => {
    const x = swatchStartX + index * (swatchSize + swatchSpacing);
    const y = colorSwatchY;
    
    // Color swatch with shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 8;
    ctx.fillStyle = color.hex;
    ctx.beginPath();
    // @ts-ignore - roundRect might not be in types but we have polyfill
    ctx.roundRect(x, y, swatchSize, swatchSize, 15);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    
    // Color name
    ctx.font = '16px Noto Sans';
    ctx.fillStyle = '#666666';
    ctx.textAlign = 'center';
    ctx.fillText(color.name, x + swatchSize / 2, y + swatchSize + 25);
  });

  // Makeup recommendations
  const makeupY = colorSwatchY + swatchSize + 80;
  drawTextWithShadow(ctx, 'Makeup Palette', width / 2, makeupY, '24px Playfair Display', '#666666');
  
  // Lip colors
  const lipY = makeupY + 40;
  drawTextWithShadow(ctx, 'Lips', cardX + 150, lipY, '18px Noto Sans', '#888888', 'left');
  
  seasonData.makeupColors.lips.slice(0, 5).forEach((lipColor, index) => {
    const x = cardX + 150 + index * 140;
    const y = lipY + 20;
    
    // Mini color circle
    ctx.fillStyle = '#E91E63';
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // Label
    ctx.font = '14px Noto Sans';
    ctx.fillStyle = '#666666';
    ctx.textAlign = 'center';
    ctx.fillText(lipColor, x, y + 35);
  });

  // Perfume section
  const perfumeY = lipY + 100;
  drawTextWithShadow(ctx, 'Signature Scent', width / 2, perfumeY, '24px Playfair Display', '#666666');
  
  ctx.font = '18px Noto Sans';
  ctx.fillStyle = '#888888';
  ctx.textAlign = 'center';
  ctx.fillText(seasonData.perfumeNotes.family, width / 2, perfumeY + 35);
  
  // Perfume notes
  const notesText = seasonData.perfumeNotes.notes.join(' • ');
  ctx.font = '16px Noto Sans';
  ctx.fillStyle = '#999999';
  ctx.fillText(notesText, width / 2, perfumeY + 60);

  // Accessories
  const accessoryY = perfumeY + 100;
  drawTextWithShadow(ctx, 'Jewelry', width / 2, accessoryY, '24px Playfair Display', '#666666');
  
  // Metal preference with icon
  const metalY = accessoryY + 40;
  const metalColors = {
    gold: '#FFD700',
    silver: '#C0C0C0',
    'rose-gold': '#E8B4B8'
  };
  
  ctx.fillStyle = metalColors[seasonData.accessories.metal];
  ctx.beginPath();
  ctx.arc(width / 2, metalY, 25, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.font = '18px Noto Sans';
  ctx.fillStyle = '#666666';
  ctx.textAlign = 'center';
  ctx.fillText(seasonData.accessories.metal.replace('-', ' ').toUpperCase(), width / 2, metalY + 45);

  // Atmosphere description
  const atmosphereY = metalY + 80;
  drawTextWithShadow(ctx, '\"' + seasonData.atmosphere + '\"', width / 2, atmosphereY, 'italic 20px Playfair Display', '#888888');

  // Footer section
  const footerY = cardY + cardHeight - 100;
  
  // Instagram handle
  drawTextWithShadow(ctx, `@${instagramId}`, width / 2, footerY, '24px Noto Sans', '#888888');
  
  // Service branding
  drawTextWithShadow(ctx, 'Hijab Personal Color AI', width / 2, footerY + 40, 'bold 28px Playfair Display', '#666666');
  
  // Date
  const date = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  ctx.font = '16px Noto Sans';
  ctx.fillStyle = '#999999';
  ctx.textAlign = 'center';
  ctx.fillText(date, width / 2, height - 40);

  // Convert canvas to blob
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

/**
 * Downloads the result card image
 * @param blob - Image blob
 * @param filename - Download filename
 */
export const downloadResultCard = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};