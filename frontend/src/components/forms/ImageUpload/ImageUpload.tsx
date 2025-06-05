import { useState, useRef, useCallback } from 'react';
import { cn } from '@/utils/cn';
import { validateImageFile, createImagePreview, revokeImagePreview } from '@/utils/helpers';
import { VALIDATION_MESSAGES } from '@/utils/constants';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    const validation = validateImageFile(file);
    
    if (!validation.isValid) {
      onError(VALIDATION_MESSAGES[validation.error as keyof typeof VALIDATION_MESSAGES]);
      return;
    }

    const previewUrl = createImagePreview(file);
    setPreview(previewUrl);
    onUpload(file, previewUrl);
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

  return (
    <div className={cn('w-full', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
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
            {isDragging ? '여기에 놓으세요' : '클릭하여 사진 선택'}
          </p>
          <p className="text-body-sm text-gray-500">
            또는 파일을 여기로 드래그하세요
          </p>
          <p className="text-caption text-gray-400 mt-2">
            JPG, PNG, HEIC (최대 10MB)
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
              갤러리에서 선택
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                // For camera capture on mobile
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.capture = 'user';
                input.onchange = (event) => {
                  const file = (event.target as HTMLInputElement).files?.[0];
                  if (file) handleFile(file);
                };
                input.click();
              }}
              className="flex-1 px-4 py-2 bg-white text-primary border border-primary rounded-lg font-medium hover:bg-gray-50 transition-colors"
              disabled={disabled}
            >
              카메라로 촬영
            </button>
          </div>
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden bg-gray-100">
          <img
            src={preview}
            alt="업로드된 이미지"
            className="w-full h-auto max-h-96 object-contain"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-4 right-4 p-2 bg-white/90 rounded-lg shadow-md hover:bg-white transition-colors"
            aria-label="이미지 제거"
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
    </div>
  );
};