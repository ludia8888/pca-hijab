import type { PersonalColorResult } from '@/types';
import { generateFixedCard } from './resultCardFixed';

/**
 * Version 3.1 - Fixed Layout Result Card
 * Generates a result card with fixed positions to prevent any overlapping
 */
export const generateResultCard = async (
  result: PersonalColorResult,
  instagramId: string
): Promise<Blob> => {
  
  // Use the fixed layout version to ensure no overlapping
  return generateFixedCard(result, instagramId);
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