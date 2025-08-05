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
    title: '얼굴을 찾을 수 없어요',
    message: '사진에서 얼굴이 감지되지 않았습니다.',
    solutions: [
      '얼굴이 선명하게 보이는 정면 사진을 촬영해주세요',
      '카메라와 적당한 거리를 유지해주세요',
      '충분한 조명 아래에서 촬영해주세요'
    ],
    icon: '👤',
    severity: 'error'
  },
  
  [ImageAnalysisErrorType.MULTIPLE_FACES]: {
    title: '여러 명이 감지되었어요',
    message: '한 명의 얼굴만 나온 사진을 사용해주세요.',
    solutions: [
      '혼자만 나온 셀카를 촬영해주세요',
      '다른 사람이 함께 나오지 않게 주의해주세요'
    ],
    icon: '👥',
    severity: 'warning'
  },
  
  [ImageAnalysisErrorType.FACE_TOO_SMALL]: {
    title: '얼굴이 너무 작아요',
    message: '얼굴이 화면에서 더 크게 보이도록 촬영해주세요.',
    solutions: [
      '카메라에 좀 더 가까이 다가가주세요',
      '얼굴이 화면의 60% 이상 차지하도록 촬영해주세요'
    ],
    icon: '🔍',
    severity: 'warning'
  },
  
  [ImageAnalysisErrorType.FACE_PARTIALLY_VISIBLE]: {
    title: '얼굴이 일부만 보여요',
    message: '얼굴 전체가 화면에 나오도록 촬영해주세요.',
    solutions: [
      '이마부터 턱까지 얼굴 전체가 보이게 촬영해주세요',
      '카메라에서 조금 더 멀리 떨어져 보세요'
    ],
    icon: '✂️',
    severity: 'warning'
  },
  
  [ImageAnalysisErrorType.FACE_TOO_TILTED]: {
    title: '얼굴이 너무 기울어져 있어요',
    message: '정면을 바라보고 수평으로 촬영해주세요.',
    solutions: [
      '고개를 똑바로 세우고 촬영해주세요',
      '카메라를 수평으로 유지해주세요',
      '정면을 바라보며 촬영해주세요'
    ],
    icon: '📐',
    severity: 'warning'
  },
  
  [ImageAnalysisErrorType.TOO_DARK]: {
    title: '사진이 너무 어두워요',
    message: '조명이 부족해서 정확한 분석이 어려워요.',
    solutions: [
      '밝은 곳에서 촬영해주세요',
      '자연광(창가) 근처에서 촬영하는 것이 좋아요',
      '실내 조명을 켜고 촬영해주세요'
    ],
    icon: '🌙',
    severity: 'error'
  },
  
  [ImageAnalysisErrorType.TOO_BRIGHT]: {
    title: '사진이 너무 밝아요',
    message: '과다 노출로 인해 정확한 분석이 어려워요.',
    solutions: [
      '직접적인 조명을 피해주세요',
      '창문을 등지지 말고 옆에서 빛을 받아보세요',
      '플래시를 끄고 촬영해주세요'
    ],
    icon: '☀️',
    severity: 'error'
  },
  
  [ImageAnalysisErrorType.POOR_LIGHTING]: {
    title: '조명이 고르지 않아요',
    message: '얼굴에 그림자가 지거나 조명이 불균등해요.',
    solutions: [
      '부드러운 자연광 아래에서 촬영해주세요',
      '얼굴에 그림자가 지지 않도록 주의해주세요',
      '여러 방향에서 오는 부드러운 조명을 이용해보세요'
    ],
    icon: '💡',
    severity: 'warning'
  },
  
  [ImageAnalysisErrorType.HARSH_SHADOWS]: {
    title: '그림자가 너무 진해요',
    message: '강한 그림자로 인해 정확한 색상 분석이 어려워요.',
    solutions: [
      '직사광선을 피해주세요',
      '창가의 부드러운 빛을 이용해보세요',
      '얼굴 정면에서 빛이 오도록 위치를 조정해주세요'
    ],
    icon: '🌗',
    severity: 'warning'
  },
  
  [ImageAnalysisErrorType.IMAGE_BLURRY]: {
    title: '사진이 흐릿해요',
    message: '사진이 선명하지 않아서 분석이 어려워요.',
    solutions: [
      '카메라를 흔들리지 않게 고정하고 촬영해주세요',
      '초점이 맞을 때까지 기다린 후 촬영해주세요',
      '충분한 조명에서 촬영해주세요'
    ],
    icon: '📸',
    severity: 'warning'
  },
  
  [ImageAnalysisErrorType.LOW_RESOLUTION]: {
    title: '해상도가 너무 낮아요',
    message: '이미지 품질이 낮아서 정확한 분석이 어려워요.',
    solutions: [
      '카메라 설정에서 고화질로 변경해주세요',
      '더 좋은 카메라나 기기를 사용해보세요',
      '압축되지 않은 원본 이미지를 사용해주세요'
    ],
    icon: '📺',
    severity: 'error'
  },
  
  [ImageAnalysisErrorType.POOR_QUALITY]: {
    title: '이미지 품질이 좋지 않아요',
    message: '노이즈가 많거나 압축으로 인해 품질이 저하되었어요.',
    solutions: [
      '깨끗한 렌즈로 촬영해주세요',
      '흔들리지 않게 주의해서 촬영해주세요',
      '원본 품질의 이미지를 사용해주세요'
    ],
    icon: '⚠️',
    severity: 'warning'
  },
  
  [ImageAnalysisErrorType.TOO_FAR]: {
    title: '거리가 너무 멀어요',
    message: '얼굴이 너무 작게 촬영되어 세부 분석이 어려워요.',
    solutions: [
      '카메라에 더 가까이 다가가주세요',
      '얼굴이 화면을 충분히 채우도록 촬영해주세요'
    ],
    icon: '📏',
    severity: 'warning'
  },
  
  [ImageAnalysisErrorType.TOO_CLOSE]: {
    title: '거리가 너무 가까워요',
    message: '너무 가까이서 촬영해서 얼굴이 왜곡되었어요.',
    solutions: [
      '카메라에서 조금 더 멀리 떨어져 보세요',
      '팔을 쭉 뻗어서 촬영하거나 타이머를 이용해보세요'
    ],
    icon: '🔍',
    severity: 'warning'
  },
  
  [ImageAnalysisErrorType.FACE_COVERED]: {
    title: '얼굴이 가려져 있어요',
    message: '모자, 머리카락 등으로 얼굴이 일부 가려져 있어요.',
    solutions: [
      '모자나 헤어밴드를 제거해주세요',
      '머리카락이 얼굴을 가리지 않도록 정리해주세요',
      '얼굴이 선명하게 보이도록 촬영해주세요'
    ],
    icon: '🎩',
    severity: 'error'
  },
  
  [ImageAnalysisErrorType.WEARING_SUNGLASSES]: {
    title: '선글라스를 착용하고 있어요',
    message: '눈 주변 색상 분석을 위해 선글라스를 벗어주세요.',
    solutions: [
      '선글라스를 벗고 촬영해주세요',
      '눈이 선명하게 보이는 사진을 사용해주세요'
    ],
    icon: '🕶️',
    severity: 'error'
  },
  
  [ImageAnalysisErrorType.WEARING_MASK]: {
    title: '마스크를 착용하고 있어요',
    message: '정확한 분석을 위해 마스크를 벗어주세요.',
    solutions: [
      '마스크를 벗고 촬영해주세요',
      '얼굴 전체가 보이는 사진을 사용해주세요'
    ],
    icon: '😷',
    severity: 'error'
  },
  
  [ImageAnalysisErrorType.UNSUPPORTED_FORMAT]: {
    title: '지원하지 않는 파일 형식이에요',
    message: '이 파일 형식은 분석할 수 없어요.',
    solutions: [
      'JPG, PNG 형식의 이미지를 사용해주세요',
      '다른 카메라나 앱으로 촬영해보세요'
    ],
    icon: '📄',
    severity: 'error'
  },
  
  [ImageAnalysisErrorType.CORRUPTED_IMAGE]: {
    title: '이미지 파일이 손상되었어요',
    message: '파일이 손상되어 열 수 없어요.',
    solutions: [
      '새로운 사진을 촬영해주세요',
      '다른 이미지 파일을 사용해주세요'
    ],
    icon: '💔',
    severity: 'error'
  },
  
  [ImageAnalysisErrorType.PROCESSING_ERROR]: {
    title: '처리 중 오류가 발생했어요',
    message: '분석 과정에서 기술적 문제가 발생했어요.',
    solutions: [
      '잠시 후 다시 시도해주세요',
      '다른 이미지로 시도해보세요',
      '문제가 지속되면 고객센터로 문의해주세요'
    ],
    icon: '⚙️',
    severity: 'error'
  },
  
  [ImageAnalysisErrorType.UNKNOWN_ERROR]: {
    title: '알 수 없는 오류가 발생했어요',
    message: '예상하지 못한 문제가 발생했어요.',
    solutions: [
      '새로운 사진으로 다시 시도해주세요',
      '앱을 재시작해보세요',
      '문제가 계속되면 고객센터로 문의해주세요'
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