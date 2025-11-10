import { describe, it, expect, vi, beforeEach } from 'vitest';
import { convertHEICToJPEG, isHEICSupported, createHEICFallbackPreview } from '../imageConverter';

// Mock heic2any
vi.mock('heic2any', () => ({
  default: vi.fn()
}));

describe('imageConverter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isHEICSupported', () => {
    it('should return true for Safari on macOS', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15',
        configurable: true
      });
      Object.defineProperty(navigator, 'platform', {
        value: 'MacIntel',
        configurable: true
      });

      expect(isHEICSupported()).toBe(true);
    });

    it('should return true for Safari on iOS', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
        configurable: true
      });

      expect(isHEICSupported()).toBe(true);
    });

    it('should return false for Chrome', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        configurable: true
      });

      expect(isHEICSupported()).toBe(false);
    });
  });

  describe('convertHEICToJPEG', () => {
    it('should return non-HEIC files as-is', async () => {
      const jpegFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const result = await convertHEICToJPEG(jpegFile);
      expect(result).toBe(jpegFile);
    });

    it('should return HEIC files as-is when HEIC is supported', async () => {
      // Mock Safari on macOS
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15',
        configurable: true
      });
      Object.defineProperty(navigator, 'platform', {
        value: 'MacIntel',
        configurable: true
      });

      const heicFile = new File(['test'], 'test.heic', { type: 'image/heic' });
      const result = await convertHEICToJPEG(heicFile);
      expect(result).toBe(heicFile);
    });

    it('should convert HEIC to JPEG using heic2any when not supported', async () => {
      // Mock Chrome
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        configurable: true
      });

      const heic2any = await import('heic2any');
      const mockBlob = new Blob(['converted'], { type: 'image/jpeg' });
      vi.mocked(heic2any.default).mockResolvedValue(mockBlob);

      const heicFile = new File(['test'], 'test.heic', { type: 'image/heic' });
      const result = await convertHEICToJPEG(heicFile);

      expect(heic2any.default).toHaveBeenCalledWith({
        blob: heicFile,
        toType: 'image/jpeg',
        quality: 0.9
      });

      expect(result.name).toBe('test.jpg');
      expect(result.type).toBe('image/jpeg');
    });

    it('should handle array of blobs from heic2any', async () => {
      // Mock Chrome
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        configurable: true
      });

      const heic2any = await import('heic2any');
      const mockBlobs = [
        new Blob(['converted1'], { type: 'image/jpeg' }),
        new Blob(['converted2'], { type: 'image/jpeg' })
      ];
      vi.mocked(heic2any.default).mockResolvedValue(mockBlobs);

      const heicFile = new File(['test'], 'test.heic', { type: 'image/heic' });
      const result = await convertHEICToJPEG(heicFile);

      // Should use the first blob
      expect(result.name).toBe('test.jpg');
      expect(result.type).toBe('image/jpeg');
    });

    it('should throw error when conversion fails', async () => {
      // Mock Chrome
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        configurable: true
      });

      const heic2any = await import('heic2any');
      vi.mocked(heic2any.default).mockRejectedValue(new Error('Conversion failed'));

      const heicFile = new File(['test'], 'test.heic', { type: 'image/heic' });
      
      await expect(convertHEICToJPEG(heicFile)).rejects.toThrow('Failed to convert the HEIC file');
    });
  });

  describe('createHEICFallbackPreview', () => {
    it('should create a valid data URL for HEIC files', () => {
      const heicFile = new File(['test'], 'test.heic', { type: 'image/heic' });
      const preview = createHEICFallbackPreview(heicFile);

      expect(preview).toMatch(/^data:image\/svg\+xml;base64,/);
      
      // Decode the base64 to check content
      const base64Part = preview.split(',')[1];
      const decoded = atob(base64Part);
      expect(decoded).toContain('test.heic');
      expect(decoded).toContain('HEIC'); // Just check for HEIC without Korean text
    });
  });
});
