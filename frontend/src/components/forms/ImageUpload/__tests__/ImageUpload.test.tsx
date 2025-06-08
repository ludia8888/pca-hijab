import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ImageUpload } from '../ImageUpload';

// Mock dependencies
vi.mock('@/utils/camera', () => ({
  isMediaStreamSupported: vi.fn(() => true)
}));

vi.mock('@/utils/imageConverter', () => ({
  isHEICSupported: vi.fn(() => false),
  convertHEICToJPEG: vi.fn((file) => Promise.resolve(file)),
  createHEICFallbackPreview: vi.fn(() => 'data:image/svg+xml;base64,test')
}));

vi.mock('@/utils/helpers', () => ({
  createImagePreview: vi.fn((file) => `preview-${file.name}`),
  revokeImagePreview: vi.fn()
}));

// Simple mock for CameraCapture to avoid MediaStream errors
const MockCameraCapture = ({ onCapture, onClose }: any) => (
  <div data-testid="camera-capture">
    <button onClick={() => onCapture(new File([''], 'camera.jpg', { type: 'image/jpeg' }))}>
      Capture
    </button>
    <button onClick={onClose}>Close</button>
  </div>
);

vi.mock('../CameraCapture', () => ({
  CameraCapture: MockCameraCapture
}));

describe('ImageUpload', () => {
  const mockOnUpload = vi.fn();
  const mockOnError = vi.fn();
  
  // Suppress console errors from MediaStream in tests
  const originalError = console.error;
  
  beforeAll(() => {
    console.error = (...args: any[]) => {
      if (args[0]?.includes?.('Camera access error') || 
          args[0]?.includes?.('Not available in test environment')) {
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
  });

  describe('렌더링', () => {
    it('should render upload area', () => {
      render(<ImageUpload onUpload={mockOnUpload} onError={mockOnError} />);
      
      expect(screen.getByText('클릭하여 사진 선택')).toBeInTheDocument();
      expect(screen.getByText('또는 파일을 여기로 드래그하세요')).toBeInTheDocument();
      expect(screen.getByText('JPG, PNG, HEIC (최대 10MB)')).toBeInTheDocument();
    });

    it('should render gallery and camera buttons', () => {
      render(<ImageUpload onUpload={mockOnUpload} onError={mockOnError} />);
      
      expect(screen.getByRole('button', { name: '갤러리에서 선택' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '카메라로 촬영' })).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(
        <ImageUpload 
          onUpload={mockOnUpload} 
          onError={mockOnError} 
          className="custom-class" 
        />
      );
      
      const container = screen.getByText('클릭하여 사진 선택').closest('.w-full');
      expect(container).toHaveClass('custom-class');
    });
  });

  describe('파일 선택', () => {
    it('should handle file selection via input', async () => {
      const user = userEvent.setup();
      render(<ImageUpload onUpload={mockOnUpload} onError={mockOnError} />);
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      // Find the file input by its accept attribute
      const input = document.querySelector('input[accept="image/jpeg,image/jpg,image/png,image/heic,image/heif"]') as HTMLInputElement;
      
      await user.upload(input, file);
      
      await waitFor(() => {
        expect(mockOnUpload).toHaveBeenCalledWith(file, expect.stringContaining('preview-test.jpg'));
      });
    });

    it('should validate file before upload', async () => {
      const user = userEvent.setup();
      render(<ImageUpload onUpload={mockOnUpload} onError={mockOnError} />);
      
      // Create a large file (over 5MB)
      const largeFile = new File([new ArrayBuffer(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
      const input = document.querySelector('input[accept="image/jpeg,image/jpg,image/png,image/heic,image/heif"]') as HTMLInputElement;
      
      await user.upload(input, largeFile);
      
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalled();
        expect(mockOnUpload).not.toHaveBeenCalled();
      });
    });

    it('should handle HEIC files', async () => {
      const { convertHEICToJPEG } = await import('@/utils/imageConverter');
      const mockConvert = convertHEICToJPEG as ReturnType<typeof vi.fn>;
      const convertedFile = new File(['converted'], 'test.jpg', { type: 'image/jpeg' });
      mockConvert.mockResolvedValueOnce(convertedFile);

      const user = userEvent.setup();
      render(<ImageUpload onUpload={mockOnUpload} onError={mockOnError} />);
      
      const heicFile = new File(['heic'], 'test.heic', { type: 'image/heic' });
      const input = document.querySelector('input[accept="image/jpeg,image/jpg,image/png,image/heic,image/heif"]') as HTMLInputElement;
      
      await user.upload(input, heicFile);
      
      await waitFor(() => {
        expect(mockConvert).toHaveBeenCalledWith(heicFile);
        expect(mockOnUpload).toHaveBeenCalledWith(convertedFile, expect.any(String));
      });
    });
  });

  describe('드래그 앤 드롭', () => {
    it('should handle drag over', () => {
      render(<ImageUpload onUpload={mockOnUpload} onError={mockOnError} />);
      
      const dropZone = screen.getByText('클릭하여 사진 선택').closest('div')!;
      
      fireEvent.dragOver(dropZone, {
        dataTransfer: { files: [] }
      });
      
      expect(dropZone).toHaveClass('border-primary');
    });

    it('should handle drag leave', () => {
      render(<ImageUpload onUpload={mockOnUpload} onError={mockOnError} />);
      
      const dropZone = screen.getByText('클릭하여 사진 선택').closest('div')!;
      
      fireEvent.dragOver(dropZone, {
        dataTransfer: { files: [] }
      });
      
      fireEvent.dragLeave(dropZone);
      
      expect(dropZone).not.toHaveClass('border-primary');
    });

    it('should handle file drop', async () => {
      render(<ImageUpload onUpload={mockOnUpload} onError={mockOnError} />);
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const dropZone = screen.getByText('클릭하여 사진 선택').closest('div')!;
      
      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file]
        }
      });
      
      await waitFor(() => {
        expect(mockOnUpload).toHaveBeenCalledWith(file, expect.any(String));
      });
    });

    it('should not handle drop when disabled', () => {
      render(<ImageUpload onUpload={mockOnUpload} onError={mockOnError} disabled />);
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const dropZone = screen.getByText('클릭하여 사진 선택').closest('div')!;
      
      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file]
        }
      });
      
      expect(mockOnUpload).not.toHaveBeenCalled();
    });
  });

  describe('미리보기', () => {
    it('should show preview after file selection', async () => {
      const user = userEvent.setup();
      render(<ImageUpload onUpload={mockOnUpload} onError={mockOnError} />);
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = document.querySelector('input[accept="image/jpeg,image/jpg,image/png,image/heic,image/heif"]') as HTMLInputElement;
      
      await user.upload(input, file);
      
      await waitFor(() => {
        expect(screen.getByAltText('업로드된 이미지')).toBeInTheDocument();
      });
    });

    it('should allow removing preview', async () => {
      const { revokeImagePreview } = await import('@/utils/helpers');
      const user = userEvent.setup();
      
      render(<ImageUpload onUpload={mockOnUpload} onError={mockOnError} />);
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = document.querySelector('input[accept="image/jpeg,image/jpg,image/png,image/heic,image/heif"]') as HTMLInputElement;
      
      await user.upload(input, file);
      
      await waitFor(() => {
        expect(screen.getByAltText('업로드된 이미지')).toBeInTheDocument();
      });
      
      const removeButton = screen.getByRole('button', { name: '이미지 제거' });
      await user.click(removeButton);
      
      expect(revokeImagePreview).toHaveBeenCalled();
      expect(screen.queryByAltText('업로드된 이미지')).not.toBeInTheDocument();
    });
  });

  describe('카메라 기능', () => {
    it('should open camera when camera button is clicked', async () => {
      const user = userEvent.setup();
      render(<ImageUpload onUpload={mockOnUpload} onError={mockOnError} />);
      
      const cameraButton = screen.getByRole('button', { name: '카메라로 촬영' });
      await user.click(cameraButton);
      
      expect(screen.getByTestId('camera-capture')).toBeInTheDocument();
    });

    it('should handle camera capture', async () => {
      const user = userEvent.setup();
      render(<ImageUpload onUpload={mockOnUpload} onError={mockOnError} />);
      
      const cameraButton = screen.getByRole('button', { name: '카메라로 촬영' });
      await user.click(cameraButton);
      
      const captureButton = screen.getByText('Capture');
      await user.click(captureButton);
      
      await waitFor(() => {
        expect(mockOnUpload).toHaveBeenCalledWith(
          expect.objectContaining({ name: 'camera.jpg' }),
          expect.any(String)
        );
      });
    });

    it('should close camera on cancel', async () => {
      const user = userEvent.setup();
      render(<ImageUpload onUpload={mockOnUpload} onError={mockOnError} />);
      
      const cameraButton = screen.getByRole('button', { name: '카메라로 촬영' });
      await user.click(cameraButton);
      
      expect(screen.getByTestId('camera-capture')).toBeInTheDocument();
      
      const closeButton = screen.getByText('Close');
      await user.click(closeButton);
      
      expect(screen.queryByTestId('camera-capture')).not.toBeInTheDocument();
    });

    it('should fallback to file input when MediaStream not supported', async () => {
      const { isMediaStreamSupported } = await import('@/utils/camera');
      (isMediaStreamSupported as ReturnType<typeof vi.fn>).mockReturnValueOnce(false);
      
      const user = userEvent.setup();
      const { rerender } = render(<ImageUpload onUpload={mockOnUpload} onError={mockOnError} />);
      
      // Force re-render to pick up the mock change
      rerender(<ImageUpload onUpload={mockOnUpload} onError={mockOnError} />);
      
      const cameraButton = screen.getByRole('button', { name: '카메라로 촬영' });
      
      // Click should trigger the hidden camera input
      await user.click(cameraButton);
      
      // Camera capture component should not be shown
      expect(screen.queryByTestId('camera-capture')).not.toBeInTheDocument();
    });
  });

  describe('상태 관리', () => {
    it('should disable interactions when disabled prop is true', () => {
      render(<ImageUpload onUpload={mockOnUpload} onError={mockOnError} disabled />);
      
      const galleryButton = screen.getByRole('button', { name: '갤러리에서 선택' });
      const cameraButton = screen.getByRole('button', { name: '카메라로 촬영' });
      
      expect(galleryButton).toBeDisabled();
      expect(cameraButton).toBeDisabled();
    });

    it('should show correct text during drag over', () => {
      render(<ImageUpload onUpload={mockOnUpload} onError={mockOnError} />);
      
      const dropZone = screen.getByText('클릭하여 사진 선택').closest('div')!;
      
      fireEvent.dragOver(dropZone, {
        dataTransfer: { files: [] }
      });
      
      expect(screen.getByText('여기에 놓으세요')).toBeInTheDocument();
    });
  });

  describe('접근성', () => {
    it('should have proper file input attributes', () => {
      render(<ImageUpload onUpload={mockOnUpload} onError={mockOnError} />);
      
      const fileInput = document.querySelector('input[accept="image/jpeg,image/jpg,image/png,image/heic,image/heif"]') as HTMLInputElement;
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveAttribute('type', 'file');
    });

    it('should have proper camera input attributes', () => {
      render(<ImageUpload onUpload={mockOnUpload} onError={mockOnError} />);
      
      const cameraInput = document.querySelector('input[capture="user"]') as HTMLInputElement;
      
      expect(cameraInput).toBeInTheDocument();
      expect(cameraInput).toHaveAttribute('accept', 'image/*');
      expect(cameraInput).toHaveAttribute('type', 'file');
    });
  });
});