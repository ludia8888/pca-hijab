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
 * Generates a sophisticated Korean-style result card with rich content (ALL ENGLISH)
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

// Calculate section positions to prevent overlap - VERIFIED LAYOUT
function calculateSections(totalHeight: number) {
  const topMargin = 50;
  const spacing = 20;
  
  // Reduced heights to fit in 1920px
  const sections = {
    header: { y: topMargin, height: 280 },
    personalInfo: { y: 0, height: 140 },
    colorPalette: { y: 0, height: 340 },
    makeup: { y: 0, height: 240 },
    style: { y: 0, height: 180 },
    accessory: { y: 0, height: 160 },
    celebrity: { y: 0, height: 100 },
    footer: { y: 0, height: 120 }
  };
  
  // Calculate cumulative positions
  let currentY = topMargin;
  
  // Header: 50 to 330
  currentY += sections.header.height + spacing;
  sections.personalInfo.y = currentY; // 350
  
  // PersonalInfo: 350 to 490
  currentY += sections.personalInfo.height + spacing;
  sections.colorPalette.y = currentY; // 510
  
  // ColorPalette: 510 to 850
  currentY += sections.colorPalette.height + spacing;
  sections.makeup.y = currentY; // 870
  
  // Makeup: 870 to 1110
  currentY += sections.makeup.height + spacing;
  sections.style.y = currentY; // 1130
  
  // Style: 1130 to 1310
  currentY += sections.style.height + spacing;
  sections.accessory.y = currentY; // 1330
  
  // Accessory: 1330 to 1490
  currentY += sections.accessory.height + spacing;
  sections.celebrity.y = currentY; // 1510
  
  // Celebrity: 1510 to 1610
  // Footer: 1780 to 1900 (leaving 20px bottom margin)
  sections.footer.y = totalHeight - sections.footer.height - 20;
  
  // Verify no overlap
  const celebrityEnd = sections.celebrity.y + sections.celebrity.height;
  const footerStart = sections.footer.y;
  
  if (celebrityEnd > footerStart) {
    console.error('Layout overlap detected!');
  }
  
  return sections;
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
  
  // Content - CENTERED LAYOUT
  let currentY = section.y + 50;
  
  // Brand mark
  ctx.font = '18px -apple-system, "Helvetica Neue", sans-serif';
  ctx.fillStyle = theme.text.muted;
  ctx.textAlign = 'center';
  ctx.fillText('NOOR.AI × PERSONAL COLOR ANALYSIS', width / 2, currentY);
  
  currentY += 55;
  
  // Season type
  ctx.font = 'bold 52px -apple-system, "Helvetica Neue", sans-serif';
  ctx.fillStyle = theme.accent;
  ctx.textAlign = 'center';
  ctx.fillText(seasonInfo.en.toUpperCase(), width / 2, currentY);
  
  currentY += 45;
  
  // Season subtitle
  ctx.font = '24px -apple-system, "Helvetica Neue", sans-serif';
  ctx.fillStyle = theme.text.secondary;
  ctx.textAlign = 'center';
  const subtitles = {
    spring: 'WARM & BRIGHT',
    summer: 'COOL & SOFT', 
    autumn: 'WARM & DEEP',
    winter: 'COOL & CLEAR'
  };
  ctx.fillText(subtitles[seasonKey], width / 2, currentY);
  
  currentY += 45;
  
  // Description
  ctx.font = '19px -apple-system, "Helvetica Neue", sans-serif';
  ctx.fillStyle = theme.text.secondary;
  ctx.textAlign = 'center';
  const lines = wrapText(ctx, seasonInfo.description, cardWidth - 60);
  lines.forEach((line, i) => {
    ctx.fillText(line, width / 2, currentY + i * 28);
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
  
  // CENTERED CONTENT
  const centerY = section.y + section.height / 2;
  
  // Title
  ctx.font = '16px -apple-system, "Helvetica Neue", sans-serif';
  ctx.fillStyle = theme.text.muted;
  ctx.textAlign = 'center';
  ctx.fillText('YOUR CHARACTERISTICS', width / 2, centerY - 55);
  
  // Keywords as tags
  const tags = seasonData.keywords.map(k => k.toUpperCase());
  drawElegantTags(ctx, tags, width / 2, centerY - 20, theme);
  
  // Atmosphere quote
  ctx.font = 'italic 21px Georgia, serif';
  ctx.fillStyle = theme.text.primary;
  ctx.textAlign = 'center';
  ctx.fillText(`"${seasonData.atmosphere.toUpperCase()}"`, width / 2, centerY + 40);
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
  
  let currentY = section.y + 35;
  
  // Title
  ctx.font = '16px -apple-system, "Helvetica Neue", sans-serif';
  ctx.fillStyle = theme.text.muted;
  ctx.textAlign = 'center';
  ctx.fillText('YOUR PERFECT COLORS', width / 2, currentY);
  
  currentY += 45;
  
  // Best colors - FULLY CENTERED
  drawColorRow(ctx, seasonColors.bestColors, 0, currentY, width, 'BEST', theme, width);
  
  currentY += 150;
  
  // Worst colors - FULLY CENTERED
  drawColorRow(ctx, seasonColors.worstColors, 0, currentY, width, 'AVOID', theme, width);
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
  
  // Title - MOBILE SIZE
  ctx.font = '16px -apple-system, "Helvetica Neue", sans-serif';
  ctx.fillStyle = theme.text.muted;
  ctx.textAlign = 'center';
  ctx.fillText('MAKEUP PALETTE', width / 2, currentY);
  
  currentY += 50;
  
  // Foundation recommendation - MOBILE SIZE
  ctx.font = '18px -apple-system, "Helvetica Neue", sans-serif';
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
  
  let currentY = section.y + 35;
  
  // Title
  ctx.font = '16px -apple-system, "Helvetica Neue", sans-serif';
  ctx.fillStyle = theme.text.muted;
  ctx.textAlign = 'center';
  ctx.fillText('STYLE GUIDE', width / 2, currentY);
  
  currentY += 35;
  
  // Style tips - PERFECTLY CENTERED
  const tips = getStyleTips(getSeasonFromData(seasonData));
  const tipSpacing = 45;
  
  ctx.font = '17px -apple-system, "Helvetica Neue", sans-serif';
  ctx.fillStyle = theme.text.secondary;
  ctx.textAlign = 'center';
  
  tips.forEach((tip, i) => {
    const tipY = currentY + (i * tipSpacing);
    const tipLines = wrapText(ctx, tip, cardWidth - 80);
    tipLines.forEach((line, j) => {
      ctx.fillText(line, width / 2, tipY + (j * 24));
    });
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
  
  // Title - MOBILE SIZE
  ctx.font = '16px -apple-system, "Helvetica Neue", sans-serif';
  ctx.fillStyle = theme.text.muted;
  ctx.textAlign = 'center';
  ctx.fillText('ACCESSORIES', width / 2, currentY);
  
  currentY += 40;
  
  // Metal preference - MOBILE SIZE
  ctx.font = '22px -apple-system, "Helvetica Neue", sans-serif';
  ctx.fillStyle = theme.text.primary;
  ctx.textAlign = 'center';
  ctx.fillText(`Best Metal: ${seasonData.accessories.metal.toUpperCase()}`, width / 2, currentY);
  
  currentY += 40;
  
  // Style description - MOBILE SIZE
  ctx.font = '18px -apple-system, "Helvetica Neue", sans-serif';
  ctx.fillStyle = theme.text.secondary;
  ctx.textAlign = 'center';
  const accessoryLines = wrapText(ctx, seasonData.accessories.style, cardWidth - 100);
  accessoryLines.forEach((line, i) => {
    ctx.fillText(line, width / 2, currentY + i * 30);
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
  
  // Title - MOBILE SIZE
  ctx.font = '16px -apple-system, "Helvetica Neue", sans-serif';
  ctx.fillStyle = theme.text.muted;
  ctx.textAlign = 'center';
  ctx.fillText('CELEBRITY REFERENCES', width / 2, currentY);
  
  currentY += 40;
  
  // Celebrity names - MOBILE SIZE
  ctx.font = '20px -apple-system, "Helvetica Neue", sans-serif';
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
  // CENTER FOOTER CONTENT
  const centerY = section.y + section.height / 2;
  
  // Instagram handle
  ctx.font = '24px -apple-system, "Helvetica Neue", sans-serif';
  ctx.fillStyle = theme.text.primary;
  ctx.textAlign = 'center';
  ctx.fillText(`@${instagramId}`, width / 2, centerY - 25);
  
  // Brand
  ctx.font = '20px -apple-system, "Helvetica Neue", sans-serif';
  ctx.fillStyle = theme.accent;
  ctx.textAlign = 'center';
  ctx.fillText('Noor.AI', width / 2, centerY + 5);
  
  // URL
  ctx.font = '16px -apple-system, "Helvetica Neue", sans-serif';
  ctx.fillStyle = theme.text.muted;
  ctx.textAlign = 'center';
  ctx.fillText('www.noor.ai', width / 2, centerY + 30);
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
  const tagHeight = 40;
  const padding = 28;
  const spacing = 16;
  
  // Calculate positions - MOBILE SIZE
  ctx.font = '16px -apple-system, "Helvetica Neue", sans-serif';
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
  theme: typeof MODERN_THEMES[SeasonType],
  canvasWidth: number
) {
  // Label - CENTERED & MOBILE SIZE
  ctx.font = '14px -apple-system, "Helvetica Neue", sans-serif';
  ctx.fillStyle = theme.text.muted;
  ctx.textAlign = 'center';
  ctx.fillText(label, canvasWidth / 2, y - 15);
  
  // Color swatches - PERFECTLY CENTERED
  const swatchSize = 65;
  const spacing = 22;
  const swatchesPerRow = 4;
  const totalRowWidth = swatchesPerRow * swatchSize + (swatchesPerRow - 1) * spacing;
  const startX = (canvasWidth - totalRowWidth) / 2;
  
  colors.forEach((color, i) => {
    const col = i % swatchesPerRow;
    const row = Math.floor(i / swatchesPerRow);
    const swatchX = startX + col * (swatchSize + spacing);
    const swatchY = y + row * (swatchSize + 45);
    
    // Swatch with border
    ctx.fillStyle = color.hex;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    // @ts-expect-error - roundRect is supported via polyfill
    ctx.roundRect(swatchX, swatchY, swatchSize, swatchSize, 12);
    ctx.fill();
    ctx.stroke();
    
    // Color name - MOBILE SIZE
    ctx.font = '13px -apple-system, "Helvetica Neue", sans-serif';
    ctx.fillStyle = theme.text.secondary;
    ctx.textAlign = 'center';
    ctx.fillText(color.name.toUpperCase(), swatchX + swatchSize / 2, swatchY + swatchSize + 25);
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
  // Label - MOBILE SIZE
  ctx.font = '14px -apple-system, "Helvetica Neue", sans-serif';
  ctx.fillStyle = theme.text.muted;
  ctx.textAlign = 'center';
  ctx.fillText(label, centerX, y - 15);
  
  // Color dots - MOBILE SIZE
  const dotSize = 36;
  const spacing = 24;
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