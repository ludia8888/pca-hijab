// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
export const validatePassword = (password: string): { isValid: boolean; error?: string } => {
  if (!password) {
    return { isValid: false, error: '비밀번호를 입력해주세요' };
  }

  if (password.length < 8) {
    return { isValid: false, error: '비밀번호는 8자 이상이어야 합니다' };
  }

  // Check for at least one letter
  if (!/[a-zA-Z]/.test(password)) {
    return { isValid: false, error: '비밀번호에는 영문자가 포함되어야 합니다' };
  }

  // Check for at least one number
  if (!/\d/.test(password)) {
    return { isValid: false, error: '비밀번호에는 숫자가 포함되어야 합니다' };
  }

  // Check for at least one special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { isValid: false, error: '비밀번호에는 특수문자가 포함되어야 합니다' };
  }

  return { isValid: true };
};

// Instagram ID validation
export const validateInstagramId = (id: string): boolean => {
  // Instagram username rules:
  // - 1-30 characters
  // - Can contain letters, numbers, periods, and underscores
  // - Cannot start or end with a period
  // - Cannot have consecutive periods
  const instagramRegex = /^(?!.*\.\.)(?!\.)[a-zA-Z0-9._]{1,30}(?<!\.)$/;
  return instagramRegex.test(id);
};

// Phone number validation (Korean format)
export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
  return phoneRegex.test(phone.replace(/-/g, ''));
};

// Name validation
export const validateName = (name: string): boolean => {
  // Allow Korean, English letters, and spaces
  // Minimum 2 characters
  return name.length >= 2 && /^[가-힣a-zA-Z\s]+$/.test(name);
};