/**
 * Image Analysis Error Types and Messages
 */

export enum ImageAnalysisErrorType {
  // Face Detection Errors
  NO_FACE_DETECTED = 'no_face_detected',
  MULTIPLE_FACES = 'multiple_faces',
  FACE_TOO_SMALL = 'face_too_small',
  FACE_PARTIALLY_VISIBLE = 'face_partially_visible',
  FACE_TOO_TILTED = 'face_too_tilted',
  
  // Lighting Errors
  TOO_DARK = 'too_dark',
  TOO_BRIGHT = 'too_bright',
  POOR_LIGHTING = 'poor_lighting',
  HARSH_SHADOWS = 'harsh_shadows',
  
  // Image Quality Errors
  IMAGE_BLURRY = 'image_blurry',
  LOW_RESOLUTION = 'low_resolution',
  POOR_QUALITY = 'poor_quality',
  
  // Distance Errors
  TOO_FAR = 'too_far',
  TOO_CLOSE = 'too_close',
  
  // Obstruction Errors
  FACE_COVERED = 'face_covered',
  WEARING_SUNGLASSES = 'wearing_sunglasses',
  WEARING_MASK = 'wearing_mask',
  
  // Technical Errors
  UNSUPPORTED_FORMAT = 'unsupported_format',
  CORRUPTED_IMAGE = 'corrupted_image',
  PROCESSING_ERROR = 'processing_error',
  
  // Generic Errors
  UNKNOWN_ERROR = 'unknown_error',
}

interface ImageAnalysisErrorInfo {
  title: string;
  message: string;
  solutions: string[];
  icon: string;
  severity: 'error' | 'warning' | 'info';
}

export const IMAGE_ANALYSIS_ERRORS: Record<ImageAnalysisErrorType, ImageAnalysisErrorInfo> = {
  [ImageAnalysisErrorType.NO_FACE_DETECTED]: {
    title: 'Oh! Where did you go?',
    message: 'I can\'t seem to find your beautiful face in this photo!',
    solutions: [
      'Let\'s try a clear selfie with your face visible',
      'Come a bit closer to the camera',
      'Find some nice natural light - you\'ll look amazing!'
    ],
    icon: '👤',
    severity: 'error'
  },
  
  [ImageAnalysisErrorType.MULTIPLE_FACES]: {
    title: 'Too many beautiful faces!',
    message: 'This analysis is just for you! Let\'s use a solo photo.',
    solutions: [
      'Take a selfie with just you in the frame',
      'We need to focus on your unique colors!'
    ],
    icon: '👥',
    severity: 'warning'
  },
  
  [ImageAnalysisErrorType.FACE_TOO_SMALL]: {
    title: 'Come closer, beautiful!',
    message: 'I need to see your gorgeous face better!',
    solutions: [
      'Move closer to the camera - don\'t be shy!',
      'Let your face fill most of the frame'
    ],
    icon: '🔍',
    severity: 'warning'
  },
  
  [ImageAnalysisErrorType.FACE_PARTIALLY_VISIBLE]: {
    title: 'Face partially visible',
    message: 'Please ensure your entire face is visible in the photo.',
    solutions: [
      'Make sure your full face from forehead to chin is visible',
      'Move slightly further from the camera'
    ],
    icon: '✂️',
    severity: 'warning'
  },
  
  [ImageAnalysisErrorType.FACE_TOO_TILTED]: {
    title: 'Face is too tilted',
    message: 'Please face forward and keep your head level.',
    solutions: [
      'Keep your head straight while taking the photo',
      'Hold the camera horizontally',
      'Look directly at the camera'
    ],
    icon: '📐',
    severity: 'warning'
  },
  
  [ImageAnalysisErrorType.TOO_DARK]: {
    title: 'Let\'s add some light!',
    message: 'It\'s a bit too dark for me to see your natural colors.',
    solutions: [
      'Find a bright spot - you deserve to shine!',
      'Natural window light is perfect',
      'Turn on those lights and let\'s try again!'
    ],
    icon: '🌙',
    severity: 'error'
  },
  
  [ImageAnalysisErrorType.TOO_BRIGHT]: {
    title: 'Whoa, too bright!',
    message: 'The light is washing out your beautiful colors!',
    solutions: [
      'Step away from direct bright light',
      'Try soft, indirect lighting instead',
      'No flash needed - you\'re glowing already!'
    ],
    icon: '☀️',
    severity: 'error'
  },
  
  [ImageAnalysisErrorType.POOR_LIGHTING]: {
    title: 'Uneven lighting',
    message: 'Your face has shadows or uneven lighting.',
    solutions: [
      'Use soft natural light',
      'Avoid casting shadows on your face',
      'Try using gentle lighting from multiple directions'
    ],
    icon: '💡',
    severity: 'warning'
  },
  
  [ImageAnalysisErrorType.HARSH_SHADOWS]: {
    title: 'Harsh shadows detected',
    message: 'Strong shadows make accurate color analysis difficult.',
    solutions: [
      'Avoid direct sunlight',
      'Use soft window light',
      'Position yourself so light comes from in front of your face'
    ],
    icon: '🌗',
    severity: 'warning'
  },
  
  [ImageAnalysisErrorType.IMAGE_BLURRY]: {
    title: 'A bit fuzzy there!',
    message: 'Let\'s get a crystal clear shot of your beauty!',
    solutions: [
      'Hold still for just a moment',
      'Tap to focus on your face first',
      'Good lighting helps the camera focus better!'
    ],
    icon: '📸',
    severity: 'warning'
  },
  
  [ImageAnalysisErrorType.LOW_RESOLUTION]: {
    title: 'Resolution is too low',
    message: 'The image quality is too low for accurate analysis.',
    solutions: [
      'Change camera settings to high quality',
      'Use a better camera or device',
      'Use an uncompressed original image'
    ],
    icon: '📺',
    severity: 'error'
  },
  
  [ImageAnalysisErrorType.POOR_QUALITY]: {
    title: 'Poor image quality',
    message: 'The image has too much noise or has been degraded by compression.',
    solutions: [
      'Clean the camera lens before taking the photo',
      'Take the photo carefully without shaking',
      'Use original quality images without compression'
    ],
    icon: '⚠️',
    severity: 'warning'
  },
  
  [ImageAnalysisErrorType.TOO_FAR]: {
    title: 'Too far from camera',
    message: 'Your face appears too small in the photo for detailed analysis.',
    solutions: [
      'Move closer to the camera',
      'Make sure your face fills most of the frame'
    ],
    icon: '📏',
    severity: 'warning'
  },
  
  [ImageAnalysisErrorType.TOO_CLOSE]: {
    title: 'Too close to camera',
    message: 'Taking the photo too close has caused facial distortion.',
    solutions: [
      'Move a bit further away from the camera',
      'Extend your arm fully or use a timer when taking the photo'
    ],
    icon: '🔍',
    severity: 'warning'
  },
  
  [ImageAnalysisErrorType.FACE_COVERED]: {
    title: 'Face is covered',
    message: 'Part of your face is covered by hats, hair, or other objects.',
    solutions: [
      'Remove hats or headbands',
      'Arrange your hair so it doesn\'t cover your face',
      'Make sure your face is clearly visible in the photo'
    ],
    icon: '🎩',
    severity: 'error'
  },
  
  [ImageAnalysisErrorType.WEARING_SUNGLASSES]: {
    title: 'Wearing sunglasses',
    message: 'Please remove sunglasses for accurate eye area color analysis.',
    solutions: [
      'Remove sunglasses before taking the photo',
      'Use a photo where your eyes are clearly visible'
    ],
    icon: '🕶️',
    severity: 'error'
  },
  
  [ImageAnalysisErrorType.WEARING_MASK]: {
    title: 'Wearing a mask',
    message: 'Please remove your mask for accurate analysis.',
    solutions: [
      'Remove your mask before taking the photo',
      'Use a photo where your entire face is visible'
    ],
    icon: '😷',
    severity: 'error'
  },
  
  [ImageAnalysisErrorType.UNSUPPORTED_FORMAT]: {
    title: 'Unsupported file format',
    message: 'This file format cannot be analyzed.',
    solutions: [
      'Please use JPG or PNG format images',
      'Try taking the photo with a different camera or app'
    ],
    icon: '📄',
    severity: 'error'
  },
  
  [ImageAnalysisErrorType.CORRUPTED_IMAGE]: {
    title: 'Image file is corrupted',
    message: 'The file is damaged and cannot be opened.',
    solutions: [
      'Take a new photo',
      'Use a different image file'
    ],
    icon: '💔',
    severity: 'error'
  },
  
  [ImageAnalysisErrorType.PROCESSING_ERROR]: {
    title: 'Oops, my bad!',
    message: 'Something went wrong on my end. Let\'s try that again!',
    solutions: [
      'Give me another chance - click retry!',
      'Maybe try a different photo?',
      'If this keeps happening, let us know!'
    ],
    icon: '⚙️',
    severity: 'error'
  },
  
  [ImageAnalysisErrorType.UNKNOWN_ERROR]: {
    title: 'Hmm, that\'s strange!',
    message: 'I\'m not sure what happened there!',
    solutions: [
      'Let\'s try a fresh photo',
      'Maybe refresh and try again?',
      'If I keep being confused, please let us know!'
    ],
    icon: '❓',
    severity: 'error'
  }
};

/**
 * Parse error response from AI API and determine specific error type
 */
export function parseImageAnalysisError(error: any): ImageAnalysisErrorType {
  // Handle timeout errors specifically
  if (error?.errorType === 'timeout' || error?.originalError?.code === 'ECONNABORTED') {
    return ImageAnalysisErrorType.PROCESSING_ERROR;
  }
  
  // Handle connection errors
  if (error?.errorType === 'connection_refused' || error?.originalError?.code === 'ECONNREFUSED') {
    return ImageAnalysisErrorType.PROCESSING_ERROR;
  }
  
  // Extract error data from various sources
  let fullErrorText = '';
  
  // Check preserved response data first (most specific)
  if (error?.response?.data || error?.originalError?.response?.data) {
    const errorData = error.response?.data || error.originalError?.response?.data;
    const errorMessage = errorData.error || errorData.message || '';
    const errorDetails = errorData.details || errorData.detail || '';
    fullErrorText = `${errorMessage} ${errorDetails}`.toLowerCase();
  }
  // Check if it's an axios error with response data (legacy path)
  else if (error?.response?.data) {
    const errorData = error.response.data;
    const errorMessage = errorData.error || errorData.message || '';
    const errorDetails = errorData.details || errorData.detail || '';
    fullErrorText = `${errorMessage} ${errorDetails}`.toLowerCase();
  }
  
  // If we have error text to analyze, process it
  if (fullErrorText) {
    
    // Face detection errors
    if (fullErrorText.includes('no face') || fullErrorText.includes('face not found') || 
        fullErrorText.includes('face not detected') || fullErrorText.includes('얼굴을 찾을 수 없')) {
      return ImageAnalysisErrorType.NO_FACE_DETECTED;
    }
    
    if (fullErrorText.includes('multiple faces') || fullErrorText.includes('여러 얼굴') ||
        fullErrorText.includes('too many faces')) {
      return ImageAnalysisErrorType.MULTIPLE_FACES;
    }
    
    if (fullErrorText.includes('face too small') || fullErrorText.includes('얼굴이 너무 작')) {
      return ImageAnalysisErrorType.FACE_TOO_SMALL;
    }
    
    if (fullErrorText.includes('face partially') || fullErrorText.includes('face cut') ||
        fullErrorText.includes('얼굴 일부')) {
      return ImageAnalysisErrorType.FACE_PARTIALLY_VISIBLE;
    }
    
    if (fullErrorText.includes('face tilted') || fullErrorText.includes('face rotated') ||
        fullErrorText.includes('기울어진') || fullErrorText.includes('회전')) {
      return ImageAnalysisErrorType.FACE_TOO_TILTED;
    }
    
    // Lighting errors
    if (fullErrorText.includes('too dark') || fullErrorText.includes('너무 어두') ||
        fullErrorText.includes('insufficient light') || fullErrorText.includes('underexposed')) {
      return ImageAnalysisErrorType.TOO_DARK;
    }
    
    if (fullErrorText.includes('too bright') || fullErrorText.includes('너무 밝') ||
        fullErrorText.includes('overexposed') || fullErrorText.includes('과다 노출')) {
      return ImageAnalysisErrorType.TOO_BRIGHT;
    }
    
    if (fullErrorText.includes('poor lighting') || fullErrorText.includes('bad lighting') ||
        fullErrorText.includes('조명') || fullErrorText.includes('lighting')) {
      return ImageAnalysisErrorType.POOR_LIGHTING;
    }
    
    if (fullErrorText.includes('shadow') || fullErrorText.includes('그림자')) {
      return ImageAnalysisErrorType.HARSH_SHADOWS;
    }
    
    // Image quality errors
    if (fullErrorText.includes('blurry') || fullErrorText.includes('blur') ||
        fullErrorText.includes('흐릿') || fullErrorText.includes('초점')) {
      return ImageAnalysisErrorType.IMAGE_BLURRY;
    }
    
    if (fullErrorText.includes('low resolution') || fullErrorText.includes('low quality') ||
        fullErrorText.includes('해상도') || fullErrorText.includes('품질이 낮')) {
      return ImageAnalysisErrorType.LOW_RESOLUTION;
    }
    
    if (fullErrorText.includes('poor quality') || fullErrorText.includes('bad quality') ||
        fullErrorText.includes('품질')) {
      return ImageAnalysisErrorType.POOR_QUALITY;
    }
    
    // Distance errors
    if (fullErrorText.includes('too far') || fullErrorText.includes('너무 멀') ||
        fullErrorText.includes('distance')) {
      return ImageAnalysisErrorType.TOO_FAR;
    }
    
    if (fullErrorText.includes('too close') || fullErrorText.includes('너무 가까')) {
      return ImageAnalysisErrorType.TOO_CLOSE;
    }
    
    // Obstruction errors
    if (fullErrorText.includes('face covered') || fullErrorText.includes('covered') ||
        fullErrorText.includes('가려진') || fullErrorText.includes('가려져')) {
      return ImageAnalysisErrorType.FACE_COVERED;
    }
    
    if (fullErrorText.includes('sunglasses') || fullErrorText.includes('glasses') ||
        fullErrorText.includes('선글라스') || fullErrorText.includes('안경')) {
      return ImageAnalysisErrorType.WEARING_SUNGLASSES;
    }
    
    if (fullErrorText.includes('mask') || fullErrorText.includes('마스크')) {
      return ImageAnalysisErrorType.WEARING_MASK;
    }
    
    // Technical errors
    if (fullErrorText.includes('unsupported format') || fullErrorText.includes('invalid format') ||
        fullErrorText.includes('format') || fullErrorText.includes('형식')) {
      return ImageAnalysisErrorType.UNSUPPORTED_FORMAT;
    }
    
    if (fullErrorText.includes('corrupted') || fullErrorText.includes('corrupt') ||
        fullErrorText.includes('손상') || fullErrorText.includes('파손')) {
      return ImageAnalysisErrorType.CORRUPTED_IMAGE;
    }
    
    if (fullErrorText.includes('processing') || fullErrorText.includes('process') ||
        fullErrorText.includes('처리')) {
      return ImageAnalysisErrorType.PROCESSING_ERROR;
    }
  }
  
  // Check error message directly
  const errorMessage = error?.message || error || '';
  if (typeof errorMessage === 'string') {
    const lowerMessage = errorMessage.toLowerCase();
    
    if (lowerMessage.includes('heic')) {
      return ImageAnalysisErrorType.UNSUPPORTED_FORMAT;
    }
    
    if (lowerMessage.includes('timeout') || lowerMessage.includes('초과')) {
      return ImageAnalysisErrorType.PROCESSING_ERROR;
    }
    
    if (lowerMessage.includes('network') || lowerMessage.includes('연결')) {
      return ImageAnalysisErrorType.PROCESSING_ERROR;
    }
  }
  
  // Default to unknown error
  return ImageAnalysisErrorType.UNKNOWN_ERROR;
}

/**
 * Get error information for display
 */
export function getImageAnalysisErrorInfo(errorType: ImageAnalysisErrorType): ImageAnalysisErrorInfo {
  return IMAGE_ANALYSIS_ERRORS[errorType];
}