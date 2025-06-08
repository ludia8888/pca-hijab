import type { PersonalColorResult } from '@/types';
import { SEASON_DESCRIPTIONS } from './constants';
import { SEASON_COLORS } from './colorData';

/**
 * Generates a result card image for sharing
 * @param result - Personal color analysis result
 * @param instagramId - User's Instagram ID
 * @returns Promise<Blob> - Generated image as blob
 */
export const generateResultCard = async (
  result: PersonalColorResult,
  instagramId: string
): Promise<Blob> => {
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
  const seasonInfo = SEASON_DESCRIPTIONS[result.personal_color_en] || {
    ko: result.personal_color,
    en: result.personal_color_en,
    description: '당신만의 특별한 색감'
  };

  // Get colors
  const seasonColors = SEASON_COLORS[result.personal_color_en] || SEASON_COLORS.spring;
  const bestColors = seasonColors.bestColors.slice(0, 6); // Top 6 colors

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#f9fafb');
  gradient.addColorStop(1, '#f3f4f6');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Header
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('나의 퍼스널 컬러', width / 2, 200);

  // Season type (large)
  ctx.font = 'bold 96px Arial';
  ctx.fillStyle = '#8b5cf6';
  ctx.fillText(seasonInfo.ko, width / 2, 350);

  // Description
  ctx.font = '36px Arial';
  ctx.fillStyle = '#6b7280';
  ctx.fillText(seasonInfo.description, width / 2, 420);

  // Color palette title
  ctx.font = 'bold 36px Arial';
  ctx.fillStyle = '#111827';
  ctx.fillText('🎨 나에게 어울리는 컬러', width / 2, 600);

  // Draw color swatches (2 rows, 3 columns)
  const swatchSize = 240;
  const spacing = 30;
  const startX = (width - (3 * swatchSize + 2 * spacing)) / 2;
  const startY = 700;

  bestColors.forEach((color, index) => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    const x = startX + col * (swatchSize + spacing);
    const y = startY + row * (swatchSize + spacing + 80); // Extra space for text

    // Color swatch with rounded corners
    ctx.fillStyle = color.hex;
    ctx.beginPath();
    ctx.roundRect(x, y, swatchSize, swatchSize, 20);
    ctx.fill();

    // Color name
    ctx.fillStyle = '#374151';
    ctx.font = '28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(color.name, x + swatchSize / 2, y + swatchSize + 40);
  });

  // Footer
  ctx.fillStyle = '#9ca3af';
  ctx.font = '32px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`@${instagramId}`, width / 2, height - 180);

  // Service name
  ctx.fillStyle = '#6b7280';
  ctx.font = 'bold 36px Arial';
  ctx.fillText('히잡 퍼스널 컬러 AI', width / 2, height - 120);

  // Convert canvas to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to generate image'));
      }
    }, 'image/jpeg', 0.9);
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