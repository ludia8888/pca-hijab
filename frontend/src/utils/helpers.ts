import { ACCEPTED_IMAGE_FORMATS, MAX_FILE_SIZE } from './constants';

/**
 * Validates Instagram ID format
 * @param id - Instagram ID to validate
 * @returns boolean indicating if ID is valid
 */
export const validateInstagramId = (id: string): boolean => {
  const regex = /^[a-zA-Z0-9._]+$/;
  return regex.test(id) && id.length >= 1 && id.length <= 30;
};

/**
 * Validates image file
 * @param file - File to validate
 * @returns Object with isValid and error message
 */
export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  if (!file) {
    return { isValid: false, error: 'FILE_REQUIRED' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { isValid: false, error: 'FILE_TOO_LARGE' };
  }

  if (!ACCEPTED_IMAGE_FORMATS.includes(file.type)) {
    return { isValid: false, error: 'FILE_INVALID_TYPE' };
  }

  return { isValid: true };
};

/**
 * Compresses and resizes image
 * @param file - Image file to compress
 * @param maxWidth - Maximum width (default: 1024)
 * @param maxHeight - Maximum height (default: 1024)
 * @param quality - Compression quality (0-1, default: 0.8)
 * @returns Promise<File> - Compressed image file
 */
export const compressImage = async (
  file: File,
  maxWidth = 1024,
  maxHeight = 1024,
  quality = 0.8,
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });

            resolve(compressedFile);
          },
          'image/jpeg',
          quality,
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

/**
 * Creates image preview URL
 * @param file - Image file
 * @returns Preview URL
 */
export const createImagePreview = (file: File): string => {
  return URL.createObjectURL(file);
};

/**
 * Cleans up image preview URL
 * @param url - Preview URL to revoke
 */
export const revokeImagePreview = (url: string): void => {
  URL.revokeObjectURL(url);
};

/**
 * Formats file size for display
 * @param bytes - File size in bytes
 * @returns Formatted string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Debounce function
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Generates a unique session ID
 * @returns Unique session ID
 */
export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Checks if the device is mobile
 * @returns boolean indicating if device is mobile
 */
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
};

/**
 * Handles native share or fallback to clipboard
 * @param data - Share data
 * @returns Promise<void>
 */
export const shareOrCopy = async (data: {
  title: string;
  text: string;
  url: string;
}): Promise<void> => {
  if (navigator.share) {
    try {
      await navigator.share(data);
    } catch (error) {
      // User cancelled share
      if (error instanceof Error && error.name !== 'AbortError') {
        throw error;
      }
    }
  } else {
    // Fallback to clipboard
    await navigator.clipboard.writeText(data.url);
  }
};