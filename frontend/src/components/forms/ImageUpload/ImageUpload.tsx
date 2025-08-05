import { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/utils/cn';
import { createImagePreview, revokeImagePreview } from '@/utils/helpers';
import { validateImageFile } from '@/utils/validators';
import { VALIDATION_MESSAGES } from '@/utils/constants';
import { convertHEICToJPEG, isHEICSupported } from '@/utils/imageConverter';
import { ImageProcessor } from '@/utils/imageProcessor';
import { CameraCapture } from '../CameraCapture';
import { isMediaStreamSupported } from '@/utils/camera';
import { trackEvent } from '@/utils/analytics';

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
      
      // Process image (HEIC conversion and compression)
      try {
        console.log('Processing image:', file.name, file.type, file.size);
        processedFile = await ImageProcessor.processImage(file, {
          maxWidth: 1920,
          maxHeight: 1920,
          quality: 0.9,
          format: 'jpeg'
        });
        console.log('Image processed:', processedFile.name, processedFile.type, processedFile.size);
      } catch (processingError) {
        console.warn('Image processing failed, using original:', processingError);
        // Continue with original file if processing fails
      }
      
      // Create preview
      previewUrl = createImagePreview(processedFile);
      
      setPreview(previewUrl);
      onUpload(processedFile, previewUrl);
    } catch {
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
    
    // Track camera button click
    trackEvent('button_click', {
      button_name: 'image_upload_camera',
      page: 'upload',
      action: 'open_camera',
      method: supportsMediaStream ? 'media_stream' : 'file_input',
      user_flow_step: 'camera_selection'
    });
    
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
            'relative rounded-3xl p-12 transition-all min-h-[280px]',
            'flex flex-col items-center justify-center text-center',
            'bg-gradient-to-b from-gray-50/50 to-gray-100/50',
            isDragging ? 'scale-105 shadow-2xl' : '',
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
          )}
          onClick={!disabled ? handleButtonClick : undefined}
        >
          {/* Camera Icon */}
          <div className={cn(
            'w-20 h-20 rounded-full flex items-center justify-center mb-4',
            'bg-gradient-to-br from-primary-600 to-primary-700',
            'shadow-xl transform transition-transform',
            isDragging ? 'scale-110' : ''
          )}>
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              className="text-white drop-shadow-md"
            >
              <path
                d="M23 19C23 20.1046 22.1046 21 21 21H3C1.89543 21 1 20.1046 1 19V8C1 6.89543 1.89543 6 3 6H7L9 3H15L17 6H21C22.1046 6 23 6.89543 23 8V19Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>

          <p className="text-lg font-medium text-gray-800 mb-1">
            {isDragging ? 'Drop your photo' : 'Add your photo'}
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Tap to choose or drag here
          </p>

          {/* Simplified Mobile Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCameraClick}
              className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-full text-sm font-bold shadow-lg hover:shadow-xl hover:from-primary-700 hover:to-primary-800 transform hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
              disabled={disabled}
            >
              📷 Camera
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                
                // Track gallery button click
                trackEvent('button_click', {
                  button_name: 'image_upload_gallery',
                  page: 'upload',
                  action: 'open_gallery',
                  user_flow_step: 'gallery_selection'
                });
                
                handleButtonClick();
              }}
              className="px-6 py-3 bg-gradient-to-r from-secondary-400 to-secondary-500 text-white rounded-full text-sm font-bold shadow-lg hover:shadow-xl hover:from-secondary-500 hover:to-secondary-600 transform hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
              disabled={disabled}
            >
              🖼️ Gallery
            </button>
          </div>
        </div>
      ) : (
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100 shadow-xl">
          <img
            src={preview}
            alt="Your photo"
            className="w-full h-auto max-h-80 object-cover"
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
            onClick={() => {
              // Track remove image button click
              trackEvent('button_click', {
                button_name: 'image_upload_remove',
                page: 'upload',
                action: 'remove_image',
                user_flow_step: 'image_removed'
              });
              
              handleRemove();
            }}
            className="absolute top-3 right-3 w-10 h-10 bg-black/20 backdrop-blur-lg rounded-full flex items-center justify-center hover:bg-black/30 transition-colors"
            aria-label="Remove"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
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