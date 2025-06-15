// Dynamic import to reduce bundle size
const heic2any = () => import('heic2any');

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
 * Converts HEIC image to JPEG using heic2any library
 * Falls back to the original file if conversion fails
 */
export const convertHEICToJPEG = async (file: File): Promise<File> => {
  // If it's not a HEIC file, return as is
  if (file.type !== 'image/heic' && !file.name.toLowerCase().endsWith('.heic')) {
    return file;
  }

  // If HEIC is supported natively, return as is
  if (isHEICSupported()) {
    return file;
  }

  try {
    
    // Convert HEIC to JPEG using heic2any
    const heic2anyModule = await heic2any();
    const convertedBlob = await heic2anyModule.default({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.9
    });
    
    // heic2any might return an array of blobs for multi-page HEIC files
    const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
    
    // Create a new File object from the converted blob
    const convertedFile = new File(
      [blob],
      file.name.replace(/\.heic$/i, '.jpg'),
      { type: 'image/jpeg', lastModified: Date.now() }
    );
    
    return convertedFile;
  } catch {
    
    // If conversion fails, throw an error instead of returning the original file
    // This way the user knows the file cannot be processed
    throw new Error('HEIC 파일 변환에 실패했습니다. 다른 형식의 이미지를 사용해주세요.');
  }
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