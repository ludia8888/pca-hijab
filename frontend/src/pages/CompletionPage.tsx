import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '@/components/ui';
import { ROUTES } from '@/utils/constants';
import { useAppStore } from '@/store';
import { shareOrCopy } from '@/utils/helpers';
import { generateResultCard, downloadResultCard } from '@/utils/resultCardGeneratorV3';
import { trackRecommendationRequest, trackEvent, trackEngagement, trackError, trackDropOff, trackFlowCompletion } from '@/utils/analytics';

const CompletionPage = (): JSX.Element => {
  const navigate = useNavigate();
  const analysisResult = useAppStore((state) => state.analysisResult);
  const reset = useAppStore((state) => state.reset);

  // Redirect if no required data
  useEffect(() => {
    if (!analysisResult) {
      // Track drop-off if user arrives without proper data
      trackDropOff('completion_page', 'missing_required_data');
      navigate(ROUTES.HOME);
    } else {
      // Track successful page entry
      trackEvent('page_enter', {
        page: 'completion',
        user_flow_step: 'completion_page_entered',
        personal_color: analysisResult.personal_color_en
      });

      // Track recommendation request and flow completion with enhanced data
      trackRecommendationRequest('', analysisResult.personal_color_en);
      
      trackFlowCompletion('', analysisResult.personal_color_en);
      
      trackEvent('flow_complete', {
        personal_color: analysisResult.personal_color_en,
        confidence_score: Math.round((analysisResult.confidence || 0) * 100),
        user_flow_step: 'full_flow_completed',
        completion_timestamp: new Date().toISOString()
      });

      // Track high-value conversion event
      trackEvent('conversion', {
        event_category: 'conversion',
        conversion_type: 'recommendation_request_submitted',
        value: 1,
        currency: 'USD',
        personal_color: analysisResult.personal_color_en
      });
    }
  }, [analysisResult, navigate]);

  const handleShare = async (): Promise<void> => {
    try {
      // Track share button click with enhanced data
      trackEvent('button_click', {
        button_name: 'share_app',
        page: 'completion',
        user_flow_step: 'app_share_initiated',
        personal_color: analysisResult?.personal_color_en
      });

      trackEngagement('share', 'app_promotion');
      
      await shareOrCopy({
        title: 'Hijab Personal Color Analysis',
        text: `Get AI personal color analysis and personalized hijab recommendations!`,
        url: window.location.origin,
      });

      // Track successful share
      trackEvent('share_complete', {
        shared_content: 'app_promotion',
        share_location: 'completion_page',
        personal_color: analysisResult?.personal_color_en
      });
    } catch (error) {
      // Track share failure
      trackError('app_share_failed', error instanceof Error ? error.message : 'Unknown share error', 'completion_page');
    }
  };

  const handleSaveResult = async (): Promise<void> => {
    if (!analysisResult) return;
    
    try {
      // Track save result button click with enhanced data
      trackEvent('button_click', {
        button_name: 'save_result_image',
        page: 'completion',
        user_flow_step: 'completion_image_save_initiated',
        personal_color: analysisResult.personal_color_en
      });

      trackEngagement('download', 'completion_result_image');
      
      // Generate the enhanced result card
      const blob = await generateResultCard(analysisResult, '');
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `hijab_personal_color_${timestamp}.jpg`;
      downloadResultCard(blob, filename);

      // Track successful download
      trackEvent('download_complete', {
        downloaded_content: 'completion_result_image',
        personal_color: analysisResult.personal_color_en,
        file_format: 'jpg',
        download_location: 'completion_page'
      });
    } catch (error) {
      const errorMessage = `Failed to save image: ${error instanceof Error ? error.message : 'Unknown error'}`;
      alert('Failed to save image. Please try again.');
      trackError('completion_image_save_failed', error instanceof Error ? error.message : 'Unknown download error', 'completion_page');
    }
  };

  const handleGoHome = (): void => {
    // Track go home button click with enhanced data
    trackEvent('button_click', {
      button_name: 'go_home',
      page: 'completion',
      user_flow_step: 'session_reset_initiated',
      personal_color: analysisResult?.personal_color_en
    });

    // Track session end
    trackEvent('session_end', {
      end_location: 'completion_page',
      session_completed: true,
      personal_color: analysisResult?.personal_color_en
    });
    
    reset();
    navigate(ROUTES.HOME);
  };

  // Prevent scrolling on this page
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    document.body.style.touchAction = 'none';
    
    // Prevent pull-to-refresh on mobile
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.position = 'fixed';
    document.documentElement.style.width = '100%';
    document.documentElement.style.height = '100%';
    
    return () => {
      // Cleanup on unmount
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.body.style.touchAction = '';
      
      document.documentElement.style.overflow = '';
      document.documentElement.style.position = '';
      document.documentElement.style.width = '';
      document.documentElement.style.height = '';
    };
  }, []);

  // Prevent touch move events for scroll
  useEffect(() => {
    const preventScroll = (e: TouchEvent) => {
      e.preventDefault();
    };

    document.addEventListener('touchmove', preventScroll, { passive: false });
    
    return () => {
      document.removeEventListener('touchmove', preventScroll);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden"
         style={{ 
            width: '100vw',
            height: '100dvh',
           touchAction: 'none',
           overscrollBehavior: 'none',
           WebkitOverflowScrolling: 'touch',
           position: 'fixed',
           top: 0,
           left: 0,
           right: 0,
           bottom: 0
         }}>
      <div className="w-full h-full overflow-y-auto flex flex-col items-center justify-center px-4 py-12 pb-24">
        <div className="max-w-md w-full space-y-8">
          {/* Success Animation */}
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-success/20 rounded-full animate-ping" />
              <div className="absolute inset-0 bg-success/30 rounded-full animate-ping animation-delay-200" />
              <div className="relative w-full h-full bg-success rounded-full flex items-center justify-center">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-white"
                >
                  <path
                    d="M20 6L9 17L4 12"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            <h1 className="text-h2 font-bold text-gray-900 mb-2">
              Complete!
            </h1>
            <p className="text-body text-gray-600">
              We'll send personalized hijab recommendations to your Instagram DM soon
            </p>
          </div>

          {/* Delivery Info Card */}
          <Card>
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                <span className="text-primary font-medium">Your Results</span>
              </div>
              
              <div className="space-y-2">
                <p className="text-h5 font-semibold text-gray-900">
                  Will be sent within 24 hours
                </p>
                <p className="text-body-sm text-gray-600">
                  3-5 personalized recommendations + purchase links included
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <p className="text-caption text-gray-500">
                  ※ Delivery may be delayed on weekends and holidays
                </p>
              </div>
            </div>
          </Card>

          {/* Additional Actions */}
          <Card>
            <h3 className="text-h5 font-semibold text-gray-900 mb-4">
              While you wait...
            </h3>
            
            <div className="space-y-3">
              <Button
                variant="secondary"
                fullWidth
                onClick={handleSaveResult}
                className="justify-between"
              >
                <span>Save Result Image</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 15V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V15M7 10L12 15M12 15L17 10M12 15V3"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Button>

              <Button
                variant="secondary"
                fullWidth
                onClick={handleShare}
                className="justify-between"
              >
                <span>Share with Friends</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 5.12548 15.0077 5.24917 15.0227 5.37061L7.08259 9.34056C6.54303 8.52293 5.5793 8 4.5 8C2.84315 8 1.5 9.34315 1.5 11C1.5 12.6569 2.84315 14 4.5 14C5.5793 14 6.54303 13.4771 7.08259 12.6594L15.0227 16.6294C15.0077 16.7508 15 16.8745 15 17C15 18.6569 16.3431 20 18 20C19.6569 20 21 18.6569 21 17C21 15.3431 19.6569 14 18 14C16.9207 14 15.957 14.5229 15.4174 15.3406L7.47727 11.3706C7.49234 11.2492 7.5 11.1255 7.5 11C7.5 10.8745 7.49234 10.7508 7.47727 10.6294L15.4174 6.65944C15.957 7.47707 16.9207 8 18 8Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Button>
            </div>
          </Card>

          {/* Home Button */}
          <div className="text-center">
            <button
              onClick={handleGoHome}
              className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
            >
              Go Home
            </button>
          </div>

          {/* Support Info */}
          <div className="text-center pt-8 border-t border-gray-100">
            <p className="text-caption text-gray-500">
              Have questions?
            </p>
            <a
              href="mailto:support@hijabcolor.com"
              className="text-primary text-sm hover:underline"
            >
              support@hijabcolor.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompletionPage;
