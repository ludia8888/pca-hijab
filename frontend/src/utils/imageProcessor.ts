/**
 * Image Processor - Handles image format conversion and compression
 */

interface ProcessImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

const DEFAULT_OPTIONS: ProcessImageOptions = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.85,
  format: 'jpeg'
};

export class ImageProcessor {
  /**
   * Convert HEIC/HEIF to JPEG using canvas
   */
  static async convertHeicToJpeg(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      // First, try to detect if this is actually a HEIC file
      const isHeic = file.type === 'image/heic' || 
                    file.type === 'image/heif' ||
                    file.name.toLowerCase().endsWith('.heic') ||
                    file.name.toLowerCase().endsWith('.heif');

      if (!isHeic) {
        resolve(file);
        return;
      }

      // Create image element
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      img.onload = () => {
        try {
          // Set canvas dimensions
          canvas.width = img.width;
          canvas.height = img.height;

          // Draw image to canvas
          ctx.drawImage(img, 0, 0);

          // Convert to blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to convert image'));
                return;
              }

              // Create new file with JPEG extension
              const newFileName = file.name.replace(/\.(heic|heif)$/i, '.jpg');
              const newFile = new File([blob], newFileName, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });

              resolve(newFile);
            },
            'image/jpeg',
            0.9
          );
        } catch (error) {
          reject(new Error(`Failed to process HEIC image: ${error}`));
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load HEIC image. This format may not be supported by your browser.'));
      };

      // Try to load the image
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => {
        reject(new Error('Failed to read HEIC file'));
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Compress and resize image
   */
  static async compressImage(
    file: File,
    options: ProcessImageOptions = {}
  ): Promise<File> {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      img.onload = () => {
        try {
          // Calculate new dimensions while maintaining aspect ratio
          let { width, height } = img;
          const maxWidth = opts.maxWidth!;
          const maxHeight = opts.maxHeight!;

          if (width > maxWidth || height > maxHeight) {
            const aspectRatio = width / height;

            if (width > height) {
              width = maxWidth;
              height = width / aspectRatio;
            } else {
              height = maxHeight;
              width = height * aspectRatio;
            }
          }

          // Set canvas dimensions
          canvas.width = width;
          canvas.height = height;

          // Enable image smoothing for better quality
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Draw resized image
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }

              // Create new file
              const newFile = new File([blob], file.name, {
                type: `image/${opts.format}`,
                lastModified: Date.now()
              });

              // Check if compression actually reduced size
              if (newFile.size >= file.size) {
                resolve(file); // Return original if compression didn't help
              } else {
                resolve(newFile);
              }
            },
            `image/${opts.format}`,
            opts.quality
          );
        } catch (error) {
          reject(new Error(`Failed to compress image: ${error}`));
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for compression'));
      };

      // Load image
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => {
        reject(new Error('Failed to read image file'));
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Process image with HEIC conversion and compression
   */
  static async processImage(
    file: File,
    options: ProcessImageOptions = {}
  ): Promise<File> {
    try {
      // Step 1: Convert HEIC if necessary
      let processedFile = file;
      if (file.type === 'image/heic' || file.type === 'image/heif' ||
          file.name.toLowerCase().endsWith('.heic') || 
          file.name.toLowerCase().endsWith('.heif')) {
        console.log('Converting HEIC to JPEG...');
        processedFile = await this.convertHeicToJpeg(file);
      }

      // Step 2: Compress if file is large
      if (processedFile.size > 2 * 1024 * 1024) { // 2MB
        console.log('Compressing large image...');
        processedFile = await this.compressImage(processedFile, options);
      }

      return processedFile;
    } catch (error) {
      console.error('Image processing failed:', error);
      // Return original file if processing fails
      return file;
    }
  }

  /**
   * Check if browser supports HEIC
   */
  static supportsHeic(): boolean {
    // Most browsers don't support HEIC natively
    // Safari on macOS/iOS supports it
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isMacOS = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    
    return isSafari && (isIOS || isMacOS);
  }

  /**
   * Get image dimensions
   */
  static async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => {
        reject(new Error('Failed to read image file'));
      };
      reader.readAsDataURL(file);
    });
  }
}