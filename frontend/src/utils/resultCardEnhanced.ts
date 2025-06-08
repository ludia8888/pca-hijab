import type { PersonalColorResult } from '@/types';
import { SEASON_DESCRIPTIONS } from './constants';
import { SEASON_COLORS } from './colorData';
import { SEASON_DATA, SEASON_GRADIENTS, type SeasonType } from './seasonData';

// Enhanced result card generator with multiple pages/layouts
export const generateEnhancedResultCard = async (
  result: PersonalColorResult,
  instagramId: string,
  pageType: 'main' | 'colors' | 'makeup' | 'lifestyle' = 'main'
): Promise<Blob[]> => {
  const cards: Blob[] = [];
  
  // Generate main card
  if (pageType === 'main' || pageType === 'colors') {
    const mainCard = await generateMainCard(result, instagramId);
    cards.push(mainCard);
  }
  
  // Generate color detail card
  if (pageType === 'colors') {
    const colorCard = await generateColorDetailCard(result, instagramId);
    cards.push(colorCard);
  }
  
  // Generate makeup card
  if (pageType === 'makeup') {
    const makeupCard = await generateMakeupCard(result, instagramId);
    cards.push(makeupCard);
  }
  
  // Generate lifestyle card
  if (pageType === 'lifestyle') {
    const lifestyleCard = await generateLifestyleCard(result, instagramId);
    cards.push(lifestyleCard);
  }
  
  return cards;
};

// Main result card with overview
async function generateMainCard(
  result: PersonalColorResult,
  instagramId: string
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error('Failed to create canvas context');
  
  // Instagram story dimensions
  const width = 1080;
  const height = 1920;
  canvas.width = width;
  canvas.height = height;
  
  const seasonKey = getSeasonKey(result.personal_color_en) as SeasonType;
  const seasonInfo = SEASON_DESCRIPTIONS[seasonKey];
  const seasonData = SEASON_DATA[seasonKey];
  const gradientColors = SEASON_GRADIENTS[seasonKey];
  
  // Aesthetic gradient background
  const gradient = ctx.createRadialGradient(
    width / 2, height / 3, 0,
    width / 2, height / 3, height
  );
  gradient.addColorStop(0, gradientColors[0]);
  gradient.addColorStop(0.6, gradientColors[1]);
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0.8)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Decorative elements
  drawFloralPattern(ctx, width, height, seasonKey);
  
  // Main content card
  const cardMargin = 60;
  const cardY = 300;
  const cardHeight = 1400;
  
  // Card with glassmorphism effect
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.filter = 'blur(0.5px)';
  drawRoundedRect(ctx, cardMargin, cardY, width - cardMargin * 2, cardHeight, 40);
  ctx.filter = 'none';
  
  // Season illustration
  drawSeasonIllustration(ctx, width / 2, cardY + 150, seasonKey);
  
  // Season name with decorative frame
  ctx.font = 'bold 56px Playfair Display';
  ctx.fillStyle = '#2D2D2D';
  ctx.textAlign = 'center';
  ctx.fillText(seasonInfo.en.toUpperCase(), width / 2, cardY + 350);
  
  // Subtitle
  ctx.font = '24px Noto Sans';
  ctx.fillStyle = '#666666';
  ctx.fillText('Personal Color Analysis', width / 2, cardY + 390);
  
  // Keywords in elegant boxes
  const keywordY = cardY + 480;
  drawKeywordBoxes(ctx, seasonData.keywords, keywordY, width, gradientColors);
  
  // Best colors preview
  const colorsY = keywordY + 180;
  drawColorPalette(ctx, SEASON_COLORS[seasonKey].bestColors.slice(0, 5), colorsY, width);
  
  // Signature style description
  const styleY = colorsY + 200;
  ctx.font = 'italic 22px Playfair Display';
  ctx.fillStyle = '#555555';
  wrapText(ctx, seasonData.atmosphere, width / 2, styleY, width - 160, 32);
  
  // Footer
  drawFooter(ctx, instagramId, width, height);
  
  return canvasToBlob(canvas);
}

// Color detail card
async function generateColorDetailCard(
  result: PersonalColorResult,
  instagramId: string
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error('Failed to create canvas context');
  
  canvas.width = 1080;
  canvas.height = 1920;
  
  const seasonKey = getSeasonKey(result.personal_color_en) as SeasonType;
  const seasonColors = SEASON_COLORS[seasonKey];
  const gradientColors = SEASON_GRADIENTS[seasonKey];
  
  // Background
  drawGradientBackground(ctx, canvas.width, canvas.height, gradientColors);
  
  // Title
  ctx.font = 'bold 48px Playfair Display';
  ctx.fillStyle = '#2D2D2D';
  ctx.textAlign = 'center';
  ctx.fillText('Your Color Palette', canvas.width / 2, 150);
  
  // Best colors grid
  drawDetailedColorGrid(ctx, seasonColors.bestColors, 250, canvas.width);
  
  // Colors to avoid
  const avoidY = 1200;
  ctx.font = '32px Playfair Display';
  ctx.fillStyle = '#666666';
  ctx.fillText('Colors to Avoid', canvas.width / 2, avoidY);
  
  drawAvoidColors(ctx, seasonColors.worstColors, avoidY + 60, canvas.width);
  
  // Footer
  drawFooter(ctx, instagramId, canvas.width, canvas.height);
  
  return canvasToBlob(canvas);
}

// Makeup recommendations card
async function generateMakeupCard(
  result: PersonalColorResult,
  instagramId: string
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error('Failed to create canvas context');
  
  canvas.width = 1080;
  canvas.height = 1920;
  
  const seasonKey = getSeasonKey(result.personal_color_en) as SeasonType;
  const seasonData = SEASON_DATA[seasonKey];
  const gradientColors = SEASON_GRADIENTS[seasonKey];
  
  // Background
  drawGradientBackground(ctx, canvas.width, canvas.height, gradientColors);
  
  // Title
  ctx.font = 'bold 48px Playfair Display';
  ctx.fillStyle = '#2D2D2D';
  ctx.textAlign = 'center';
  ctx.fillText('Makeup Guide', canvas.width / 2, 150);
  
  // Makeup sections
  drawMakeupSection(ctx, 'Foundation', seasonData.makeupColors.foundation, 300, canvas.width);
  drawMakeupColorSection(ctx, 'Lip Colors', seasonData.makeupColors.lips, 500, canvas.width);
  drawMakeupColorSection(ctx, 'Eye Shadow', seasonData.makeupColors.eyeShadow, 800, canvas.width);
  drawMakeupColorSection(ctx, 'Blush', seasonData.makeupColors.blush, 1100, canvas.width);
  
  // Celebrity references
  drawCelebritySection(ctx, seasonData.celebrities, 1400, canvas.width);
  
  // Footer
  drawFooter(ctx, instagramId, canvas.width, canvas.height);
  
  return canvasToBlob(canvas);
}

// Lifestyle recommendations card
async function generateLifestyleCard(
  result: PersonalColorResult,
  instagramId: string
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error('Failed to create canvas context');
  
  canvas.width = 1080;
  canvas.height = 1920;
  
  const seasonKey = getSeasonKey(result.personal_color_en) as SeasonType;
  const seasonData = SEASON_DATA[seasonKey];
  const gradientColors = SEASON_GRADIENTS[seasonKey];
  
  // Background
  drawGradientBackground(ctx, canvas.width, canvas.height, gradientColors);
  
  // Title
  ctx.font = 'bold 48px Playfair Display';
  ctx.fillStyle = '#2D2D2D';
  ctx.textAlign = 'center';
  ctx.fillText('Lifestyle Guide', canvas.width / 2, 150);
  
  // Perfume section
  drawPerfumeSection(ctx, seasonData.perfumeNotes, 300, canvas.width);
  
  // Jewelry section
  drawJewelrySection(ctx, seasonData.accessories, 700, canvas.width);
  
  // Style tips
  drawStyleTips(ctx, seasonKey, 1000, canvas.width);
  
  // Footer
  drawFooter(ctx, instagramId, canvas.width, canvas.height);
  
  return canvasToBlob(canvas);
}

// Helper functions
function getSeasonKey(personalColorEn: string): keyof typeof SEASON_DESCRIPTIONS {
  const seasonMap: Record<string, keyof typeof SEASON_DESCRIPTIONS> = {
    'Spring Warm': 'spring',
    'Summer Cool': 'summer',
    'Autumn Warm': 'autumn',
    'Winter Cool': 'winter'
  };
  
  return seasonMap[personalColorEn] || 'spring';
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fill();
}

function drawGradientBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colors: string[]
) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, colors[0]);
  gradient.addColorStop(1, colors[1]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawFloralPattern(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  season: SeasonType
) {
  // Add subtle decorative elements based on season
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  
  const patterns = {
    spring: '🌸',
    summer: '🌿',
    autumn: '🍂',
    winter: '❄️'
  };
  
  for (let i = 0; i < 8; i++) {
    ctx.font = '48px Arial';
    ctx.fillText(
      patterns[season],
      Math.random() * width,
      Math.random() * height
    );
  }
}

function drawSeasonIllustration(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  season: SeasonType
) {
  const icons = {
    spring: '🌷',
    summer: '🌊',
    autumn: '🍁',
    winter: '❄️'
  };
  
  ctx.font = '120px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(icons[season], x, y);
}

function drawKeywordBoxes(
  ctx: CanvasRenderingContext2D,
  keywords: string[],
  y: number,
  width: number,
  colors: string[]
) {
  const boxWidth = 200;
  const boxHeight = 50;
  const spacing = 20;
  const startX = (width - (3 * boxWidth + 2 * spacing)) / 2;
  
  keywords.forEach((keyword, index) => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    const x = startX + col * (boxWidth + spacing);
    const boxY = y + row * (boxHeight + spacing);
    
    // Gradient box
    const gradient = ctx.createLinearGradient(x, boxY, x + boxWidth, boxY + boxHeight);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);
    ctx.fillStyle = gradient;
    drawRoundedRect(ctx, x, boxY, boxWidth, boxHeight, 25);
    
    // Text
    ctx.font = '20px Noto Sans';
    ctx.fillStyle = '#4A4A4A';
    ctx.textAlign = 'center';
    ctx.fillText(keyword, x + boxWidth / 2, boxY + 32);
  });
}

function drawColorPalette(
  ctx: CanvasRenderingContext2D,
  colors: Array<{hex: string; name: string}>,
  y: number,
  width: number
) {
  const swatchSize = 140;
  const spacing = 25;
  const totalWidth = colors.length * swatchSize + (colors.length - 1) * spacing;
  const startX = (width - totalWidth) / 2;
  
  colors.forEach((color, index) => {
    const x = startX + index * (swatchSize + spacing);
    
    // Shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 5;
    
    // Color swatch
    ctx.fillStyle = color.hex;
    drawRoundedRect(ctx, x, y, swatchSize, swatchSize, 20);
    
    ctx.shadowColor = 'transparent';
    
    // Color name
    ctx.font = '16px Noto Sans';
    ctx.fillStyle = '#666666';
    ctx.textAlign = 'center';
    ctx.fillText(color.name, x + swatchSize / 2, y + swatchSize + 30);
  });
}

function drawFooter(
  ctx: CanvasRenderingContext2D,
  instagramId: string,
  width: number,
  height: number
) {
  // Instagram handle
  ctx.font = '24px Noto Sans';
  ctx.fillStyle = '#888888';
  ctx.textAlign = 'center';
  ctx.fillText(`@${instagramId}`, width / 2, height - 100);
  
  // Service name
  ctx.font = 'bold 28px Playfair Display';
  ctx.fillStyle = '#666666';
  ctx.fillText('Hijab Personal Color AI', width / 2, height - 60);
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  
  ctx.textAlign = 'center';
  
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
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to generate image'));
      }
    }, 'image/jpeg', 0.95);
  });
}

// Additional helper functions for specific sections
function drawDetailedColorGrid(
  ctx: CanvasRenderingContext2D,
  colors: Array<{hex: string; name: string; description: string}>,
  y: number,
  width: number
) {
  const cardWidth = 300;
  const cardHeight = 180;
  const spacing = 30;
  const cardsPerRow = 3;
  
  colors.forEach((color, index) => {
    const row = Math.floor(index / cardsPerRow);
    const col = index % cardsPerRow;
    const x = (width - (cardsPerRow * cardWidth + (cardsPerRow - 1) * spacing)) / 2 + col * (cardWidth + spacing);
    const cardY = y + row * (cardHeight + spacing);
    
    // Card background
    ctx.fillStyle = 'white';
    drawRoundedRect(ctx, x, cardY, cardWidth, cardHeight, 15);
    
    // Color swatch
    ctx.fillStyle = color.hex;
    drawRoundedRect(ctx, x + 20, cardY + 20, 60, 60, 10);
    
    // Color info
    ctx.font = 'bold 18px Noto Sans';
    ctx.fillStyle = '#333333';
    ctx.textAlign = 'left';
    ctx.fillText(color.name, x + 100, cardY + 45);
    
    ctx.font = '14px Noto Sans';
    ctx.fillStyle = '#666666';
    wrapText(ctx, color.description, x + 100, cardY + 70, 180, 20);
  });
}

function drawAvoidColors(
  ctx: CanvasRenderingContext2D,
  colors: Array<{hex: string; name: string}>,
  y: number,
  width: number
) {
  const swatchSize = 80;
  const spacing = 20;
  const totalWidth = colors.length * swatchSize + (colors.length - 1) * spacing;
  const startX = (width - totalWidth) / 2;
  
  colors.forEach((color, index) => {
    const x = startX + index * (swatchSize + spacing);
    
    // Gray overlay effect
    ctx.fillStyle = color.hex;
    drawRoundedRect(ctx, x, y, swatchSize, swatchSize, 15);
    
    // Cross mark
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 20, y + 20);
    ctx.lineTo(x + swatchSize - 20, y + swatchSize - 20);
    ctx.moveTo(x + swatchSize - 20, y + 20);
    ctx.lineTo(x + 20, y + swatchSize - 20);
    ctx.stroke();
    
    // Name
    ctx.font = '14px Noto Sans';
    ctx.fillStyle = '#888888';
    ctx.textAlign = 'center';
    ctx.fillText(color.name, x + swatchSize / 2, y + swatchSize + 25);
  });
}

function drawMakeupSection(
  ctx: CanvasRenderingContext2D,
  title: string,
  content: string,
  y: number,
  width: number
) {
  ctx.font = 'bold 24px Playfair Display';
  ctx.fillStyle = '#444444';
  ctx.textAlign = 'center';
  ctx.fillText(title, width / 2, y);
  
  ctx.font = '18px Noto Sans';
  ctx.fillStyle = '#666666';
  ctx.fillText(content, width / 2, y + 35);
}

function drawMakeupColorSection(
  ctx: CanvasRenderingContext2D,
  title: string,
  colors: string[],
  y: number,
  width: number
) {
  ctx.font = 'bold 24px Playfair Display';
  ctx.fillStyle = '#444444';
  ctx.textAlign = 'center';
  ctx.fillText(title, width / 2, y);
  
  const chipWidth = 150;
  const chipHeight = 40;
  const spacing = 15;
  const startX = (width - (colors.length * chipWidth + (colors.length - 1) * spacing)) / 2;
  
  colors.forEach((color, index) => {
    const x = startX + index * (chipWidth + spacing);
    
    // Color chip
    ctx.fillStyle = '#FFE0E0'; // Placeholder color
    drawRoundedRect(ctx, x, y + 40, chipWidth, chipHeight, 20);
    
    // Label
    ctx.font = '14px Noto Sans';
    ctx.fillStyle = '#555555';
    ctx.textAlign = 'center';
    ctx.fillText(color, x + chipWidth / 2, y + 65);
  });
}

function drawCelebritySection(
  ctx: CanvasRenderingContext2D,
  celebrities: string[],
  y: number,
  width: number
) {
  ctx.font = 'bold 20px Playfair Display';
  ctx.fillStyle = '#444444';
  ctx.textAlign = 'center';
  ctx.fillText('Celebrity References', width / 2, y);
  
  ctx.font = '16px Noto Sans';
  ctx.fillStyle = '#666666';
  ctx.fillText(celebrities.join(' • '), width / 2, y + 35);
}

function drawPerfumeSection(
  ctx: CanvasRenderingContext2D,
  perfumeData: any,
  y: number,
  width: number
) {
  // Perfume family
  ctx.font = 'bold 28px Playfair Display';
  ctx.fillStyle = '#444444';
  ctx.textAlign = 'center';
  ctx.fillText('Signature Scent', width / 2, y);
  
  ctx.font = '22px Noto Sans';
  ctx.fillStyle = '#666666';
  ctx.fillText(perfumeData.family, width / 2, y + 40);
  
  // Notes
  ctx.font = '18px Noto Sans';
  ctx.fillStyle = '#888888';
  ctx.fillText('Notes: ' + perfumeData.notes.join(' • '), width / 2, y + 80);
  
  // Recommendations
  ctx.font = 'bold 20px Playfair Display';
  ctx.fillText('Recommended Perfumes', width / 2, y + 140);
  
  perfumeData.recommendations.forEach((perfume: string, index: number) => {
    ctx.font = '16px Noto Sans';
    ctx.fillStyle = '#666666';
    ctx.fillText(perfume, width / 2, y + 180 + index * 30);
  });
}

function drawJewelrySection(
  ctx: CanvasRenderingContext2D,
  accessoryData: any,
  y: number,
  width: number
) {
  ctx.font = 'bold 28px Playfair Display';
  ctx.fillStyle = '#444444';
  ctx.textAlign = 'center';
  ctx.fillText('Jewelry & Accessories', width / 2, y);
  
  // Metal preference visual
  const metalColors = {
    gold: '#FFD700',
    silver: '#C0C0C0',
    'rose-gold': '#E8B4B8'
  };
  
  ctx.fillStyle = metalColors[accessoryData.metal];
  ctx.beginPath();
  ctx.arc(width / 2, y + 80, 40, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.font = '20px Noto Sans';
  ctx.fillStyle = '#666666';
  ctx.fillText(accessoryData.metal.replace('-', ' ').toUpperCase(), width / 2, y + 140);
  
  ctx.font = '18px Noto Sans';
  ctx.fillText(accessoryData.style, width / 2, y + 170);
}

function drawStyleTips(
  ctx: CanvasRenderingContext2D,
  season: SeasonType,
  y: number,
  width: number
) {
  const tips = {
    spring: [
      'Choose bright, clear colors',
      'Avoid muted or dusty tones',
      'Mix warm neutrals with pops of color'
    ],
    summer: [
      'Opt for soft, muted shades',
      'Layer cool-toned neutrals',
      'Add subtle color accents'
    ],
    autumn: [
      'Embrace rich, earthy tones',
      'Mix textures and patterns',
      'Choose warm metallic accents'
    ],
    winter: [
      'Go for high contrast looks',
      'Choose pure, saturated colors',
      'Add dramatic black or white'
    ]
  };
  
  ctx.font = 'bold 24px Playfair Display';
  ctx.fillStyle = '#444444';
  ctx.textAlign = 'center';
  ctx.fillText('Styling Tips', width / 2, y);
  
  tips[season].forEach((tip, index) => {
    ctx.font = '18px Noto Sans';
    ctx.fillStyle = '#666666';
    ctx.fillText(`• ${tip}`, width / 2, y + 50 + index * 35);
  });
}