import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CameraCapture } from '../CameraCapture';

// Mock MediaStream and related APIs
const mockMediaStream = {
  getTracks: vi.fn(() => [
    { stop: vi.fn(), kind: 'video' }
  ]),
  getVideoTracks: vi.fn(() => [
    { stop: vi.fn(), kind: 'video' }
  ])
};

const mockGetUserMedia = vi.fn();

describe('CameraCapture', () => {
  const mockOnCapture = vi.fn();
  const mockOnClose = vi.fn();
  
  // Suppress console errors
  const originalError = console.error;
  
  beforeAll(() => {
    console.error = (...args: any[]) => {
      if (args[0]?.includes?.('Camera access error')) {
        return;
      }
      originalError(...args);
    };
  });
  
  afterAll(() => {
    console.error = originalError;
  });

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock canvas methods
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      drawImage: vi.fn(),
    })) as any;
    
    HTMLCanvasElement.prototype.toBlob = vi.fn((callback) => {
      callback(new Blob(['mock-image'], { type: 'image/jpeg' }));
    }) as any;
    
    // Mock video element play
    HTMLVideoElement.prototype.play = vi.fn().mockResolvedValue(undefined);
    
    // Set up getUserMedia mock
    mockGetUserMedia.mockResolvedValue(mockMediaStream);
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: mockGetUserMedia,
      },
      configurable: true,
    });
  });

  afterEach(() => {
    // Clean up mocks
    vi.restoreAllMocks();
  });

  describe('렌더링', () => {
    it('should render camera interface', () => {
      render(<CameraCapture onCapture={mockOnCapture} onClose={mockOnClose} />);
      
      expect(screen.getByRole('button', { name: '닫기' })).toBeInTheDocument();
    });

    it('should show loading state initially', () => {
      render(<CameraCapture onCapture={mockOnCapture} onClose={mockOnClose} />);
      
      // Check for loading text
      expect(screen.getByText('카메라를 준비하고 있습니다...')).toBeInTheDocument();
    });
  });

  describe('카메라 권한', () => {
    it('should request camera permission on mount', async () => {
      render(<CameraCapture onCapture={mockOnCapture} onClose={mockOnClose} />);
      
      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalledWith({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
      });
    });

    it('should handle camera permission denied', async () => {
      mockGetUserMedia.mockRejectedValueOnce(new Error('Permission denied'));
      
      render(<CameraCapture onCapture={mockOnCapture} onClose={mockOnClose} />);
      
      await waitFor(() => {
        expect(screen.getByText('카메라 접근 권한이 필요합니다.')).toBeInTheDocument();
      });
    });

    it('should show retry button on error', async () => {
      mockGetUserMedia.mockRejectedValueOnce(new Error('Permission denied'));
      
      render(<CameraCapture onCapture={mockOnCapture} onClose={mockOnClose} />);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument();
      });
    });

    it('should retry camera access when retry button clicked', async () => {
      const user = userEvent.setup();
      mockGetUserMedia
        .mockRejectedValueOnce(new Error('Permission denied'))
        .mockResolvedValueOnce(mockMediaStream);
      
      render(<CameraCapture onCapture={mockOnCapture} onClose={mockOnClose} />);
      
      await waitFor(() => {
        expect(screen.getByText('카메라 접근 권한이 필요합니다.')).toBeInTheDocument();
      });
      
      const retryButton = screen.getByRole('button', { name: '다시 시도' });
      await user.click(retryButton);
      
      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('카메라 캡처', () => {
    it('should capture photo when capture button clicked', async () => {
      const user = userEvent.setup();
      
      // Mock successful camera initialization
      mockGetUserMedia.mockResolvedValueOnce(mockMediaStream);
      
      let renderResult;
      await act(async () => {
        renderResult = render(<CameraCapture onCapture={mockOnCapture} onClose={mockOnClose} />);
      });
      
      // Wait for camera to initialize and capture button to appear
      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalled();
      });
      
      // Since the camera permission was granted, wait for capture button
      await waitFor(() => {
        const captureButton = screen.queryByRole('button', { name: '촬영' });
        expect(captureButton).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Find and click capture button
      const captureButton = screen.getByRole('button', { name: '촬영' });
      
      await act(async () => {
        await user.click(captureButton);
      });
      
      await waitFor(() => {
        expect(mockOnCapture).toHaveBeenCalledWith(
          expect.any(File)
        );
      });
      
      const capturedFile = mockOnCapture.mock.calls[0][0];
      expect(capturedFile.name).toMatch(/photo_\d+\.jpg/);
      expect(capturedFile.type).toBe('image/jpeg');
    });

    it('should show capture controls when camera is ready', async () => {
      mockGetUserMedia.mockResolvedValueOnce(mockMediaStream);
      
      await act(async () => {
        render(<CameraCapture onCapture={mockOnCapture} onClose={mockOnClose} />);
      });
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: '촬영' })).toBeInTheDocument();
      });
    });
  });

  describe('인터페이스 제어', () => {
    it('should close when close button clicked', async () => {
      const user = userEvent.setup();
      
      render(<CameraCapture onCapture={mockOnCapture} onClose={mockOnClose} />);
      
      const closeButton = screen.getByRole('button', { name: '닫기' });
      await user.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should stop camera stream when closing', async () => {
      const user = userEvent.setup();
      const mockStop = vi.fn();
      const mockStreamWithStop = {
        ...mockMediaStream,
        getTracks: vi.fn(() => [{ stop: mockStop }])
      };
      
      mockGetUserMedia.mockResolvedValue(mockStreamWithStop);
      
      render(<CameraCapture onCapture={mockOnCapture} onClose={mockOnClose} />);
      
      // Wait for camera to start
      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalled();
      });
      
      // Close the camera
      const closeButton = screen.getByRole('button', { name: '닫기' });
      await user.click(closeButton);
      
      expect(mockStop).toHaveBeenCalled();
    });
  });

  describe('접근성', () => {
    it('should have proper ARIA labels', () => {
      render(<CameraCapture onCapture={mockOnCapture} onClose={mockOnClose} />);
      
      expect(screen.getByRole('button', { name: '닫기' })).toHaveAttribute('aria-label', '닫기');
    });

    it('should have proper video attributes', () => {
      render(<CameraCapture onCapture={mockOnCapture} onClose={mockOnClose} />);
      
      // Find video element by tag name
      const video = document.querySelector('video') as HTMLVideoElement;
      expect(video).toBeInTheDocument();
      expect(video).toHaveAttribute('muted');
      expect(video).toHaveAttribute('playsInline');
    });
  });

  describe('클린업', () => {
    it('should stop camera stream on unmount', async () => {
      const mockStop = vi.fn();
      const mockStreamWithStop = {
        ...mockMediaStream,
        getTracks: vi.fn(() => [{ stop: mockStop }])
      };
      
      mockGetUserMedia.mockResolvedValue(mockStreamWithStop);
      
      const { unmount } = render(<CameraCapture onCapture={mockOnCapture} onClose={mockOnClose} />);
      
      // Wait for camera to start
      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalled();
      });
      
      // Unmount component
      unmount();
      
      expect(mockStop).toHaveBeenCalled();
    });
  });
});