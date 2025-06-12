import type { PersonalColorResult } from '@/types';
import { generateMobileResultCard } from './resultCardMobile';

/**
 * Version 3.0 - Mobile Optimized Result Card
 * Redirects to the new mobile-optimized implementation
 */
export const generateResultCard = async (
  result: PersonalColorResult,
  instagramId: string
): Promise<Blob> => {
  
  // Use the new mobile-optimized version
  return generateMobileResultCard(result, instagramId);
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