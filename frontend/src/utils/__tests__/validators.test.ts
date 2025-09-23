import { describe, it, expect } from 'vitest';
import { validateInstagramId, validateImageFile, validateConsent } from '../validators';

describe('validateInstagramId', () => {
  // 유효한 케이스
  it('should accept valid Instagram ID', () => {
    expect(validateInstagramId('valid_user123')).toBe(true);
    expect(validateInstagramId('user.name')).toBe(true);
    expect(validateInstagramId('user_name')).toBe(true);
    expect(validateInstagramId('username')).toBe(true);
    expect(validateInstagramId('a')).toBe(true); // 1글자도 OK
  });

  // 무효한 케이스
  it('should reject empty string', () => {
    expect(validateInstagramId('')).toBe(false);
    expect(validateInstagramId(' ')).toBe(false);
    expect(validateInstagramId('   ')).toBe(false);
  });

  it('should reject IDs with invalid characters', () => {
    expect(validateInstagramId('user@name')).toBe(false);
    expect(validateInstagramId('user name')).toBe(false);
    expect(validateInstagramId('user#name')).toBe(false);
    expect(validateInstagramId('한글유저')).toBe(false);
  });

  it('should reject IDs with consecutive dots', () => {
    expect(validateInstagramId('user..name')).toBe(false);
    expect(validateInstagramId('...username')).toBe(false);
  });

  it('should reject IDs ending with dot', () => {
    expect(validateInstagramId('username.')).toBe(false);
    expect(validateInstagramId('user.name.')).toBe(false);
  });

  it('should reject IDs longer than 30 characters', () => {
    const longId = 'a'.repeat(31);
    expect(validateInstagramId(longId)).toBe(false);
  });
});

describe('validateImageFile', () => {
  // 유효한 파일
  it('should accept valid image files', () => {
    const jpgFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const pngFile = new File([''], 'test.png', { type: 'image/png' });
    const webpFile = new File([''], 'test.webp', { type: 'image/webp' });

    expect(validateImageFile(jpgFile).isValid).toBe(true);
    expect(validateImageFile(pngFile).isValid).toBe(true);
    expect(validateImageFile(webpFile).isValid).toBe(true);
  });

  // HEIC 파일 처리
  it('should accept HEIC files', () => {
    const heicFile = new File([''], 'test.heic', { type: 'image/heic' });
    const heifFile = new File([''], 'test.HEIF', { type: 'image/heif' });

    expect(validateImageFile(heicFile).isValid).toBe(true);
    expect(validateImageFile(heifFile).isValid).toBe(true);
  });

  // 파일 크기 체크
  it('should reject files larger than 10MB', () => {
    // 11MB 파일 생성
    const largeContent = new Uint8Array(11 * 1024 * 1024);
    const largeFile = new File([largeContent], 'large.jpg', { type: 'image/jpeg' });

    const result = validateImageFile(largeFile);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('FILE_TOO_LARGE');
  });

  // 지원하지 않는 파일 타입
  it('should reject unsupported file types', () => {
    const gifFile = new File([''], 'test.gif', { type: 'image/gif' });
    const bmpFile = new File([''], 'test.bmp', { type: 'image/bmp' });
    const pdfFile = new File([''], 'test.pdf', { type: 'application/pdf' });

    expect(validateImageFile(gifFile).isValid).toBe(false);
    expect(validateImageFile(bmpFile).isValid).toBe(false);
    expect(validateImageFile(pdfFile).isValid).toBe(false);
  });

  // null/undefined 체크
  it('should reject null or undefined', () => {
    const result = validateImageFile(null as unknown as File);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('FILE_REQUIRED');
  });
});

describe('validateConsent', () => {
  it('should accept true', () => {
    expect(validateConsent(true)).toBe(true);
  });

  it('should reject false', () => {
    expect(validateConsent(false)).toBe(false);
  });

  it('should reject non-boolean values', () => {
    expect(validateConsent(null as unknown as boolean)).toBe(false);
    expect(validateConsent(undefined as unknown as boolean)).toBe(false);
    expect(validateConsent('true' as unknown as boolean)).toBe(false);
    expect(validateConsent(1 as unknown as boolean)).toBe(false);
  });
});
