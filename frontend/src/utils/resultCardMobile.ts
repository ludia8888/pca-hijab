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

// Mobile-optimized gradient backgrounds
const MOBILE_GRADIENTS: Record<SeasonType, { bg: string[], card: string[] }> = {
  spring: {
    bg: ['#FFF5F5', '#FFE0EC', '#FFDAB9'], // Soft pink to peach
    card: ['#FFFFFF', '#FFF9FC']
  },
  summer: {
    bg: ['#F8F5FF', '#E6D7FF', '#E4D4F4'], // Soft lavender
    card: ['#FFFFFF', '#FAFAFF']
  },
  autumn: {
    bg: ['#FFF8F0', '#FFE5D0', '#FFDAB9'], // Warm beige to apricot
    card: ['#FFFFFF', '#FFFAF6']
  },
  winter: {
    bg: ['#F5F8FF', '#E8EFFF', '#DDE6FF'], // Cool blue tones
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
  
  // Header section
  let currentY = cardY + 60;
  
  // Season emoji and result
  ctx.font = '64px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(SEASON_EMOJIS[seasonKey], width / 2, currentY);
  
  currentY += 70;
  
  // Season name
  ctx.font = 'bold 42px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#2D3436';
  ctx.textAlign = 'center';
  ctx.fillText(seasonInfo.en.toUpperCase(), width / 2, currentY);
  
  currentY += 45;
  
  // Korean name
  ctx.font = '28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#636E72';
  ctx.fillText(seasonInfo.ko, width / 2, currentY);
  
  currentY += 60;
  
  // Divider line
  drawDivider(ctx, width / 2 - 100, currentY, 200);
  currentY += 40;
  
  // Keywords section
  drawKeywordTags(ctx, seasonData.keywords, width / 2, currentY, seasonKey);
  currentY += 100;
  
  // Best colors section
  ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#2D3436';
  ctx.textAlign = 'center';
  ctx.fillText('YOUR BEST HIJAB COLORS', width / 2, currentY);
  
  currentY += 50;
  
  // Color palette
  drawMobileColorPalette(ctx, seasonColors.bestColors.slice(0, 6), width / 2, currentY);
  currentY += 180;
  
  // Makeup colors section
  ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#2D3436';
  ctx.fillText('MAKEUP PALETTE', width / 2, currentY);
  
  currentY += 40;
  
  // Lip colors
  drawMakeupRecommendations(ctx, seasonData.makeupColors.lips.slice(0, 4), width / 2, currentY, 'Lips');
  currentY += 80;
  
  // Style tip
  drawStyleTip(ctx, seasonData.atmosphere, width / 2, currentY, seasonKey);
  currentY += 100;
  
  // Footer section
  drawMobileFooter(ctx, instagramId, width, cardY + cardHeight - 80);
  
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
  const tagHeight = 36;
  const padding = 24;
  const spacing = 12;
  
  // Calculate positions
  const positions: Array<{ keyword: string; width: number; x: number }> = [];
  let currentX = 0;
  
  ctx.font = '18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  
  keywords.forEach((keyword) => {
    const width = ctx.measureText(keyword).width + padding * 2;
    positions.push({ keyword, width, x: currentX });
    currentX += width + spacing;
  });
  
  // Center align
  const totalWidth = currentX - spacing;
  const startX = centerX - totalWidth / 2;
  
  // Draw tags
  positions.forEach(({ keyword, width, x }) => {
    const tagX = startX + x;
    
    // Tag background
    const tagColor = MOBILE_GRADIENTS[season].card[1];
    ctx.fillStyle = tagColor;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 1;
    
    ctx.beginPath();
    // @ts-expect-error - roundRect is not in TypeScript definitions yet
    ctx.roundRect(tagX, y, width, tagHeight, tagHeight / 2);
    ctx.fill();
    ctx.stroke();
    
    // Tag text
    ctx.fillStyle = '#636E72';
    ctx.textAlign = 'center';
    ctx.fillText(keyword, tagX + width / 2, y + tagHeight / 2 + 6);
  });
}

function drawMobileColorPalette(
  ctx: CanvasRenderingContext2D,
  colors: Array<{hex: string; name: string}>,
  centerX: number,
  y: number
) {
  const swatchSize = 72;
  const spacing = 16;
  const totalWidth = 3 * swatchSize + 2 * spacing;
  const startX = centerX - totalWidth / 2;
  
  colors.forEach((color, index) => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    const x = startX + col * (swatchSize + spacing);
    const swatchY = y + row * (swatchSize + spacing + 30);
    
    // Shadow for swatch
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;
    
    // Color swatch
    ctx.fillStyle = color.hex;
    ctx.beginPath();
    // @ts-expect-error - roundRect is not in TypeScript definitions yet
    ctx.roundRect(x, swatchY, swatchSize, swatchSize, 12);
    ctx.fill();
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    
    // Color name
    ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#636E72';
    ctx.textAlign = 'center';
    ctx.fillText(color.name, x + swatchSize / 2, swatchY + swatchSize + 20);
  });
}

function drawMakeupRecommendations(
  ctx: CanvasRenderingContext2D,
  colors: string[],
  centerX: number,
  y: number,
  label: string
) {
  // Label
  ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#636E72';
  ctx.textAlign = 'center';
  ctx.fillText(label, centerX, y);
  
  // Color dots
  const dotSize = 28;
  const spacing = 16;
  const totalWidth = colors.length * dotSize + (colors.length - 1) * spacing;
  const startX = centerX - totalWidth / 2;
  
  colors.forEach((_, index) => {
    const x = startX + index * (dotSize + spacing) + dotSize / 2;
    
    // Placeholder color for lips
    const lipColors = ['#E8747C', '#E89B97', '#D4736E', '#C96169'];
    
    ctx.fillStyle = lipColors[index] || '#E8747C';
    ctx.beginPath();
    ctx.arc(x, y + 30, dotSize / 2, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawStyleTip(
  ctx: CanvasRenderingContext2D,
  tip: string,
  centerX: number,
  y: number,
  season: SeasonType
) {
  const boxWidth = 600;
  const boxHeight = 60;
  const x = centerX - boxWidth / 2;
  
  // Background
  ctx.fillStyle = MOBILE_GRADIENTS[season].card[1];
  ctx.beginPath();
  // @ts-expect-error - roundRect is not in TypeScript definitions yet
  ctx.roundRect(x, y, boxWidth, boxHeight, 12);
  ctx.fill();
  
  // Quote marks
  ctx.font = '24px Georgia, serif';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.textAlign = 'center';
  ctx.fillText('"', x + 30, y + 35);
  ctx.fillText('"', x + boxWidth - 30, y + 35);
  
  // Text
  ctx.font = 'italic 18px Georgia, serif';
  ctx.fillStyle = '#636E72';
  ctx.fillText(tip, centerX, y + boxHeight / 2 + 6);
}

function drawMobileFooter(
  ctx: CanvasRenderingContext2D,
  instagramId: string,
  width: number,
  y: number
) {
  // Instagram handle
  ctx.font = '20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#636E72';
  ctx.textAlign = 'center';
  ctx.fillText(`@${instagramId}`, width / 2, y);
  
  // Service name with icon
  ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#2D3436';
  ctx.fillText('🧕 Hijab Personal Color AI', width / 2, y + 35);
}