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
    // 모바일 기기인지 확인
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    
    if (isMobile) {
      // 모바일에서는 capture 속성이 있는 input을 사용
      cameraInputRef.current?.click();
    } else {
      // 데스크톱에서는 미디어 스트림 API 사용 시도
      alert('모바일 기기에서 카메라 촬영 기능을 사용해주세요.');
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
        카메라로 촬영
      </button>
    </>
  );
};