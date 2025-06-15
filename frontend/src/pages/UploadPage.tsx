import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';
import { compressImage } from '@/utils/helpers';
import { useAppStore } from '@/store';
import { Button, Card, PrivacyPopup, PrivacyAssurance } from '@/components/ui';
import { Header, PageLayout } from '@/components/layout';
import { ImageUpload } from '@/components/forms';
import { PersonalColorAPI } from '@/services/api/personalColor';

const UploadPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { instagramId, setUploadedImage, setLoading, setError, error } = useAppStore();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [showPrivacyPopup, setShowPrivacyPopup] = useState(false);
  const [showPrivacyAssurance, setShowPrivacyAssurance] = useState(true);

  // Redirect if no Instagram ID
  useEffect(() => {
    if (!instagramId) {
      navigate(ROUTES.HOME);
    }
  }, [instagramId, navigate]);

  // Pre-warm API on component mount (production only)
  useEffect(() => {
    if (import.meta.env.PROD) {
      PersonalColorAPI.healthCheck().catch(err => {
        console.log('API pre-warming failed:', err);
      });
    }
  }, []);

  const handleImageUpload = async (file: File, preview: string): Promise<void> => {
    setSelectedFile(file);
    setPreviewUrl(preview);
    setError(null);
  };

  const handleImageError = (error: string): void => {
    setError(error);
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
      setError('An error occurred while processing the image. Please try again.');
    } finally {
      setIsCompressing(false);
      setLoading(false);
    }
  };

  return (
    <PageLayout 
      header={
        <Header 
          title="Upload Photo" 
          showBack 
          onBack={() => navigate(ROUTES.HOME)}
        />
      }
    >
      <div className="max-w-2xl mx-auto w-full space-y-6">
        {/* Instructions */}
        <Card>
          <h2 className="text-h3 font-bold text-gray-900 mb-4">
            Please upload your face photo
          </h2>
          
          <div className="space-y-3 text-body-sm text-gray-600">
            <h3 className="font-semibold text-gray-700">📸 Photo Guidelines</h3>
            <ul className="space-y-2 ml-6">
              <li className="flex items-start">
                <span className="text-success mr-2">✓</span>
                <span>Front-facing photo</span>
              </li>
              <li className="flex items-start">
                <span className="text-success mr-2">✓</span>
                <span>Taken in bright natural light or white lighting</span>
              </li>
              <li className="flex items-start">
                <span className="text-success mr-2">✓</span>
                <span>No makeup or light makeup</span>
              </li>
              <li className="flex items-start">
                <span className="text-error mr-2">✗</span>
                <span>Photos with filters or color correction</span>
              </li>
              <li className="flex items-start">
                <span className="text-error mr-2">✗</span>
                <span>Photos with shadows or backlighting</span>
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
                  Close
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
            {isCompressing ? 'Processing image...' : 'Start Analysis'}
          </Button>
        )}

        {/* Privacy Link */}
        <div className="text-center mt-4">
          <button
            onClick={() => setShowPrivacyPopup(true)}
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-current">
              <path d="M12 2L4 7V11C4 16 7.5 20.3 12 21C16.5 20.3 20 16 20 11V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Privacy & Security Information</span>
          </button>
        </div>
        
        {/* Privacy Popup */}
        <PrivacyPopup 
          isOpen={showPrivacyPopup} 
          onClose={() => setShowPrivacyPopup(false)} 
        />
        
        {/* Privacy Assurance - Auto popup */}
        {showPrivacyAssurance && (
          <PrivacyAssurance 
            onClose={() => setShowPrivacyAssurance(false)}
            autoClose={true}
            autoCloseDelay={7000}
          />
        )}
      </div>
    </PageLayout>
  );
};

export default UploadPage;