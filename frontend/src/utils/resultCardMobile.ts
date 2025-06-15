import type { PersonalColorResult } from '@/types';
import { SEASON_DESCRIPTIONS } from './constants';
import { SEASON_COLORS } from './colorData';
import { SEASON_DATA, type SeasonType } from './seasonData';
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

// Enhanced mobile-optimized gradient backgrounds
const MOBILE_GRADIENTS: Record<SeasonType, { bg: string[], card: string[] }> = {
  spring: {
    bg: ['#FFF0F5', '#FFE4EC', '#FFDBDB', '#FFDCC5'], // Enhanced pink to peach
    card: ['#FFFFFF', '#FFF9FC']
  },
  summer: {
    bg: ['#F3F0FF', '#E6D7FF', '#D4C5F9', '#C8B6FF'], // Enhanced lavender
    card: ['#FFFFFF', '#FAFAFF']
  },
  autumn: {
    bg: ['#FFF5EB', '#FFE5D0', '#FFD4B0', '#FFC090'], // Enhanced warm tones
    card: ['#FFFFFF', '#FFFAF6']
  },
  winter: {
    bg: ['#EFF4FF', '#E0EBFF', '#D1E3FF', '#C2DAFF'], // Enhanced cool blues
    card: ['#FFFFFF', '#F8FAFF']
  }
};

// Season emojis for visual appeal
const SEASON_EMOJIS: Record<SeasonType, string> = {
  spring: '🌸',
  summer: '💎',
  autumn: '🍂',
  winter: '❄️'
};

/**
 * Generates a mobile-optimized result card for Instagram stories
 */
export const generateMobileResultCard = async (
  result: PersonalColorResult,
  instagramId: string
): Promise<Blob> => {
  // Load fonts
  await loadMobileFonts();
  
  // Create canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Failed to create canvas context');
  }

  // Instagram story dimensions
  const width = 1080;
  const height = 1920;
  canvas.width = width;
  canvas.height = height;

  // Get season info
  const seasonKey = getSeasonKey(result.personal_color_en) as SeasonType;
  const seasonInfo = SEASON_DESCRIPTIONS[seasonKey];
  const seasonData = SEASON_DATA[seasonKey];
  const seasonColors = SEASON_COLORS[seasonKey];
  const gradients = MOBILE_GRADIENTS[seasonKey];
  
  // Draw background with smooth gradient
  drawMobileBackground(ctx, width, height, gradients.bg);
  
  // Safe zones for Instagram
  const safeTop = 120; // Space for status bar
  const safeBottom = 120; // Space for Instagram UI
  const contentHeight = height - safeTop - safeBottom;
  
  // Main card container
  const cardMargin = 24;
  const cardWidth = width - (cardMargin * 2);
  const cardX = cardMargin;
  const cardY = safeTop + 40;
  const cardHeight = contentHeight - 80;
  
  // Draw main card with subtle shadow
  drawMobileCard(ctx, cardX, cardY, cardWidth, cardHeight, gradients.card);
  
  // Header section - fixed positioning
  let currentY = cardY + 60;
  
  // App branding at top
  ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#9B59B6';
  ctx.textAlign = 'center';
  ctx.fillText('NOOR.AI PERSONAL COLOR ANALYSIS', width / 2, currentY);
  
  currentY += 50;
  
  // Season emoji
  ctx.font = '72px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(SEASON_EMOJIS[seasonKey], width / 2, currentY);
  
  currentY += 70;
  
  // Season name
  ctx.font = 'bold 46px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#2D3436';
  ctx.textAlign = 'center';
  ctx.fillText(seasonInfo.en.toUpperCase(), width / 2, currentY);
  
  currentY += 45;
  
  // Season description
  ctx.font = '22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#636E72';
  ctx.textAlign = 'center';
  // Word wrap long descriptions
  const description = SEASON_DESCRIPTIONS[seasonKey].description;
  const maxWidth = cardWidth - 100;
  const words = description.split(' ');
  let line = '';
  let lineY = currentY;
  
  words.forEach((word, index) => {
    const testLine = line + word + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    
    if (testWidth > maxWidth && line !== '') {
      ctx.fillText(line.trim(), width / 2, lineY);
      line = word + ' ';
      lineY += 28;
    } else {
      line = testLine;
    }
    
    if (index === words.length - 1) {
      ctx.fillText(line.trim(), width / 2, lineY);
    }
  });
  
  currentY = lineY + 50;
  
  // Divider
  drawDivider(ctx, width / 2 - 100, currentY, 200);
  currentY += 30;
  
  // Keywords
  drawKeywordTags(ctx, seasonData.keywords, width / 2, currentY, seasonKey);
  currentY += 90;
  
  // Best colors section
  ctx.font = 'bold 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#2D3436';
  ctx.textAlign = 'center';
  ctx.fillText('🎨 YOUR BEST HIJAB COLORS', width / 2, currentY);
  
  currentY += 50;
  
  // Color palette - calculate proper height
  const colorPaletteHeight = drawMobileColorPalette(ctx, seasonColors.bestColors.slice(0, 6), width / 2, currentY);
  currentY += colorPaletteHeight + 60;
  
  // Makeup section
  ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#2D3436';
  ctx.fillText('💄 MAKEUP PALETTE', width / 2, currentY);
  
  currentY += 45;
  
  // Lip colors
  drawMakeupRecommendations(ctx, seasonData.makeupColors.lips.slice(0, 4), width / 2, currentY, 'Recommended Lip Colors');
  currentY += 90;
  
  // Style tip - check if there's enough space
  const remainingSpace = (cardY + cardHeight - 180) - currentY;
  if (remainingSpace > 100) {
    drawStyleTip(ctx, seasonData.atmosphere, width / 2, currentY, seasonKey);
    currentY += 100;
  }
  
  // Footer - fixed position at bottom
  drawMobileFooter(ctx, instagramId, width, cardY + cardHeight - 150);
  
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

// Helper functions for mobile-optimized design

async function loadMobileFonts(): Promise<void> {
  // Use system fonts for better mobile compatibility
  // No need to load external fonts
}

function drawMobileBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colors: string[]
) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  colors.forEach((color, index) => {
    gradient.addColorStop(index / (colors.length - 1), color);
  });
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Add subtle texture
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 200 + 100;
    
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawMobileCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  colors: string[]
) {
  // Shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 10;
  
  // Card background
  const gradient = ctx.createLinearGradient(x, y, x, y + height);
  colors.forEach((color, index) => {
    gradient.addColorStop(index / (colors.length - 1), color);
  });
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  // @ts-expect-error - roundRect is not in TypeScript definitions yet
  ctx.roundRect(x, y, width, height, 20);
  ctx.fill();
  
  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
}

function drawDivider(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number
) {
  const gradient = ctx.createLinearGradient(x, y, x + width, y);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.1)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + width, y);
  ctx.stroke();
}

function drawKeywordTags(
  ctx: CanvasRenderingContext2D,
  keywords: string[],
  centerX: number,
  y: number,
  season: SeasonType
) {
  const tagHeight = 42;
  const padding = 30;
  const spacing = 16;
  
  // Get season-specific colors for tags
  const seasonColors = {
    spring: '#FFB6C1',
    summer: '#B19CD9',
    autumn: '#DEB887',
    winter: '#87CEEB'
  };
  
  // Calculate positions
  const positions: Array<{ keyword: string; width: number; x: number }> = [];
  let currentX = 0;
  
  ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  
  // Ensure keywords are in English
  const englishKeywords = keywords.map(k => k.toUpperCase());
  
  englishKeywords.forEach((keyword) => {
    const width = ctx.measureText(keyword).width + padding * 2;
    positions.push({ keyword, width, x: currentX });
    currentX += width + spacing;
  });
  
  // Center align
  const totalWidth = currentX - spacing;
  const startX = centerX - totalWidth / 2;
  
  // Draw tags with enhanced design
  positions.forEach(({ keyword, width, x }) => {
    const tagX = startX + x;
    
    // Tag background with gradient
    const gradient = ctx.createLinearGradient(tagX, y, tagX + width, y + tagHeight);
    gradient.addColorStop(0, seasonColors[season]);
    gradient.addColorStop(1, `${seasonColors[season]}CC`);
    
    ctx.fillStyle = gradient;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    // @ts-expect-error - roundRect is not in TypeScript definitions yet
    ctx.roundRect(tagX, y, width, tagHeight, tagHeight / 2);
    ctx.fill();
    ctx.stroke();
    
    // Tag text
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText(keyword, tagX + width / 2, y + tagHeight / 2 + 7);
  });
}

function drawMobileColorPalette(
  ctx: CanvasRenderingContext2D,
  colors: Array<{hex: string; name: string}>,
  centerX: number,
  y: number
): number {
  const swatchSize = 80;
  const spacing = 20;
  const nameHeight = 35;
  const rowSpacing = swatchSize + nameHeight + 20;
  const totalWidth = 3 * swatchSize + 2 * spacing;
  const startX = centerX - totalWidth / 2;
  const numRows = Math.ceil(colors.length / 3);
  
  colors.forEach((color, index) => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    const x = startX + col * (swatchSize + spacing);
    const swatchY = y + row * rowSpacing;
    
    // Shadow for swatch
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 5;
    
    // Color swatch
    ctx.fillStyle = color.hex;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    // @ts-expect-error - roundRect is not in TypeScript definitions yet
    ctx.roundRect(x, swatchY, swatchSize, swatchSize, 16);
    ctx.fill();
    ctx.stroke();
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    
    // Color code inside swatch
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(color.hex.toUpperCase(), x + swatchSize / 2, swatchY + swatchSize - 8);
    
    // Color name below swatch
    ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#2D3436';
    ctx.textAlign = 'center';
    ctx.fillText(color.name.toUpperCase(), x + swatchSize / 2, swatchY + swatchSize + 22);
  });
  
  // Return total height used
  return numRows * rowSpacing;
}

function drawMakeupRecommendations(
  ctx: CanvasRenderingContext2D,
  colors: string[],
  centerX: number,
  y: number,
  label: string
) {
  // Label
  ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#636E72';
  ctx.textAlign = 'center';
  ctx.fillText(label.toUpperCase(), centerX, y);
  
  // Color dots with better design
  const dotSize = 36;
  const spacing = 20;
  const totalWidth = colors.length * dotSize + (colors.length - 1) * spacing;
  const startX = centerX - totalWidth / 2;
  
  colors.forEach((_, index) => {
    const x = startX + index * (dotSize + spacing) + dotSize / 2;
    
    // Placeholder color for lips with better variety
    const lipColors = ['#E8747C', '#E89B97', '#D4736E', '#C96169'];
    
    // Shadow for dots
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;
    
    ctx.fillStyle = lipColors[index] || '#E8747C';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y + 35, dotSize / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
  });
}

function drawStyleTip(
  ctx: CanvasRenderingContext2D,
  tip: string,
  centerX: number,
  y: number,
  season: SeasonType
) {
  const boxWidth = 700;
  const boxHeight = 80;
  const x = centerX - boxWidth / 2;
  
  // Background with gradient
  const gradient = ctx.createLinearGradient(x, y, x + boxWidth, y);
  gradient.addColorStop(0, MOBILE_GRADIENTS[season].card[1]);
  gradient.addColorStop(0.5, '#FFFFFF');
  gradient.addColorStop(1, MOBILE_GRADIENTS[season].card[1]);
  
  ctx.fillStyle = gradient;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  // @ts-expect-error - roundRect is not in TypeScript definitions yet
  ctx.roundRect(x, y, boxWidth, boxHeight, 16);
  ctx.fill();
  ctx.stroke();
  
  // Quote marks
  ctx.font = '32px Georgia, serif';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
  ctx.textAlign = 'center';
  ctx.fillText('"', x + 40, y + 40);
  ctx.fillText('"', x + boxWidth - 40, y + 40);
  
  // Text - ensure it's in English
  ctx.font = 'italic 20px Georgia, serif';
  ctx.fillStyle = '#2D3436';
  ctx.fillText(tip.toUpperCase(), centerX, y + boxHeight / 2 + 8);
}

function drawMobileFooter(
  ctx: CanvasRenderingContext2D,
  instagramId: string,
  width: number,
  y: number
) {
  // Divider line
  drawDivider(ctx, width / 2 - 150, y - 20, 300);
  
  // Instagram handle
  ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#2D3436';
  ctx.textAlign = 'center';
  ctx.fillText(`@${instagramId}`, width / 2, y + 10);
  
  // Service name
  ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#9B59B6';
  ctx.fillText('🧕 Noor.AI - Personal Color Analysis', width / 2, y + 45);
  
  // Website URL
  ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#636E72';
  ctx.fillText('www.noor.ai', width / 2, y + 70);
}