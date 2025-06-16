import type { PersonalColorResult } from '@/types';
import { generateCustomizedCard } from './resultCardCustomized';

/**
 * Version 3.2 - Customized Layout Result Card
 * Generates a result card with season-specific layouts and designs
 */
export const generateResultCard = async (
  result: PersonalColorResult,
  instagramId: string
): Promise<Blob> => {
  
  // Use the customized layout version for each season
  return generateCustomizedCard(result, instagramId);
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