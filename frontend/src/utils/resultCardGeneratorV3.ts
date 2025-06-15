import type { PersonalColorResult } from '@/types';
import { generateKoreanStyleCard } from './resultCardKoreanStyle';

/**
 * Version 3.0 - Korean Instagram Style Result Card
 * Generates a rich, content-filled result card with Korean aesthetic
 */
export const generateResultCard = async (
  result: PersonalColorResult,
  instagramId: string
): Promise<Blob> => {
  
  // Use the new Korean-style version with rich content
  return generateKoreanStyleCard(result, instagramId);
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