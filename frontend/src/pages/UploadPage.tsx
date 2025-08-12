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
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="text-center pt-12 pb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Upload Your Photo
          </h1>
        </div>

        {/* Main Photo Area */}
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          {/* Photo Preview/Upload Area */}
          <div className="relative w-full max-w-sm aspect-[3/4] mb-8">
            {previewUrl ? (
              // Show uploaded image with face detection guide
              <div className="relative w-full h-full rounded-3xl overflow-hidden bg-white shadow-lg">
                <img 
                  src={previewUrl} 
                  alt="Uploaded photo" 
                  className="w-full h-full object-cover"
                />
                {/* Face detection guide overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div 
                    className="border-4 border-white border-dashed rounded-full opacity-80"
                    style={{
                      width: '70%',
                      aspectRatio: '1',
                      borderStyle: 'dashed',
                      borderWidth: '3px'
                    }}
                  />
                </div>
              </div>
            ) : (
              // Show upload placeholder
              <div 
                className="relative w-full h-full rounded-3xl bg-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.capture = 'environment';
                  input.onchange = async (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      try {
                        const preview = URL.createObjectURL(file);
                        await handleImageUpload(file, preview);
                      } catch (error) {
                        handleImageError('Failed to process image');
                      }
                    }
                  };
                  input.click();
                }}
              >
                {/* Placeholder content */}
                <div className="text-center text-gray-500">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-300 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium">Tap to add photo</p>
                </div>
                
                {/* Face guide overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div 
                    className="border-4 border-gray-400 border-dashed rounded-full opacity-30"
                    style={{
                      width: '70%',
                      aspectRatio: '1',
                      borderStyle: 'dashed',
                      borderWidth: '3px'
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl max-w-sm w-full">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Guidelines */}
          <div className="bg-white rounded-2xl p-6 mx-4 mb-8 shadow-sm border border-gray-100 max-w-sm w-full">
            <div className="grid grid-cols-3 gap-6">
              {/* No filters */}
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-black rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-700">No filters</p>
              </div>

              {/* Natural lighting */}
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-black rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-700">Natural lighting</p>
              </div>

              {/* Front facing */}
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-black rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-700">Front facing</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="pb-safe-area-inset-bottom pb-8">
          <div className="flex items-center justify-center gap-8 px-8">
            {/* Camera Button */}
            <button
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.capture = 'environment';
                input.onchange = async (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    try {
                      const preview = URL.createObjectURL(file);
                      await handleImageUpload(file, preview);
                    } catch (error) {
                      handleImageError('Failed to process image');
                    }
                  }
                };
                input.click();
              }}
              disabled={isCompressing}
              className="w-16 h-16 bg-white border-4 border-black rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {isCompressing ? (
                <svg className="animate-spin w-6 h-6 text-black" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
              ) : (
                <div className="w-12 h-12 bg-white rounded-full"></div>
              )}
            </button>

            {/* Flip Camera Button */}
            <button
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.capture = 'user'; // Front camera
                input.onchange = async (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    try {
                      const preview = URL.createObjectURL(file);
                      await handleImageUpload(file, preview);
                    } catch (error) {
                      handleImageError('Failed to process image');
                    }
                  }
                };
                input.click();
              }}
              className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {/* Analyze Button - Only show when image is selected */}
          {selectedFile && previewUrl && (
            <div className="px-8 mt-6">
              <button
                onClick={handleAnalyze}
                disabled={isCompressing}
                className="w-full bg-primary-600 text-white font-semibold py-4 px-6 rounded-2xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
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
                  '🎨 Analyze My Colors'
                )}
              </button>
            </div>
          )}
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