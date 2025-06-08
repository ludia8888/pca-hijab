import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';
import { compressImage } from '@/utils/helpers';
import { useAppStore } from '@/store';
import { Button, Card } from '@/components/ui';
import { Header, PageLayout } from '@/components/layout';
import { ImageUpload } from '@/components/forms';

const UploadPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { instagramId, setUploadedImage, setLoading, setError, error } = useAppStore();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  // Redirect if no Instagram ID
  useEffect(() => {
    if (!instagramId) {
      navigate(ROUTES.HOME);
    }
  }, [instagramId, navigate]);

  const handleImageUpload = async (file: File, preview: string): Promise<void> => {
    setSelectedFile(file);
    setPreviewUrl(preview);
    setError(null);
  };

  const handleImageError = (error: string): void => {
    setError(error);
    // Log error for debugging
    console.error('Image upload error:', error);
  };

  const handleAnalyze = async (): Promise<void> => {
    if (!selectedFile || !previewUrl) return;

    try {
      setIsCompressing(true);
      setLoading(true);

      // Compress image before storing
      const compressedFile = await compressImage(selectedFile);
      
      // Store compressed image and preview
      setUploadedImage(previewUrl, compressedFile);
      
      // Navigate to analysis page
      navigate(ROUTES.ANALYZING);
    } catch {
      setError('이미지 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsCompressing(false);
      setLoading(false);
    }
  };

  return (
    <PageLayout 
      header={
        <Header 
          title="사진 업로드" 
          showBack 
          onBack={() => navigate(ROUTES.HOME)}
        />
      }
    >
      <div className="max-w-2xl mx-auto w-full space-y-6">
        {/* Instructions */}
        <Card>
          <h2 className="text-h3 font-bold text-gray-900 mb-4">
            얼굴 사진을 업로드해주세요
          </h2>
          
          <div className="space-y-3 text-body-sm text-gray-600">
            <h3 className="font-semibold text-gray-700">📸 촬영 가이드</h3>
            <ul className="space-y-2 ml-6">
              <li className="flex items-start">
                <span className="text-success mr-2">✓</span>
                <span>정면을 바라본 사진</span>
              </li>
              <li className="flex items-start">
                <span className="text-success mr-2">✓</span>
                <span>밝은 자연광 또는 흰색 조명 아래에서 촬영</span>
              </li>
              <li className="flex items-start">
                <span className="text-success mr-2">✓</span>
                <span>화장을 하지 않거나 가벼운 화장 상태</span>
              </li>
              <li className="flex items-start">
                <span className="text-error mr-2">✗</span>
                <span>필터 사용, 색조 보정된 사진</span>
              </li>
              <li className="flex items-start">
                <span className="text-error mr-2">✗</span>
                <span>그림자가 많거나 역광인 사진</span>
              </li>
            </ul>
          </div>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="bg-error/10 border-error">
            <div className="flex items-start space-x-3">
              <svg
                className="w-5 h-5 text-error flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div className="flex-1">
                <p className="text-error font-medium">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="text-sm text-error underline mt-1"
                >
                  닫기
                </button>
              </div>
            </div>
          </Card>
        )}

        {/* Image Upload */}
        <Card>
          <ImageUpload
            onUpload={handleImageUpload}
            onError={handleImageError}
            disabled={isCompressing}
          />
        </Card>

        {/* Action Button */}
        {selectedFile && previewUrl && (
          <Button
            fullWidth
            size="lg"
            onClick={handleAnalyze}
            loading={isCompressing}
            className="animate-fade-in"
          >
            {isCompressing ? '이미지 처리 중...' : '분석 시작하기'}
          </Button>
        )}

        {/* Privacy Notice */}
        <p className="text-caption text-gray-500 text-center mt-4">
          업로드하신 사진은 분석 목적으로만 사용되며,
          <br />
          분석 완료 후 즉시 삭제됩니다.
        </p>
      </div>
    </PageLayout>
  );
};

export default UploadPage;