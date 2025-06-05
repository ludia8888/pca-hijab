/**
 * Checks if HEIC is supported by the browser
 */
export const isHEICSupported = (): boolean => {
  // Most browsers don't support HEIC natively
  // Safari on iOS/macOS might support it
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isMacOS = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  
  return isSafari && (isIOS || isMacOS);
};

/**
 * Converts HEIC image to JPEG using canvas
 * Falls back to the original file if conversion fails
 */
export const convertHEICToJPEG = async (file: File): Promise<File> => {
  return new Promise((resolve) => {
    // If it's not a HEIC file, return as is
    if (file.type !== 'image/heic' && !file.name.toLowerCase().endsWith('.heic')) {
      resolve(file);
      return;
    }

    // If HEIC is supported, return as is
    if (isHEICSupported()) {
      resolve(file);
      return;
    }

    // Try to convert using FileReader and Canvas
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const img = new Image();
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(file); // Fallback to original
            return;
          }
          
          ctx.drawImage(img, 0, 0);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const convertedFile = new File(
                [blob], 
                file.name.replace(/\.heic$/i, '.jpg'),
                { type: 'image/jpeg', lastModified: Date.now() }
              );
              resolve(convertedFile);
            } else {
              resolve(file); // Fallback to original
            }
          }, 'image/jpeg', 0.9);
        } catch (error) {
          console.error('HEIC conversion error:', error);
          resolve(file); // Fallback to original
        }
      };
      
      img.onerror = () => {
        // If image fails to load, return original file
        resolve(file);
      };
      
      img.src = event.target?.result as string;
    };
    
    reader.onerror = () => {
      resolve(file); // Fallback to original
    };
    
    // Try to read the file
    try {
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Failed to read HEIC file:', error);
      resolve(file); // Fallback to original
    }
  });
};

/**
 * Creates a fallback preview for HEIC files
 */
export const createHEICFallbackPreview = (file: File): string => {
  // Return a placeholder data URL for HEIC files
  const svg = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="45%" font-family="system-ui" font-size="16" fill="#6b7280" text-anchor="middle">
        HEIC 파일
      </text>
      <text x="50%" y="55%" font-family="system-ui" font-size="14" fill="#9ca3af" text-anchor="middle">
        ${file.name}
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(encodeURIComponent(svg).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))))}`;
};