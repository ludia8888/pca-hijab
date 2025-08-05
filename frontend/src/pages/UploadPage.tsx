import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';
import { compressImage } from '@/utils/helpers';
import { useAppStore } from '@/store';
import { Button, Card, PrivacyPopup, PrivacyAssurance } from '@/components/ui';
import { ImageUpload } from '@/components/forms';
import { PageLayout } from '@/components/layout/PageLayout';
import { PersonalColorAPI } from '@/services/api/personalColor';
import { trackImageUpload, trackEvent, trackEngagement, trackError, trackDropOff } from '@/utils/analytics';

const UploadPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { sessionId, setUploadedImage, setLoading, setError, error } = useAppStore();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [showPrivacyPopup, setShowPrivacyPopup] = useState(false);
  const [showPrivacyAssurance, setShowPrivacyAssurance] = useState(true);

  // Redirect if no session
  useEffect(() => {
    console.log('[UploadPage] Checking session, sessionId:', sessionId);
    if (!sessionId) {
      console.log('[UploadPage] No session found, redirecting to home...');
      trackDropOff('upload_page', 'no_session');
      navigate(ROUTES.HOME);
    } else {
      console.log('[UploadPage] Session found, user can upload image');
      // Track successful page entry
      trackEvent('page_enter', {
        page: 'upload',
        user_flow_step: 'upload_page_entered',
        has_session: true
      });
    }
  }, [sessionId, navigate]);

  // Pre-warm API on component mount (production only)
  useEffect(() => {
    if (import.meta.env.PROD) {
      // Skip health check for now to avoid 404 errors
      // PersonalColorAPI.healthCheck().catch(err => {
      //   console.log('API pre-warming failed:', err);
      // });
    }
  }, []);

  const handleImageUpload = async (file: File, preview: string): Promise<void> => {
    setSelectedFile(file);
    setPreviewUrl(preview);
    setError(null);
    
    // Track image upload success
    trackImageUpload(true, file.size, file.type);
  };

  const handleImageError = (error: string): void => {
    setError(error);
    
    // Track image upload failure with detailed error
    trackImageUpload(false, undefined, undefined, error);
    trackError('image_upload_error', error, 'upload_page');
  };

  const handleAnalyze = async (): Promise<void> => {
    if (!selectedFile || !previewUrl) return;

    try {
      setIsCompressing(true);
      setLoading(true);

      // Track AI analysis start with enhanced data
      trackEvent('button_click', {
        button_name: 'analyze_my_colors',
        page: 'upload',
        file_size_mb: Math.round(selectedFile.size / (1024 * 1024) * 100) / 100,
        file_type: selectedFile.type,
        user_flow_step: 'analysis_button_clicked'
      });

      trackEngagement('button_click', 'analyze_my_colors_button');

      // Compress image before storing
      const compressedFile = await compressImage(selectedFile);
      
      // Store compressed image and preview
      setUploadedImage(previewUrl, compressedFile);
      
      // Navigate to analysis page
      navigate(ROUTES.ANALYZING);
    } catch (error) {
      const errorMessage = 'An error occurred while processing the image. Please try again.';
      setError(errorMessage);
      trackError('image_compression_error', error instanceof Error ? error.message : 'Unknown error', 'upload_page');
    } finally {
      setIsCompressing(false);
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="max-w-md mx-auto w-full pb-20">
        {/* Minimal Instructions */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Upload Your Photo
          </h2>
          <p className="text-gray-500 text-sm">
            Natural lighting • No filters • Front facing
          </p>
        </div>

        {/* Minimal Error Display */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-2xl">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Glass Morphism Upload Area */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary-light/20 rounded-3xl blur-xl" />
          <div className="relative bg-white/70 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
            <ImageUpload
              onUpload={handleImageUpload}
              onError={handleImageError}
              disabled={isCompressing}
            />
          </div>
        </div>

        {/* Floating Action Button */}
        {selectedFile && previewUrl && (
          <div className="fixed bottom-24 left-0 right-0 px-5 z-40">
            <button
              onClick={handleAnalyze}
              disabled={isCompressing}
              className="w-full max-w-md mx-auto block bg-gradient-to-r from-primary to-primary-light text-white font-medium py-4 px-8 rounded-full shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCompressing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                'Analyze My Colors'
              )}
            </button>
          </div>
        )}

        {/* Minimal Privacy Link */}
        <div className="text-center mt-8">
          <button
            onClick={() => setShowPrivacyPopup(true)}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Privacy Policy
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