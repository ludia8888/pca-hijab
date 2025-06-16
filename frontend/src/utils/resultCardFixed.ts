import type { PersonalColorResult } from '@/types';
import { SEASON_DESCRIPTIONS } from './constants';
import { SEASON_COLORS } from './colorData';
import { SEASON_DATA, type SeasonType } from './seasonData';
import { setupCanvasPolyfill } from './canvasPolyfill';

// Setup polyfill
setupCanvasPolyfill();

// Canvas dimensions
const CANVAS = {
  width: 1080,
  height: 1920,
  margin: 40,
  cardMargin: 30,
  cardPadding: 35
};

// Fixed layout positions
const LAYOUT = {
  // Header section
  header: {
    y: 50,
    height: 280,
    brand: { y: 70, font: '16px -apple-system, sans-serif' },
    season: { y: 130, font: 'bold 48px -apple-system, sans-serif' },
    subtitle: { y: 175, font: '22px -apple-system, sans-serif' },
    description: { y: 210, font: '17px -apple-system, sans-serif', maxLines: 2 }
  },
  
  // Characteristics section
  characteristics: {
    y: 350,
    height: 200,
    title: { y: 370, font: '15px -apple-system, sans-serif' },
    keywords: { y: 410, height: 40 },
    quote: { y: 480, font: 'italic 20px Georgia, serif' }
  },
  
  // Color palette section
  colors: {
    y: 570,
    height: 320,
    title: { y: 590, font: '15px -apple-system, sans-serif' },
    best: {
      label: { y: 625, font: '14px -apple-system, sans-serif' },
      grid: { y: 655, swatchSize: 55, spacing: 18, nameFont: '12px -apple-system, sans-serif' }
    },
    avoid: {
      label: { y: 765, font: '14px -apple-system, sans-serif' },
      grid: { y: 795, swatchSize: 55, spacing: 18, nameFont: '12px -apple-system, sans-serif' }
    }
  },
  
  // Makeup section
  makeup: {
    y: 910,
    height: 220,
    title: { y: 930, font: '15px -apple-system, sans-serif' },
    foundation: { y: 970, font: '17px -apple-system, sans-serif' },
    lips: { y: 1010, dotSize: 30, spacing: 20 },
    blush: { y: 1070, dotSize: 30, spacing: 20 }
  },
  
  // Style tips section
  style: {
    y: 1150,
    height: 200,
    title: { y: 1170, font: '15px -apple-system, sans-serif' },
    tips: { y: 1210, font: '16px -apple-system, sans-serif', lineHeight: 28, maxLines: 3 }
  },
  
  // Accessories section
  accessories: {
    y: 1370,
    height: 180,
    title: { y: 1390, font: '15px -apple-system, sans-serif' },
    metal: { y: 1430, font: '20px -apple-system, sans-serif' },
    style: { y: 1470, font: '16px -apple-system, sans-serif', maxLines: 2 }
  },
  
  // Celebrity section
  celebrity: {
    y: 1570,
    height: 120,
    title: { y: 1590, font: '15px -apple-system, sans-serif' },
    names: { y: 1630, font: '18px -apple-system, sans-serif' }
  },
  
  // Footer
  footer: {
    instagram: { y: 1770, font: '24px -apple-system, sans-serif' },
    brand: { y: 1810, font: '20px -apple-system, sans-serif' },
    website: { y: 1845, font: '16px -apple-system, sans-serif' }
  }
};

// Theme configuration
const THEMES: Record<SeasonType, {
  background: string[];
  card: string;
  accent: string;
  text: { primary: string; secondary: string; muted: string };
}> = {
  spring: {
    background: ['#FFF5F7', '#FFE8EC', '#FFF0F3'],
    card: '#FFFFFF',
    accent: '#FF6B9D',
    text: { primary: '#2D2D2D', secondary: '#666666', muted: '#999999' }
  },
  summer: {
    background: ['#F5F3FF', '#EDE8FF', '#F8F5FF'],
    card: '#FFFFFF',
    accent: '#9F8FEF',
    text: { primary: '#2D2D2D', secondary: '#666666', muted: '#999999' }
  },
  autumn: {
    background: ['#FFF8F3', '#FFEDE1', '#FFF5ED'],
    card: '#FFFFFF',
    accent: '#FF8547',
    text: { primary: '#2D2D2D', secondary: '#666666', muted: '#999999' }
  },
  winter: {
    background: ['#F3F8FF', '#E8F2FF', '#F0F6FF'],
    card: '#FFFFFF',
    accent: '#4A90E2',
    text: { primary: '#2D2D2D', secondary: '#666666', muted: '#999999' }
  }
};

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

// Text helper functions
function truncateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  const ellipsis = '...';
  let truncated = text;
  
  while (ctx.measureText(truncated).width > maxWidth && truncated.length > 0) {
    truncated = truncated.slice(0, -1);
  }
  
  if (truncated !== text) {
    truncated = truncated.slice(0, -3) + ellipsis;
  }
  
  return truncated;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
      
      if (lines.length >= maxLines) {
        break;
      }
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }
  
  // Truncate last line if needed
  if (lines.length === maxLines && currentLine && !lines.includes(currentLine)) {
    lines[maxLines - 1] = truncateText(ctx, lines[maxLines - 1] + '...', maxWidth);
  }
  
  return lines;
}

// Drawing functions
function drawBackground(
  ctx: CanvasRenderingContext2D,
  theme: typeof THEMES[SeasonType]
) {
  const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS.height);
  theme.background.forEach((color, i) => {
    gradient.addColorStop(i / (theme.background.length - 1), color);
  });
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS.width, CANVAS.height);
}

function drawCard(
  ctx: CanvasRenderingContext2D,
  y: number,
  height: number,
  theme: typeof THEMES[SeasonType]
) {
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.06)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 5;
  
  ctx.fillStyle = theme.card;
  ctx.beginPath();
  // @ts-expect-error - roundRect is supported via polyfill
  ctx.roundRect(CANVAS.cardMargin, y, CANVAS.width - CANVAS.cardMargin * 2, height, 20);
  ctx.fill();
  
  ctx.restore();
}

function drawCenteredText(
  ctx: CanvasRenderingContext2D,
  text: string,
  y: number,
  font: string,
  color: string
) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.fillText(text, CANVAS.width / 2, y);
}

function drawKeywordTags(
  ctx: CanvasRenderingContext2D,
  keywords: string[],
  y: number,
  theme: typeof THEMES[SeasonType]
) {
  // Limit to 3 keywords to prevent overflow
  const tags = keywords.slice(0, 3).map(k => k.toUpperCase());
  const tagHeight = 36;
  const padding = 24;
  const spacing = 12;
  
  ctx.font = '15px -apple-system, sans-serif';
  let totalWidth = 0;
  const measurements = tags.map((tag, i) => {
    const width = ctx.measureText(tag).width + padding * 2;
    const x = totalWidth;
    totalWidth += width + (i < tags.length - 1 ? spacing : 0);
    return { tag, width, x };
  });
  
  const startX = (CANVAS.width - totalWidth) / 2;
  
  measurements.forEach(({ tag, width, x }) => {
    const tagX = startX + x;
    
    ctx.fillStyle = `${theme.accent}15`;
    ctx.beginPath();
    // @ts-expect-error - roundRect is supported
    ctx.roundRect(tagX, y, width, tagHeight, tagHeight / 2);
    ctx.fill();
    
    ctx.strokeStyle = `${theme.accent}30`;
    ctx.lineWidth = 1;
    ctx.stroke();
    
    ctx.fillStyle = theme.accent;
    ctx.textAlign = 'center';
    ctx.fillText(tag, tagX + width / 2, y + tagHeight / 2 + 5);
  });
}

function drawColorSwatch(
  ctx: CanvasRenderingContext2D,
  color: { hex: string; name: string },
  x: number,
  y: number,
  size: number,
  nameFont: string,
  theme: typeof THEMES[SeasonType]
) {
  // Draw swatch
  ctx.fillStyle = color.hex;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  // @ts-expect-error - roundRect is supported
  ctx.roundRect(x, y, size, size, 10);
  ctx.fill();
  ctx.stroke();
  
  // Draw name (truncated if needed)
  ctx.font = nameFont;
  ctx.fillStyle = theme.text.secondary;
  ctx.textAlign = 'center';
  const name = truncateText(ctx, color.name.toUpperCase(), size + 10);
  ctx.fillText(name, x + size / 2, y + size + 18);
}

function drawMakeupDots(
  ctx: CanvasRenderingContext2D,
  colors: string[],
  y: number,
  label: string,
  dotSize: number,
  spacing: number,
  theme: typeof THEMES[SeasonType]
) {
  // Limit to 5 dots maximum
  const colorCount = Math.min(colors.length, 5);
  const totalWidth = colorCount * dotSize + (colorCount - 1) * spacing;
  const startX = (CANVAS.width - totalWidth) / 2;
  
  // Draw label
  ctx.font = '14px -apple-system, sans-serif';
  ctx.fillStyle = theme.text.muted;
  ctx.textAlign = 'center';
  ctx.fillText(label, CANVAS.width / 2, y);
  
  const palette = label === 'LIPS' 
    ? ['#E8747C', '#E89B97', '#D4736E', '#C96169', '#B85A61']
    : ['#FFB5BA', '#FFC4C4', '#FFAAAA', '#FFB0B0', '#FFA8A8'];
  
  for (let i = 0; i < colorCount; i++) {
    const x = startX + i * (dotSize + spacing) + dotSize / 2;
    const dotY = y + 25;
    
    ctx.fillStyle = palette[i % palette.length];
    ctx.beginPath();
    ctx.arc(x, dotY, dotSize / 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Generate a fixed-layout result card
 */
export const generateFixedCard = async (
  result: PersonalColorResult,
  instagramId: string
): Promise<Blob> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Failed to create canvas context');
  }

  canvas.width = CANVAS.width;
  canvas.height = CANVAS.height;

  // Get season info
  const seasonKey = getSeasonKey(result.personal_color_en) as SeasonType;
  const seasonInfo = SEASON_DESCRIPTIONS[seasonKey];
  const seasonData = SEASON_DATA[seasonKey];
  const seasonColors = SEASON_COLORS[seasonKey];
  const theme = THEMES[seasonKey];
  
  // Draw background
  drawBackground(ctx, theme);
  
  // 1. Header Section
  drawCard(ctx, LAYOUT.header.y, LAYOUT.header.height, theme);
  
  drawCenteredText(
    ctx,
    'NOOR.AI × PERSONAL COLOR ANALYSIS',
    LAYOUT.header.brand.y,
    LAYOUT.header.brand.font,
    theme.text.muted
  );
  
  drawCenteredText(
    ctx,
    seasonInfo.en.toUpperCase(),
    LAYOUT.header.season.y,
    LAYOUT.header.season.font,
    theme.accent
  );
  
  const subtitles = {
    spring: 'WARM & BRIGHT',
    summer: 'COOL & SOFT',
    autumn: 'WARM & DEEP',
    winter: 'COOL & CLEAR'
  };
  
  drawCenteredText(
    ctx,
    subtitles[seasonKey],
    LAYOUT.header.subtitle.y,
    LAYOUT.header.subtitle.font,
    theme.text.secondary
  );
  
  // Description (wrapped)
  ctx.font = LAYOUT.header.description.font;
  const descLines = wrapText(
    ctx,
    seasonInfo.description,
    CANVAS.width - 120,
    LAYOUT.header.description.maxLines
  );
  descLines.forEach((line, i) => {
    drawCenteredText(
      ctx,
      line,
      LAYOUT.header.description.y + i * 25,
      LAYOUT.header.description.font,
      theme.text.secondary
    );
  });
  
  // 2. Characteristics Section
  drawCard(ctx, LAYOUT.characteristics.y, LAYOUT.characteristics.height, theme);
  
  drawCenteredText(
    ctx,
    'YOUR CHARACTERISTICS',
    LAYOUT.characteristics.title.y,
    LAYOUT.characteristics.title.font,
    theme.text.muted
  );
  
  drawKeywordTags(ctx, seasonData.keywords, LAYOUT.characteristics.keywords.y, theme);
  
  drawCenteredText(
    ctx,
    `"${truncateText(ctx, seasonData.atmosphere.toUpperCase(), CANVAS.width - 120)}"`,
    LAYOUT.characteristics.quote.y,
    LAYOUT.characteristics.quote.font,
    theme.text.primary
  );
  
  // 3. Color Palette Section
  drawCard(ctx, LAYOUT.colors.y, LAYOUT.colors.height, theme);
  
  drawCenteredText(
    ctx,
    'YOUR PERFECT COLORS',
    LAYOUT.colors.title.y,
    LAYOUT.colors.title.font,
    theme.text.muted
  );
  
  // Best colors
  drawCenteredText(
    ctx,
    'BEST',
    LAYOUT.colors.best.label.y,
    LAYOUT.colors.best.label.font,
    theme.text.muted
  );
  
  const bestColors = seasonColors.bestColors.slice(0, 4); // Limit to 4
  const bestTotalWidth = 4 * LAYOUT.colors.best.grid.swatchSize + 3 * LAYOUT.colors.best.grid.spacing;
  const bestStartX = (CANVAS.width - bestTotalWidth) / 2;
  
  bestColors.forEach((color, i) => {
    const x = bestStartX + i * (LAYOUT.colors.best.grid.swatchSize + LAYOUT.colors.best.grid.spacing);
    drawColorSwatch(
      ctx,
      color,
      x,
      LAYOUT.colors.best.grid.y,
      LAYOUT.colors.best.grid.swatchSize,
      LAYOUT.colors.best.grid.nameFont,
      theme
    );
  });
  
  // Avoid colors
  drawCenteredText(
    ctx,
    'AVOID',
    LAYOUT.colors.avoid.label.y,
    LAYOUT.colors.avoid.label.font,
    theme.text.muted
  );
  
  const avoidColors = seasonColors.worstColors.slice(0, 4); // Limit to 4
  const avoidTotalWidth = 4 * LAYOUT.colors.avoid.grid.swatchSize + 3 * LAYOUT.colors.avoid.grid.spacing;
  const avoidStartX = (CANVAS.width - avoidTotalWidth) / 2;
  
  avoidColors.forEach((color, i) => {
    const x = avoidStartX + i * (LAYOUT.colors.avoid.grid.swatchSize + LAYOUT.colors.avoid.grid.spacing);
    drawColorSwatch(
      ctx,
      color,
      x,
      LAYOUT.colors.avoid.grid.y,
      LAYOUT.colors.avoid.grid.swatchSize,
      LAYOUT.colors.avoid.grid.nameFont,
      theme
    );
  });
  
  // 4. Makeup Section
  drawCard(ctx, LAYOUT.makeup.y, LAYOUT.makeup.height, theme);
  
  drawCenteredText(
    ctx,
    'MAKEUP PALETTE',
    LAYOUT.makeup.title.y,
    LAYOUT.makeup.title.font,
    theme.text.muted
  );
  
  drawCenteredText(
    ctx,
    `Foundation: ${seasonData.makeupColors.foundation}`,
    LAYOUT.makeup.foundation.y,
    LAYOUT.makeup.foundation.font,
    theme.text.secondary
  );
  
  drawMakeupDots(
    ctx,
    seasonData.makeupColors.lips,
    LAYOUT.makeup.lips.y,
    'LIPS',
    LAYOUT.makeup.lips.dotSize,
    LAYOUT.makeup.lips.spacing,
    theme
  );
  
  drawMakeupDots(
    ctx,
    seasonData.makeupColors.blush,
    LAYOUT.makeup.blush.y,
    'BLUSH',
    LAYOUT.makeup.blush.dotSize,
    LAYOUT.makeup.blush.spacing,
    theme
  );
  
  // 5. Style Tips Section
  drawCard(ctx, LAYOUT.style.y, LAYOUT.style.height, theme);
  
  drawCenteredText(
    ctx,
    'STYLE GUIDE',
    LAYOUT.style.title.y,
    LAYOUT.style.title.font,
    theme.text.muted
  );
  
  const tips = getStyleTips(seasonKey);
  tips.slice(0, LAYOUT.style.tips.maxLines).forEach((tip, i) => {
    const wrappedTip = truncateText(ctx, `• ${tip}`, CANVAS.width - 100);
    drawCenteredText(
      ctx,
      wrappedTip,
      LAYOUT.style.tips.y + i * LAYOUT.style.tips.lineHeight,
      LAYOUT.style.tips.font,
      theme.text.secondary
    );
  });
  
  // 6. Accessories Section
  drawCard(ctx, LAYOUT.accessories.y, LAYOUT.accessories.height, theme);
  
  drawCenteredText(
    ctx,
    'ACCESSORIES',
    LAYOUT.accessories.title.y,
    LAYOUT.accessories.title.font,
    theme.text.muted
  );
  
  drawCenteredText(
    ctx,
    `Best Metal: ${seasonData.accessories.metal.toUpperCase()}`,
    LAYOUT.accessories.metal.y,
    LAYOUT.accessories.metal.font,
    theme.text.primary
  );
  
  ctx.font = LAYOUT.accessories.style.font;
  const styleLines = wrapText(
    ctx,
    seasonData.accessories.style,
    CANVAS.width - 100,
    LAYOUT.accessories.style.maxLines
  );
  styleLines.forEach((line, i) => {
    drawCenteredText(
      ctx,
      line,
      LAYOUT.accessories.style.y + i * 25,
      LAYOUT.accessories.style.font,
      theme.text.secondary
    );
  });
  
  // 7. Celebrity Section
  drawCard(ctx, LAYOUT.celebrity.y, LAYOUT.celebrity.height, theme);
  
  drawCenteredText(
    ctx,
    'CELEBRITY REFERENCES',
    LAYOUT.celebrity.title.y,
    LAYOUT.celebrity.title.font,
    theme.text.muted
  );
  
  const celebNames = seasonData.celebrities.slice(0, 3).join(' • ');
  drawCenteredText(
    ctx,
    truncateText(ctx, celebNames, CANVAS.width - 80),
    LAYOUT.celebrity.names.y,
    LAYOUT.celebrity.names.font,
    theme.text.primary
  );
  
  // 8. Footer
  drawCenteredText(
    ctx,
    `@${instagramId}`,
    LAYOUT.footer.instagram.y,
    LAYOUT.footer.instagram.font,
    theme.text.primary
  );
  
  drawCenteredText(
    ctx,
    'Noor.AI',
    LAYOUT.footer.brand.y,
    LAYOUT.footer.brand.font,
    theme.accent
  );
  
  drawCenteredText(
    ctx,
    'www.noor.ai',
    LAYOUT.footer.website.y,
    LAYOUT.footer.website.font,
    theme.text.muted
  );
  
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