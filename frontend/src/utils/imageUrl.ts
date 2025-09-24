/**
 * Utility to handle image URLs
 * Converts relative paths to absolute URLs using the API base URL
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.MODE === 'production' 
    ? 'https://pca-hijab-backend-unified.onrender.com'
    : 'http://localhost:5001');

/**
 * Get the absolute URL for an image
 * @param url - The image URL (can be relative or absolute)
 * @returns The absolute image URL
 */
export function getImageUrl(url: string | undefined | null): string {
  if (!url) return '';
  
  // If already an absolute URL, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it's a data URL, return as is
  if (url.startsWith('data:')) {
    return url;
  }
  
  // For relative URLs, prepend the API base URL
  // Remove leading slash if exists to avoid double slashes
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${API_BASE}${cleanPath}`;
}

/**
 * Get multiple image URLs
 * @param urls - Array of image URLs
 * @returns Array of absolute image URLs
 */
export function getImageUrls(urls: string[] | undefined | null): string[] {
  if (!urls || !Array.isArray(urls)) return [];
  return urls.map(url => getImageUrl(url));
}