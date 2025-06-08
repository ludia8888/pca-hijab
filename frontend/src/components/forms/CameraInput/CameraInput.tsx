import { useRef } from 'react';

interface CameraInputProps {
  onCapture: (file: File) => void;
  disabled?: boolean;
  className?: string;
}

export const CameraInput = ({ 
  onCapture, 
  disabled = false,
  className = ''
}: CameraInputProps): JSX.Element => {
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      onCapture(file);
    }
    // Reset the input so the same file can be selected again
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  };

  const openCamera = (): void => {
    // Check if mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    
    if (isMobile) {
      // On mobile, use input with capture attribute
      cameraInputRef.current?.click();
    } else {
      // On desktop, attempt to use media stream API
      alert('Please use the camera feature on a mobile device.');
    }
  };

  return (
    <>
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={handleCameraCapture}
        className="hidden"
        disabled={disabled}
      />
      <button
        type="button"
        onClick={openCamera}
        className={className}
        disabled={disabled}
      >
        Take Photo
      </button>
    </>
  );
};