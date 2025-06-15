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

// Dynamic content renderer
class DynamicCardRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private currentY: number;
  private margin: number = 30;
  private sectionSpacing: number = 25;
  private cardPadding: number = 40;
  
  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.currentY = 40; // Start position
  }
  
  // Measure text height dynamically
  private measureTextHeight(text: string, font: string, maxWidth: number): number {
    this.ctx.font = font;
    const lines = this.wrapText(text, maxWidth);
    const lineHeight = parseInt(font) * 1.4; // Standard line height
    return lines.length * lineHeight;
  }
  
  // Wrap text to fit width
  private wrapText(text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    words.forEach(word => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = this.ctx.measureText(testLine);
      
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
  
  // Draw card with dynamic height
  private drawCard(height: number, theme: typeof THEMES[SeasonType]): void {
    // Shadow
    this.ctx.save();
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.06)';
    this.ctx.shadowBlur = 20;
    this.ctx.shadowOffsetY = 5;
    
    // Card
    this.ctx.fillStyle = theme.card;
    this.ctx.beginPath();
    // @ts-expect-error - roundRect is supported via polyfill
    this.ctx.roundRect(this.margin, this.currentY, this.width - this.margin * 2, height, 20);
    this.ctx.fill();
    
    this.ctx.restore();
  }
  
  // Draw section with measured content
  public drawSection(
    content: () => number, // Returns content height
    theme: typeof THEMES[SeasonType]
  ): void {
    const startY = this.currentY;
    
    // Measure content height first
    this.ctx.save();
    const contentHeight = content() + this.cardPadding * 2;
    this.ctx.restore();
    
    // Draw card background
    this.drawCard(contentHeight, theme);
    
    // Draw content again on top of card
    this.currentY = startY + this.cardPadding;
    content();
    
    // Move to next section
    this.currentY = startY + contentHeight + this.sectionSpacing;
  }
  
  // Text rendering helpers
  public drawText(
    text: string,
    font: string,
    color: string,
    yOffset: number = 0
  ): number {
    this.ctx.font = font;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = 'center';
    this.ctx.fillText(text, this.width / 2, this.currentY + yOffset);
    return parseInt(font) * 1.4;
  }
  
  public drawWrappedText(
    text: string,
    font: string,
    color: string,
    maxWidth: number,
    yOffset: number = 0
  ): number {
    this.ctx.font = font;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = 'center';
    
    const lines = this.wrapText(text, maxWidth);
    const lineHeight = parseInt(font) * 1.4;
    
    lines.forEach((line, i) => {
      this.ctx.fillText(line, this.width / 2, this.currentY + yOffset + (i * lineHeight));
    });
    
    return lines.length * lineHeight;
  }
  
  // Get current Y position
  public getCurrentY(): number {
    return this.currentY;
  }
  
  // Set Y position
  public setY(y: number): void {
    this.currentY = y;
  }
  
  // Add spacing
  public addSpace(space: number): void {
    this.currentY += space;
  }
}

/**
 * Generates a dynamic result card with auto-layout
 */
export const generateDynamicCard = async (
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
  const theme = THEMES[seasonKey];
  
  // Draw background
  drawBackground(ctx, width, height, theme);
  
  // Create renderer
  const renderer = new DynamicCardRenderer(ctx, width, height);
  
  // Draw sections dynamically
  
  // Header Section
  renderer.drawSection(() => {
    let height = 0;
    
    // Brand
    height += renderer.drawText(
      'NOOR.AI × PERSONAL COLOR ANALYSIS',
      '18px -apple-system, sans-serif',
      theme.text.muted
    );
    
    renderer.addSpace(35);
    height += 35;
    
    // Season name
    height += renderer.drawText(
      seasonInfo.en.toUpperCase(),
      'bold 52px -apple-system, sans-serif',
      theme.accent
    );
    
    renderer.addSpace(30);
    height += 30;
    
    // Subtitle
    const subtitles = {
      spring: 'WARM & BRIGHT',
      summer: 'COOL & SOFT',
      autumn: 'WARM & DEEP',
      winter: 'COOL & CLEAR'
    };
    height += renderer.drawText(
      subtitles[seasonKey],
      '24px -apple-system, sans-serif',
      theme.text.secondary
    );
    
    renderer.addSpace(30);
    height += 30;
    
    // Description
    height += renderer.drawWrappedText(
      seasonInfo.description,
      '19px -apple-system, sans-serif',
      theme.text.secondary,
      width - 140
    );
    
    return height;
  }, theme);
  
  // Personal Characteristics
  renderer.drawSection(() => {
    let height = 0;
    
    // Title
    height += renderer.drawText(
      'YOUR CHARACTERISTICS',
      '16px -apple-system, sans-serif',
      theme.text.muted
    );
    
    renderer.addSpace(30);
    height += 30;
    
    // Keywords
    const keywords = seasonData.keywords.map(k => k.toUpperCase());
    height += drawKeywordTags(ctx, keywords, width / 2, renderer.getCurrentY(), theme);
    
    renderer.addSpace(40);
    height += 40;
    
    // Quote
    height += renderer.drawText(
      `"${seasonData.atmosphere.toUpperCase()}"`,
      'italic 21px Georgia, serif',
      theme.text.primary
    );
    
    return height;
  }, theme);
  
  // Color Palette
  renderer.drawSection(() => {
    let height = 0;
    
    // Title
    height += renderer.drawText(
      'YOUR PERFECT COLORS',
      '16px -apple-system, sans-serif',
      theme.text.muted
    );
    
    renderer.addSpace(35);
    height += 35;
    
    // Best colors
    const bestHeight = drawColorGrid(
      ctx,
      seasonColors.bestColors,
      renderer.getCurrentY(),
      'BEST',
      width,
      theme
    );
    height += bestHeight;
    
    renderer.addSpace(bestHeight + 30);
    height += 30;
    
    // Avoid colors
    const avoidHeight = drawColorGrid(
      ctx,
      seasonColors.worstColors,
      renderer.getCurrentY(),
      'AVOID',
      width,
      theme
    );
    height += avoidHeight;
    
    renderer.setY(renderer.getCurrentY() + avoidHeight);
    
    return height;
  }, theme);
  
  // Makeup Section
  renderer.drawSection(() => {
    let height = 0;
    
    // Title
    height += renderer.drawText(
      'MAKEUP PALETTE',
      '16px -apple-system, sans-serif',
      theme.text.muted
    );
    
    renderer.addSpace(35);
    height += 35;
    
    // Foundation
    height += renderer.drawText(
      `Foundation: ${seasonData.makeupColors.foundation}`,
      '18px -apple-system, sans-serif',
      theme.text.secondary
    );
    
    renderer.addSpace(35);
    height += 35;
    
    // Lip colors
    height += drawMakeupDots(
      ctx,
      seasonData.makeupColors.lips,
      width / 2,
      renderer.getCurrentY(),
      'LIPS',
      theme
    );
    
    renderer.addSpace(70);
    height += 70;
    
    // Blush
    height += drawMakeupDots(
      ctx,
      seasonData.makeupColors.blush,
      width / 2,
      renderer.getCurrentY(),
      'BLUSH',
      theme
    );
    
    renderer.addSpace(50);
    height += 50;
    
    return height;
  }, theme);
  
  // Style Tips
  renderer.drawSection(() => {
    let height = 0;
    
    // Title
    height += renderer.drawText(
      'STYLE GUIDE',
      '16px -apple-system, sans-serif',
      theme.text.muted
    );
    
    renderer.addSpace(30);
    height += 30;
    
    // Tips
    const tips = getStyleTips(seasonKey);
    tips.forEach((tip, i) => {
      if (i > 0) {
        renderer.addSpace(25);
        height += 25;
      }
      height += renderer.drawWrappedText(
        tip,
        '17px -apple-system, sans-serif',
        theme.text.secondary,
        width - 120
      );
    });
    
    return height;
  }, theme);
  
  // Accessories
  renderer.drawSection(() => {
    let height = 0;
    
    // Title
    height += renderer.drawText(
      'ACCESSORIES',
      '16px -apple-system, sans-serif',
      theme.text.muted
    );
    
    renderer.addSpace(30);
    height += 30;
    
    // Metal
    height += renderer.drawText(
      `Best Metal: ${seasonData.accessories.metal.toUpperCase()}`,
      '22px -apple-system, sans-serif',
      theme.text.primary
    );
    
    renderer.addSpace(30);
    height += 30;
    
    // Style
    height += renderer.drawWrappedText(
      seasonData.accessories.style,
      '18px -apple-system, sans-serif',
      theme.text.secondary,
      width - 120
    );
    
    return height;
  }, theme);
  
  // Celebrity References
  if (renderer.getCurrentY() < height - 250) {
    renderer.drawSection(() => {
      let h = 0;
      
      // Title
      h += renderer.drawText(
        'CELEBRITY REFERENCES',
        '16px -apple-system, sans-serif',
        theme.text.muted
      );
      
      renderer.addSpace(30);
      h += 30;
      
      // Names
      h += renderer.drawText(
        seasonData.celebrities.join(' • '),
        '20px -apple-system, sans-serif',
        theme.text.primary
      );
      
      return h;
    }, theme);
  }
  
  // Footer - Always at bottom
  const footerY = height - 140;
  ctx.font = '24px -apple-system, sans-serif';
  ctx.fillStyle = theme.text.primary;
  ctx.textAlign = 'center';
  ctx.fillText(`@${instagramId}`, width / 2, footerY);
  
  ctx.font = '20px -apple-system, sans-serif';
  ctx.fillStyle = theme.accent;
  ctx.fillText('Noor.AI', width / 2, footerY + 35);
  
  ctx.font = '16px -apple-system, sans-serif';
  ctx.fillStyle = theme.text.muted;
  ctx.fillText('www.noor.ai', width / 2, footerY + 65);
  
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

// Helper functions

function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  theme: typeof THEMES[SeasonType]
) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  theme.background.forEach((color, i) => {
    gradient.addColorStop(i / (theme.background.length - 1), color);
  });
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawKeywordTags(
  ctx: CanvasRenderingContext2D,
  tags: string[],
  centerX: number,
  y: number,
  theme: typeof THEMES[SeasonType]
): number {
  const tagHeight = 38;
  const padding = 26;
  const spacing = 14;
  
  // Measure tags
  ctx.font = '16px -apple-system, sans-serif';
  let totalWidth = 0;
  const measurements = tags.map((tag, i) => {
    const width = ctx.measureText(tag).width + padding * 2;
    const x = totalWidth;
    totalWidth += width + (i < tags.length - 1 ? spacing : 0);
    return { tag, width, x };
  });
  
  const startX = centerX - totalWidth / 2;
  
  // Draw tags
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
  
  return tagHeight;
}

function drawColorGrid(
  ctx: CanvasRenderingContext2D,
  colors: Array<{ hex: string; name: string }>,
  y: number,
  label: string,
  canvasWidth: number,
  theme: typeof THEMES[SeasonType]
): number {
  // Label
  ctx.font = '14px -apple-system, sans-serif';
  ctx.fillStyle = theme.text.muted;
  ctx.textAlign = 'center';
  ctx.fillText(label, canvasWidth / 2, y);
  
  const swatchSize = 65;
  const spacing = 20;
  const cols = 4;
  const rows = Math.ceil(colors.length / cols);
  
  const totalWidth = cols * swatchSize + (cols - 1) * spacing;
  const startX = (canvasWidth - totalWidth) / 2;
  
  colors.forEach((color, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const swatchX = startX + col * (swatchSize + spacing);
    const swatchY = y + 25 + row * (swatchSize + 45);
    
    // Swatch
    ctx.fillStyle = color.hex;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    // @ts-expect-error - roundRect is supported
    ctx.roundRect(swatchX, swatchY, swatchSize, swatchSize, 12);
    ctx.fill();
    ctx.stroke();
    
    // Name
    ctx.font = '13px -apple-system, sans-serif';
    ctx.fillStyle = theme.text.secondary;
    ctx.textAlign = 'center';
    ctx.fillText(color.name.toUpperCase(), swatchX + swatchSize / 2, swatchY + swatchSize + 22);
  });
  
  return 25 + rows * (swatchSize + 45);
}

function drawMakeupDots(
  ctx: CanvasRenderingContext2D,
  colors: string[],
  centerX: number,
  y: number,
  label: string,
  theme: typeof THEMES[SeasonType]
): number {
  // Label
  ctx.font = '14px -apple-system, sans-serif';
  ctx.fillStyle = theme.text.muted;
  ctx.textAlign = 'center';
  ctx.fillText(label, centerX, y);
  
  const dotSize = 34;
  const spacing = 22;
  const totalWidth = colors.length * dotSize + (colors.length - 1) * spacing;
  const startX = centerX - totalWidth / 2;
  
  const palette = label === 'LIPS' 
    ? ['#E8747C', '#E89B97', '#D4736E', '#C96169', '#B85A61']
    : ['#FFB5BA', '#FFC4C4', '#FFAAAA'];
  
  colors.forEach((_, i) => {
    const x = startX + i * (dotSize + spacing) + dotSize / 2;
    
    ctx.strokeStyle = `${palette[i] || palette[0]}30`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y + 25, dotSize / 2 + 2, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.fillStyle = palette[i] || palette[0];
    ctx.beginPath();
    ctx.arc(x, y + 25, dotSize / 2, 0, Math.PI * 2);
    ctx.fill();
  });
  
  return 50;
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