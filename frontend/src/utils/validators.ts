// Instagram ID 유효성 검사
export const validateInstagramId = (id: string): boolean => {
  // 빈 문자열 체크
  if (!id || id.trim() === '') {
    return false;
  }

  // Instagram ID 규칙:
  // - 1-30자
  // - 영문, 숫자, 마침표(.), 언더스코어(_)만 허용
  // - 마침표는 연속으로 올 수 없음
  const instagramIdRegex = /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/;
  
  return instagramIdRegex.test(id);
};

// 이미지 파일 유효성 검사 (helpers.ts와 호환되는 인터페이스)
export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  
  // 파일 존재 여부
  if (!file) {
    return { isValid: false, error: 'FILE_REQUIRED' };
  }

  // 파일 크기 체크
  if (file.size > MAX_FILE_SIZE) {
    return { isValid: false, error: 'FILE_TOO_LARGE' };
  }

  // 파일 타입 체크
  if (!ALLOWED_TYPES.includes(file.type)) {
    // HEIC는 브라우저에 따라 다르게 처리
    const fileExtension = file.name.toLowerCase().split('.').pop();
    const isHEIC = fileExtension === 'heic' || fileExtension === 'heif';
    
    if (isHEIC) {
      return { isValid: true }; // HEIC는 별도 처리
    }
    return { isValid: false, error: 'FILE_INVALID_TYPE' };
  }

  return { isValid: true };
};

// 개인정보 수집 동의 체크
export const validateConsent = (consent: boolean): boolean => {
  return consent === true;
};