// Instagram ID validation
export const validateInstagramId = (id: string): boolean => {
  // Empty string check
  if (!id || id.trim() === '') {
    return false;
  }

  // Instagram ID rules:
  // - 1-30 characters
  // - Only letters, numbers, periods (.), and underscores (_) allowed
  // - Periods cannot appear consecutively
  const instagramIdRegex = /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/;
  
  return instagramIdRegex.test(id);
};

// Image file validation (interface compatible with helpers.ts)
export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  
  // Check file existence
  if (!file) {
    return { isValid: false, error: 'FILE_REQUIRED' };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { isValid: false, error: 'FILE_TOO_LARGE' };
  }

  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    // HEIC is handled differently depending on browser
    const fileExtension = file.name.toLowerCase().split('.').pop();
    const isHEIC = fileExtension === 'heic' || fileExtension === 'heif';
    
    if (isHEIC) {
      return { isValid: true }; // HEIC requires separate handling
    }
    return { isValid: false, error: 'FILE_INVALID_TYPE' };
  }

  return { isValid: true };
};

// Privacy consent validation
export const validateConsent = (consent: boolean): boolean => {
  return consent === true;
};