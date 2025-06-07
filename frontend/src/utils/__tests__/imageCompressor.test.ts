import { describe, it, expect, beforeEach, vi } from 'vitest';
import { compressImage } from '../helpers';

describe('compressImage', () => {
  interface MockImage {
    width: number;
    height: number;
    onload: ((this: GlobalEventHandlers, ev: Event) => unknown) | null;
    onerror: ((this: GlobalEventHandlers, ev: Event) => unknown) | null;
    src: string;
  }
  
  interface MockCanvas {
    width: number;
    height: number;
    getContext: ReturnType<typeof vi.fn>;
    toBlob: ReturnType<typeof vi.fn>;
  }
  
  interface MockContext {
    drawImage: ReturnType<typeof vi.fn>;
  }
  
  interface MockFileReader {
    readAsDataURL: ReturnType<typeof vi.fn>;
    onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown) | null;
    onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown) | null;
    result: string | ArrayBuffer | null;
  }
  
  let mockImage: MockImage;
  let mockCanvas: MockCanvas;
  let mockContext: MockContext;
  let mockFileReader: MockFileReader;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Mock canvas context
    mockContext = {
      drawImage: vi.fn(),
    };

    // Mock canvas
    mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn().mockReturnValue(mockContext),
      toBlob: vi.fn(),
    };

    // Mock document.createElement to return our mock canvas
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'canvas') {
        return mockCanvas as unknown as HTMLCanvasElement;
      }
      return document.createElement(tagName);
    });

    // Mock Image constructor
    mockImage = {
      width: 2000,
      height: 1500,
      onload: null,
      onerror: null,
      src: '',
    };

    global.Image = vi.fn().mockImplementation(() => mockImage) as unknown as typeof Image;

    // Mock FileReader
    mockFileReader = {
      readAsDataURL: vi.fn(),
      onload: null,
      onerror: null,
      result: 'data:image/jpeg;base64,test',
    };

    global.FileReader = vi.fn().mockImplementation(() => mockFileReader) as unknown as typeof FileReader;
  });

  it('should skip compression for HEIC files', async () => {
    const heicFile = new File(['test'], 'test.heic', { type: 'image/heic' });
    
    const result = await compressImage(heicFile);
    
    // Should return original file without processing
    expect(result).toBe(heicFile);
    expect(global.Image).not.toHaveBeenCalled();
    expect(global.FileReader).not.toHaveBeenCalled();
  });

  it('should compress a regular JPEG image', async () => {
    const originalFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    // Setup mock to trigger callbacks
    mockFileReader.readAsDataURL.mockImplementation(function(this: MockFileReader) {
      setTimeout(() => this.onload({ target: { result: 'data:image/jpeg;base64,test' } }), 0);
    });

    // Mock canvas toBlob to return a compressed blob
    mockCanvas.toBlob.mockImplementation((callback: BlobCallback) => {
      const blob = new Blob(['compressed'], { type: 'image/jpeg' });
      callback(blob);
    });

    const promise = compressImage(originalFile);

    // Wait for FileReader to process
    await new Promise(resolve => setTimeout(resolve, 10));

    // Trigger image onload
    if (mockImage.onload) {
      mockImage.onload();
    }

    const result = await promise;

    expect(result).toBeInstanceOf(File);
    expect(result.type).toBe('image/jpeg');
    expect(result.name).toBe('test.jpg');
    expect(mockContext.drawImage).toHaveBeenCalledWith(mockImage, 0, 0, 1024, 768);
  });

  it('should resize wide images to fit maxWidth', async () => {
    const originalFile = new File(['test'], 'wide.jpg', { type: 'image/jpeg' });
    
    mockFileReader.readAsDataURL.mockImplementation(function(this: MockFileReader) {
      setTimeout(() => this.onload({ target: { result: 'data:image/jpeg;base64,test' } }), 0);
    });

    mockCanvas.toBlob.mockImplementation((callback: BlobCallback) => {
      const blob = new Blob(['compressed'], { type: 'image/jpeg' });
      callback(blob);
    });

    // Set image dimensions - wider than maxWidth
    mockImage.width = 2048;
    mockImage.height = 1024;

    const promise = compressImage(originalFile, 1024, 1024);

    await new Promise(resolve => setTimeout(resolve, 10));

    if (mockImage.onload) {
      mockImage.onload();
    }

    await promise;

    // Check that canvas was set to correct dimensions
    expect(mockCanvas.width).toBe(1024);
    expect(mockCanvas.height).toBe(512); // Maintains aspect ratio
  });

  it('should resize tall images to fit maxHeight', async () => {
    const originalFile = new File(['test'], 'tall.jpg', { type: 'image/jpeg' });
    
    mockFileReader.readAsDataURL.mockImplementation(function(this: MockFileReader) {
      setTimeout(() => this.onload({ target: { result: 'data:image/jpeg;base64,test' } }), 0);
    });

    mockCanvas.toBlob.mockImplementation((callback: BlobCallback) => {
      const blob = new Blob(['compressed'], { type: 'image/jpeg' });
      callback(blob);
    });

    // Set image dimensions - taller than maxHeight
    mockImage.width = 1024;
    mockImage.height = 2048;

    const promise = compressImage(originalFile, 1024, 1024);

    await new Promise(resolve => setTimeout(resolve, 10));

    if (mockImage.onload) {
      mockImage.onload();
    }

    await promise;

    // Check that canvas was set to correct dimensions
    expect(mockCanvas.width).toBe(512); // Maintains aspect ratio
    expect(mockCanvas.height).toBe(1024);
  });

  it('should use custom quality parameter', async () => {
    const originalFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const customQuality = 0.5;
    
    mockFileReader.readAsDataURL.mockImplementation(function(this: MockFileReader) {
      setTimeout(() => this.onload({ target: { result: 'data:image/jpeg;base64,test' } }), 0);
    });

    mockCanvas.toBlob.mockImplementation((callback: BlobCallback) => {
      const blob = new Blob(['compressed'], { type: 'image/jpeg' });
      callback(blob);
    });

    const promise = compressImage(originalFile, 1024, 1024, customQuality);

    await new Promise(resolve => setTimeout(resolve, 10));

    if (mockImage.onload) {
      mockImage.onload();
    }

    await promise;

    // Verify toBlob was called with correct quality
    expect(mockCanvas.toBlob).toHaveBeenCalledWith(
      expect.any(Function as unknown),
      'image/jpeg',
      customQuality
    );
  });

  it('should reject when canvas context is null', async () => {
    const originalFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    mockFileReader.readAsDataURL.mockImplementation(function(this: MockFileReader) {
      setTimeout(() => this.onload({ target: { result: 'data:image/jpeg;base64,test' } }), 0);
    });

    // Make getContext return null
    mockCanvas.getContext.mockReturnValueOnce(null);

    const promise = compressImage(originalFile);

    await new Promise(resolve => setTimeout(resolve, 10));

    if (mockImage.onload) {
      mockImage.onload();
    }

    await expect(promise).rejects.toThrow('Failed to get canvas context');
  });

  it('should reject when blob creation fails', async () => {
    const originalFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    mockFileReader.readAsDataURL.mockImplementation(function(this: MockFileReader) {
      setTimeout(() => this.onload({ target: { result: 'data:image/jpeg;base64,test' } }), 0);
    });

    // Make toBlob return null
    mockCanvas.toBlob.mockImplementation((callback: BlobCallback) => {
      callback(null);
    });

    const promise = compressImage(originalFile);

    await new Promise(resolve => setTimeout(resolve, 10));

    if (mockImage.onload) {
      mockImage.onload();
    }

    await expect(promise).rejects.toThrow('Failed to compress image');
  });

  it('should reject when image fails to load', async () => {
    const originalFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    mockFileReader.readAsDataURL.mockImplementation(function(this: MockFileReader) {
      setTimeout(() => this.onload({ target: { result: 'data:image/jpeg;base64,test' } }), 0);
    });

    const promise = compressImage(originalFile);

    await new Promise(resolve => setTimeout(resolve, 10));

    // Trigger image error instead of onload
    if (mockImage.onerror) {
      mockImage.onerror(new Error('Image load failed'));
    }

    await expect(promise).rejects.toThrow('Image load failed');
  });

  it('should reject when FileReader fails', async () => {
    const originalFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    mockFileReader.readAsDataURL.mockImplementation(function(this: MockFileReader) {
      setTimeout(() => this.onerror(new Error('Read failed')), 0);
    });

    const promise = compressImage(originalFile);

    await expect(promise).rejects.toThrow('Read failed');
  });
});