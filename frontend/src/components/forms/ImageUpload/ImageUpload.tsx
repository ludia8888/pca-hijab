import { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/utils/cn';
import { createImagePreview, revokeImagePreview } from '@/utils/helpers';
import { validateImageFile } from '@/utils/validators';
import { VALIDATION_MESSAGES } from '@/utils/constants';
import { convertHEICToJPEG, isHEICSupported } from '@/utils/imageConverter';
import { CameraCapture } from '../CameraCapture';
import { isMediaStreamSupported } from '@/utils/camera';

interface ImageUploadProps {
  onUpload: (file: File, preview: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

export const ImageUpload = ({
  onUpload,
  onError,
  disabled = false,
  className,
}: ImageUploadProps): JSX.Element => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [supportsMediaStream, setSupportsMediaStream] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    const validation = validateImageFile(file);
    
    if (!validation.isValid) {
      onError(VALIDATION_MESSAGES[validation.error as keyof typeof VALIDATION_MESSAGES]);
      return;
    }

    try {
      let processedFile = file;
      let previewUrl: string;
      
      // Check if it's a HEIC file and needs conversion
      const isHEIC = file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic');
      
      if (isHEIC && !isHEICSupported()) {
        try {
          // Try to convert HEIC to JPEG
          processedFile = await convertHEICToJPEG(file);
          previewUrl = createImagePreview(processedFile);
        } catch (conversionError) {
          // If conversion fails, show error to user
          console.error('HEIC conversion failed:', conversionError);
          onError(conversionError instanceof Error ? conversionError.message : 'Failed to convert HEIC file.');
          return;
        }
      } else {
        previewUrl = createImagePreview(processedFile);
      }
      
      setPreview(previewUrl);
      onUpload(processedFile, previewUrl);
    } catch (error) {
      console.error('Error handling image:', error);
      onError('An error occurred while processing the image.');
    }
  }, [onUpload, onError]);

  const handleDragOver = (e: React.DragEvent): void => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent): void => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent): void => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleButtonClick = (): void => {
    fileInputRef.current?.click();
  };

  const handleRemove = (): void => {
    if (preview) {
      revokeImagePreview(preview);
      setPreview(null);
    }
  };

  const handleCameraClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    if (supportsMediaStream) {
      setShowCamera(true);
    } else {
      // Fallback to file input with camera capture
      cameraInputRef.current?.click();
    }
  };

  // Check MediaStream support on mount
  useEffect(() => {
    setSupportsMediaStream(isMediaStreamSupported());
  }, []);

  return (
    <div className={cn('w-full', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/heic,image/heif"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />
      
      {/* Hidden camera input for fallback */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {!preview ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'relative border-2 border-dashed rounded-xl p-8 transition-all',
            'flex flex-col items-center justify-center text-center',
            isDragging ? 'border-primary bg-primary/5' : 'border-gray-300',
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400',
          )}
          onClick={!disabled ? handleButtonClick : undefined}
        >
          {/* Upload icon */}
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn('mb-4', isDragging ? 'text-primary' : 'text-gray-400')}
          >
            <path
              d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C19.8587 21 19.149 21 17.7397 21H6.26031C4.85103 21 4.14639 21 3.59102 20.4142C3 19.7893 3 19.2478 3 18.1649V15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 3V15M12 3L8 7M12 3L16 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <p className="text-body font-medium text-gray-700 mb-2">
            {isDragging ? 'Drop here' : 'Click to select photo'}
          </p>
          <p className="text-body-sm text-gray-500">
            Or drag and drop your file here
          </p>
          <p className="text-caption text-gray-400 mt-2">
            JPG, PNG, HEIC (max 10MB)
          </p>

          {/* Mobile-specific buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6 w-full max-w-xs">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleButtonClick();
              }}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
              disabled={disabled}
            >
              Select from Gallery
            </button>
            <button
              type="button"
              onClick={handleCameraClick}
              className="flex-1 px-4 py-2 bg-white text-primary border border-primary rounded-lg font-medium hover:bg-gray-50 transition-colors"
              disabled={disabled}
            >
              Take Photo
            </button>
          </div>
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden bg-gray-100">
          <img
            src={preview}
            alt="Uploaded image"
            className="w-full h-auto max-h-96 object-contain"
            onError={(e) => {
              // Fallback for failed image loads
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallbackDiv = document.createElement('div');
              fallbackDiv.className = 'flex items-center justify-center h-96 bg-gray-100';
              fallbackDiv.innerHTML = '<p class="text-gray-500">HEIC file preview</p>';
              target.parentElement?.appendChild(fallbackDiv);
            }}
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-4 right-4 p-2 bg-white/90 rounded-lg shadow-md hover:bg-white transition-colors"
            aria-label="Remove image"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-gray-700"
            >
              <path
                d="M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Camera Capture Modal */}
      {showCamera && (
        <CameraCapture
          onCapture={(file) => {
            setShowCamera(false);
            handleFile(file);
          }}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
};