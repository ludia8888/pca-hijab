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

// Modern Korean aesthetic color schemes
const MODERN_THEMES: Record<SeasonType, {
  background: string[];
  card: string;
  accent: string;
  text: { primary: string; secondary: string; muted: string };
  shadow: string;
}> = {
  spring: {
    background: ['#FFF5F7', '#FFE8EC', '#FFF0F3'],
    card: '#FFFFFF',
    accent: '#FF6B9D',
    text: { primary: '#2D2D2D', secondary: '#666666', muted: '#999999' },
    shadow: 'rgba(255, 107, 157, 0.08)'
  },
  summer: {
    background: ['#F5F3FF', '#EDE8FF', '#F8F5FF'],
    card: '#FFFFFF',
    accent: '#9F8FEF',
    text: { primary: '#2D2D2D', secondary: '#666666', muted: '#999999' },
    shadow: 'rgba(159, 143, 239, 0.08)'
  },
  autumn: {
    background: ['#FFF8F3', '#FFEDE1', '#FFF5ED'],
    card: '#FFFFFF',
    accent: '#FF8547',
    text: { primary: '#2D2D2D', secondary: '#666666', muted: '#999999' },
    shadow: 'rgba(255, 133, 71, 0.08)'
  },
  winter: {
    background: ['#F3F8FF', '#E8F2FF', '#F0F6FF'],
    card: '#FFFFFF',
    accent: '#4A90E2',
    text: { primary: '#2D2D2D', secondary: '#666666', muted: '#999999' },
    shadow: 'rgba(74, 144, 226, 0.08)'
  }
};

/**
 * Generates a sophisticated Korean-style result card with rich content
 */
export const generateKoreanStyleCard = async (
  result: PersonalColorResult,
  instagramId: string
): Promise<Blob> => {
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
  const theme = MODERN_THEMES[seasonKey];
  
  // Draw sophisticated background
  drawModernBackground(ctx, width, height, theme);
  
  // Calculate layout sections
  const sections = calculateSections(height);
  
  // Draw each section with rich content
  await drawHeaderSection(ctx, width, sections.header, seasonKey, seasonInfo, theme);
  await drawPersonalInfoSection(ctx, width, sections.personalInfo, seasonData, theme);
  await drawColorPaletteSection(ctx, width, sections.colorPalette, seasonColors, theme);
  await drawMakeupSection(ctx, width, sections.makeup, seasonData, theme);
  await drawStyleSection(ctx, width, sections.style, seasonData, theme);
  await drawAccessorySection(ctx, width, sections.accessory, seasonData, theme);
  await drawCelebritySection(ctx, width, sections.celebrity, seasonData, theme);
  await drawFooterSection(ctx, width, sections.footer, instagramId, theme);
  
  // Convert to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to generate image'));
      }
    }, 'image/jpeg', 0.98);
  });
};

// Calculate section positions to prevent overlap
function calculateSections(totalHeight: number) {
  const margin = 40;
  const spacing = 30;
  
  return {
    header: { y: margin, height: 280 },
    personalInfo: { y: margin + 280 + spacing, height: 140 },
    colorPalette: { y: margin + 280 + 140 + spacing * 2, height: 320 },
    makeup: { y: margin + 280 + 140 + 320 + spacing * 3, height: 240 },
    style: { y: margin + 280 + 140 + 320 + 240 + spacing * 4, height: 180 },
    accessory: { y: margin + 280 + 140 + 320 + 240 + 180 + spacing * 5, height: 160 },
    celebrity: { y: margin + 280 + 140 + 320 + 240 + 180 + 160 + spacing * 6, height: 140 },
    footer: { y: totalHeight - 160, height: 120 }
  };
}

// Modern minimalist background
function drawModernBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  theme: typeof MODERN_THEMES[SeasonType]
) {
  // Soft gradient background
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  theme.background.forEach((color, i) => {
    gradient.addColorStop(i / (theme.background.length - 1), color);
  });
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Subtle geometric pattern
  ctx.globalAlpha = 0.03;
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 1;
  
  // Draw diagonal lines
  for (let i = -height; i < width; i += 100) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + height, height);
    ctx.stroke();
  }
  
  ctx.globalAlpha = 1;
}

// Sophisticated header section
async function drawHeaderSection(
  ctx: CanvasRenderingContext2D,
  width: number,
  section: { y: number; height: number },
  seasonKey: SeasonType,
  seasonInfo: typeof SEASON_DESCRIPTIONS[SeasonType],
  theme: typeof MODERN_THEMES[SeasonType]
) {
  const cardMargin = 30;
  const cardWidth = width - cardMargin * 2;
  
  // Card with subtle shadow
  drawCard(ctx, cardMargin, section.y, cardWidth, section.height, theme);
  
  // Content
  let currentY = section.y + 60;
  
  // Brand mark
  ctx.font = '16px -apple-system, "Helvetica Neue", sans-serif';
  ctx.fillStyle = theme.text.muted;
  ctx.textAlign = 'center';
  ctx.letterSpacing = '2px';
  ctx.fillText('NOOR.AI × PERSONAL COLOR ANALYSIS', width / 2, currentY);
  
  currentY += 50;
  
  // Season type with elegant typography
  ctx.font = 'bold 48px -apple-system, "Helvetica Neue", sans-serif';
  ctx.fillStyle = theme.accent;
  ctx.textAlign = 'center';
  ctx.fillText(seasonInfo.en.toUpperCase(), width / 2, currentY);
  
  currentY += 40;
  
  // Korean name
  ctx.font = '24px -apple-system, "Helvetica Neue", sans-serif';
  ctx.fillStyle = theme.text.secondary;
  ctx.fillText(seasonInfo.ko, width / 2, currentY);
  
  currentY += 45;
  
  // Description
  ctx.font = '18px -apple-system, "Helvetica Neue", sans-serif';
  ctx.fillStyle = theme.text.secondary;
  const lines = wrapText(ctx, seasonInfo.description, cardWidth - 100);
  lines.forEach((line, i) => {
    ctx.fillText(line, width / 2, currentY + i * 25);
  });
}

// Personal characteristics section
async function drawPersonalInfoSection(
  ctx: CanvasRenderingContext2D,
  width: number,
  section: { y: number; height: number },
  seasonData: typeof SEASON_DATA[SeasonType],
  theme: typeof MODERN_THEMES[SeasonType]
) {
  const cardMargin = 30;
  const cardWidth = width - cardMargin * 2;
  
  drawCard(ctx, cardMargin, section.y, cardWidth, section.height, theme);
  
  // Keywords as elegant tags
  const tagY = section.y + 50;
  const tags = seasonData.keywords.map(k => k.toUpperCase());
  
  // Title
  ctx.font = '14px -apple-system, "Helvetica Neue", sans-serif';
  ctx.fillStyle = theme.text.muted;
  ctx.textAlign = 'center';
  ctx.letterSpacing = '1px';
  ctx.fillText('YOUR CHARACTERISTICS', width / 2, tagY - 20);
  
  // Draw tags in a row
  drawElegantTags(ctx, tags, width / 2, tagY + 20, theme);
  
  // Atmosphere quote
  const quoteY = tagY + 70;
  ctx.font = 'italic 20px Georgia, serif';
  ctx.fillStyle = theme.text.primary;
  ctx.textAlign = 'center';
  ctx.fillText(`"${seasonData.atmosphere}"`, width / 2, quoteY);
}

// Color palette section with all colors
async function drawColorPaletteSection(
  ctx: CanvasRenderingContext2D,
  width: number,
  section: { y: number; height: number },
  seasonColors: typeof SEASON_COLORS[SeasonType],
  theme: typeof MODERN_THEMES[SeasonType]
) {
  const cardMargin = 30;
  const cardWidth = width - cardMargin * 2;
  
  drawCard(ctx, cardMargin, section.y, cardWidth, section.height, theme);
  
  let currentY = section.y + 40;
  
  // Title
  ctx.font = '14px -apple-system, "Helvetica Neue", sans-serif';
  ctx.fillStyle = theme.text.muted;
  ctx.textAlign = 'center';
  ctx.letterSpacing = '1px';
  ctx.fillText('YOUR PERFECT COLORS', width / 2, currentY);
  
  currentY += 40;
  
  // Best colors
  drawColorRow(ctx, seasonColors.bestColors, cardMargin + 60, currentY, cardWidth - 120, 'BEST', theme);
  
  currentY += 140;
  
  // Worst colors
  drawColorRow(ctx, seasonColors.worstColors, cardMargin + 60, currentY, cardWidth - 120, 'AVOID', theme);
}

// Makeup recommendations section
async function drawMakeupSection(
  ctx: CanvasRenderingContext2D,
  width: number,
  section: { y: number; height: number },
  seasonData: typeof SEASON_DATA[SeasonType],
  theme: typeof MODERN_THEMES[SeasonType]
) {
  const cardMargin = 30;
  const cardWidth = width - cardMargin * 2;
  
  drawCard(ctx, cardMargin, section.y, cardWidth, section.height, theme);
  
  let currentY = section.y + 40;
  
  // Title
  ctx.font = '14px -apple-system, "Helvetica Neue", sans-serif';
  ctx.fillStyle = theme.text.muted;
  ctx.textAlign = 'center';
  ctx.letterSpacing = '1px';
  ctx.fillText('MAKEUP PALETTE', width / 2, currentY);
  
  currentY += 50;
  
  // Foundation recommendation
  ctx.font = '16px -apple-system, "Helvetica Neue", sans-serif';
  ctx.fillStyle = theme.text.secondary;
  ctx.textAlign = 'center';
  ctx.fillText(`Foundation: ${seasonData.makeupColors.foundation}`, width / 2, currentY);
  
  currentY += 40;
  
  // Lip colors
  drawMakeupColors(ctx, seasonData.makeupColors.lips, width / 2, currentY, 'LIPS', theme);
  
  currentY += 80;
  
  // Blush colors
  drawMakeupColors(ctx, seasonData.makeupColors.blush, width / 2, currentY, 'BLUSH', theme);
}

// Style tips section
async function drawStyleSection(
  ctx: CanvasRenderingContext2D,
  width: number,
  section: { y: number; height: number },
  seasonData: typeof SEASON_DATA[SeasonType],
  theme: typeof MODERN_THEMES[SeasonType]
) {
  const cardMargin = 30;
  const cardWidth = width - cardMargin * 2;
  
  drawCard(ctx, cardMargin, section.y, cardWidth, section.height, theme);
  
  let currentY = section.y + 40;
  
  // Title
  ctx.font = '14px -apple-system, "Helvetica Neue", sans-serif';
  ctx.fillStyle = theme.text.muted;
  ctx.textAlign = 'center';
  ctx.letterSpacing = '1px';
  ctx.fillText('STYLE GUIDE', width / 2, currentY);
  
  currentY += 40;
  
  // Style tips based on season
  const tips = getStyleTips(getSeasonFromData(seasonData));
  
  ctx.font = '16px -apple-system, "Helvetica Neue", sans-serif';
  ctx.fillStyle = theme.text.secondary;
  ctx.textAlign = 'left';
  
  tips.forEach((tip, i) => {
    ctx.fillText(`• ${tip}`, cardMargin + 60, currentY + i * 30);
  });
}

// Accessory recommendations section
async function drawAccessorySection(
  ctx: CanvasRenderingContext2D,
  width: number,
  section: { y: number; height: number },
  seasonData: typeof SEASON_DATA[SeasonType],
  theme: typeof MODERN_THEMES[SeasonType]
) {
  const cardMargin = 30;
  const cardWidth = width - cardMargin * 2;
  
  drawCard(ctx, cardMargin, section.y, cardWidth, section.height, theme);
  
  let currentY = section.y + 40;
  
  // Title
  ctx.font = '14px -apple-system, "Helvetica Neue", sans-serif';
  ctx.fillStyle = theme.text.muted;
  ctx.textAlign = 'center';
  ctx.letterSpacing = '1px';
  ctx.fillText('ACCESSORIES', width / 2, currentY);
  
  currentY += 40;
  
  // Metal preference
  ctx.font = '18px -apple-system, "Helvetica Neue", sans-serif';
  ctx.fillStyle = theme.text.primary;
  ctx.textAlign = 'center';
  ctx.fillText(`Best Metal: ${seasonData.accessories.metal.toUpperCase()}`, width / 2, currentY);
  
  currentY += 35;
  
  // Style description
  ctx.font = '16px -apple-system, "Helvetica Neue", sans-serif';
  ctx.fillStyle = theme.text.secondary;
  const accessoryLines = wrapText(ctx, seasonData.accessories.style, cardWidth - 120);
  accessoryLines.forEach((line, i) => {
    ctx.fillText(line, width / 2, currentY + i * 25);
  });
}

// Celebrity reference section
async function drawCelebritySection(
  ctx: CanvasRenderingContext2D,
  width: number,
  section: { y: number; height: number },
  seasonData: typeof SEASON_DATA[SeasonType],
  theme: typeof MODERN_THEMES[SeasonType]
) {
  const cardMargin = 30;
  const cardWidth = width - cardMargin * 2;
  
  drawCard(ctx, cardMargin, section.y, cardWidth, section.height, theme);
  
  let currentY = section.y + 40;
  
  // Title
  ctx.font = '14px -apple-system, "Helvetica Neue", sans-serif';
  ctx.fillStyle = theme.text.muted;
  ctx.textAlign = 'center';
  ctx.letterSpacing = '1px';
  ctx.fillText('CELEBRITY REFERENCES', width / 2, currentY);
  
  currentY += 40;
  
  // Celebrity names
  ctx.font = '18px -apple-system, "Helvetica Neue", sans-serif';
  ctx.fillStyle = theme.text.primary;
  ctx.textAlign = 'center';
  ctx.fillText(seasonData.celebrities.join(' • '), width / 2, currentY);
}

// Footer section
async function drawFooterSection(
  ctx: CanvasRenderingContext2D,
  width: number,
  section: { y: number; height: number },
  instagramId: string,
  theme: typeof MODERN_THEMES[SeasonType]
) {
  let currentY = section.y + 30;
  
  // Instagram handle
  ctx.font = '20px -apple-system, "Helvetica Neue", sans-serif';
  ctx.fillStyle = theme.text.primary;
  ctx.textAlign = 'center';
  ctx.fillText(`@${instagramId}`, width / 2, currentY);
  
  currentY += 35;
  
  // Brand
  ctx.font = '16px -apple-system, "Helvetica Neue", sans-serif';
  ctx.fillStyle = theme.accent;
  ctx.fillText('Noor.AI', width / 2, currentY);
  
  currentY += 25;
  
  // URL
  ctx.font = '14px -apple-system, "Helvetica Neue", sans-serif';
  ctx.fillStyle = theme.text.muted;
  ctx.fillText('www.noor.ai', width / 2, currentY);
}

// Helper functions

function drawCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  theme: typeof MODERN_THEMES[SeasonType]
) {
  // Shadow
  ctx.save();
  ctx.shadowColor = theme.shadow;
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 8;
  
  // Card background
  ctx.fillStyle = theme.card;
  ctx.beginPath();
  // @ts-expect-error - roundRect is supported via polyfill
  ctx.roundRect(x, y, width, height, 20);
  ctx.fill();
  
  ctx.restore();
}

function drawElegantTags(
  ctx: CanvasRenderingContext2D,
  tags: string[],
  centerX: number,
  y: number,
  theme: typeof MODERN_THEMES[SeasonType]
) {
  const tagHeight = 36;
  const padding = 24;
  const spacing = 12;
  
  // Calculate positions
  ctx.font = '14px -apple-system, "Helvetica Neue", sans-serif';
  const positions: Array<{ text: string; width: number; x: number }> = [];
  let totalWidth = 0;
  
  tags.forEach((tag, i) => {
    const width = ctx.measureText(tag).width + padding * 2;
    positions.push({ text: tag, width, x: totalWidth });
    totalWidth += width + (i < tags.length - 1 ? spacing : 0);
  });
  
  const startX = centerX - totalWidth / 2;
  
  // Draw tags
  positions.forEach(({ text, width, x }) => {
    const tagX = startX + x;
    
    // Tag background
    ctx.fillStyle = `${theme.accent}15`;
    ctx.beginPath();
    // @ts-expect-error - roundRect is supported via polyfill
    ctx.roundRect(tagX, y, width, tagHeight, tagHeight / 2);
    ctx.fill();
    
    // Tag border
    ctx.strokeStyle = `${theme.accent}30`;
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Tag text
    ctx.fillStyle = theme.accent;
    ctx.textAlign = 'center';
    ctx.fillText(text, tagX + width / 2, y + tagHeight / 2 + 5);
  });
}

function drawColorRow(
  ctx: CanvasRenderingContext2D,
  colors: Array<{ hex: string; name: string }>,
  x: number,
  y: number,
  width: number,
  label: string,
  theme: typeof MODERN_THEMES[SeasonType]
) {
  // Label
  ctx.font = '12px -apple-system, "Helvetica Neue", sans-serif';
  ctx.fillStyle = theme.text.muted;
  ctx.textAlign = 'left';
  ctx.letterSpacing = '1px';
  ctx.fillText(label, x, y - 10);
  
  // Color swatches
  const swatchSize = 60;
  const spacing = 16;
  const swatchesPerRow = 4;
  
  colors.forEach((color, i) => {
    const col = i % swatchesPerRow;
    const row = Math.floor(i / swatchesPerRow);
    const swatchX = x + col * (swatchSize + spacing);
    const swatchY = y + row * (swatchSize + 40);
    
    // Swatch with border
    ctx.fillStyle = color.hex;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    // @ts-expect-error - roundRect is supported via polyfill
    ctx.roundRect(swatchX, swatchY, swatchSize, swatchSize, 12);
    ctx.fill();
    ctx.stroke();
    
    // Color name
    ctx.font = '11px -apple-system, "Helvetica Neue", sans-serif';
    ctx.fillStyle = theme.text.secondary;
    ctx.textAlign = 'center';
    ctx.fillText(color.name.toUpperCase(), swatchX + swatchSize / 2, swatchY + swatchSize + 20);
  });
}

function drawMakeupColors(
  ctx: CanvasRenderingContext2D,
  colors: string[],
  centerX: number,
  y: number,
  label: string,
  theme: typeof MODERN_THEMES[SeasonType]
) {
  // Label
  ctx.font = '12px -apple-system, "Helvetica Neue", sans-serif';
  ctx.fillStyle = theme.text.muted;
  ctx.textAlign = 'center';
  ctx.letterSpacing = '1px';
  ctx.fillText(label, centerX, y - 10);
  
  // Color dots
  const dotSize = 32;
  const spacing = 20;
  const totalWidth = colors.length * dotSize + (colors.length - 1) * spacing;
  const startX = centerX - totalWidth / 2;
  
  // Predefined makeup colors for visualization
  const makeupPalettes = {
    lips: ['#E8747C', '#E89B97', '#D4736E', '#C96169', '#B85A61'],
    blush: ['#FFB5BA', '#FFC4C4', '#FFAAAA']
  };
  
  const palette = label === 'LIPS' ? makeupPalettes.lips : makeupPalettes.blush;
  
  colors.forEach((_, i) => {
    const x = startX + i * (dotSize + spacing) + dotSize / 2;
    
    // Outer ring
    ctx.strokeStyle = `${palette[i] || palette[0]}30`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x, y + 20, dotSize / 2 + 2, 0, Math.PI * 2);
    ctx.stroke();
    
    // Inner color
    ctx.fillStyle = palette[i] || palette[0];
    ctx.beginPath();
    ctx.arc(x, y + 20, dotSize / 2, 0, Math.PI * 2);
    ctx.fill();
  });
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  words.forEach(word => {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}

function getSeasonFromData(seasonData: typeof SEASON_DATA[SeasonType]): SeasonType {
  // Identify season from data
  if (seasonData.keywords.includes('bright')) return 'spring';
  if (seasonData.keywords.includes('soft')) return 'summer';
  if (seasonData.keywords.includes('warm')) return 'autumn';
  return 'winter';
}

function getStyleTips(season: SeasonType): string[] {
  const tips = {
    spring: [
      'Choose bright, clear colors with warm undertones',
      'Mix pastels with vibrant accent colors',
      'Opt for lightweight, flowing fabrics'
    ],
    summer: [
      'Select soft, muted colors with cool undertones',
      'Layer different shades of the same color family',
      'Choose materials with subtle textures'
    ],
    autumn: [
      'Embrace rich, earthy tones and warm hues',
      'Mix textures like suede, wool, and leather',
      'Add metallic accents in gold or bronze'
    ],
    winter: [
      'Go for high contrast and bold color combinations',
      'Choose pure, saturated colors or stark neutrals',
      'Opt for sleek, structured silhouettes'
    ]
  };
  
  return tips[season];
}