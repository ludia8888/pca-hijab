import type { PersonalColorResult } from '@/types';
import { generateDynamicCard } from './resultCardDynamic';

/**
 * Version 3.0 - Dynamic Layout Result Card
 * Generates a responsive result card with automatic layout
 */
export const generateResultCard = async (
  result: PersonalColorResult,
  instagramId: string
): Promise<Blob> => {
  
  // Use the new dynamic version with auto-layout
  return generateDynamicCard(result, instagramId);
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