import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';
import { useAppStore } from '@/store';
import { useAuthStore } from '@/store/useAuthStore';
import { AuthAPI } from '@/services/api/auth';
import { trackAIAnalysis, trackEvent, trackError } from '@/utils/analytics';
import { toast } from 'react-hot-toast';
import { 
  PersonalColorCard, 
  ColorPaletteSection, 
  ProductCarousel, 
  QRSection,
  SEASON_DATA
} from '@/components/result';

// Helper function to convert API response to season key
function getSeasonKey(personalColorEn: string): 'spring' | 'summer' | 'autumn' | 'winter' {
  const seasonMap: Record<string, 'spring' | 'summer' | 'autumn' | 'winter'> = {
    'Spring Warm': 'spring',
    'Summer Cool': 'summer',
    'Autumn Warm': 'autumn',
    'Winter Cool': 'winter'
  };
  
  return seasonMap[personalColorEn] || 'spring';
}

const ResultPageV2 = (): JSX.Element => {
  const navigate = useNavigate();
  const { analysisResult, instagramId } = useAppStore();
  const { isAuthenticated, user, setUser } = useAuthStore();

  // Track AI analysis completion and save to user profile if authenticated
  useEffect(() => {
    if (analysisResult) {
      const seasonKey = getSeasonKey(analysisResult.personal_color_en);
      trackAIAnalysis({
        personalColorType: analysisResult.personal_color_en,
        season: seasonKey,
        tone: seasonKey,
        confidence: analysisResult.confidence || 0,
        processingTime: 0
      });
      
      // Save to user profile if authenticated
      if (isAuthenticated && !user?.hasPersonalColorDiagnosis) {
        const saveDiagnosisToProfile = async () => {
          try {
            const response = await AuthAPI.updatePersonalColorDiagnosis({
              season: analysisResult.personal_color,
              seasonEn: analysisResult.personal_color_en,
              confidence: analysisResult.confidence || 0
            });
            
            if (response.data.user) {
              setUser({
                ...response.data.user,
                hasPersonalColorDiagnosis: true,
                personalColorResult: {
                  season: analysisResult.personal_color,
                  seasonEn: analysisResult.personal_color_en,
                  confidence: analysisResult.confidence || 0,
                  diagnosedAt: new Date()
                }
              });
            }
            
            toast.success('Your personal color analysis has been saved to your profile!');
            trackEvent('diagnosis_saved_to_profile', {
              personal_color: analysisResult.personal_color_en,
              confidence: analysisResult.confidence || 0
            });
          } catch (error) {
            console.error('Failed to save diagnosis to profile:', error);
          }
        };
        
        saveDiagnosisToProfile();
      }
    }
  }, [analysisResult, isAuthenticated, user, setUser]);

  // Redirect if no analysis result (only in production)
  useEffect(() => {
    if (!analysisResult && process.env.NODE_ENV !== 'development') {
      navigate(ROUTES.HOME);
    } else if (analysisResult) {
      trackEvent('page_enter', {
        page: 'result',
        user_flow_step: 'result_page_entered',
        personal_color: analysisResult.personal_color_en,
        confidence_score: Math.round((analysisResult.confidence || 0) * 100)
      });
    }
  }, [analysisResult, navigate]);

  // For development, use mock data if no result
  const result = analysisResult || {
    personal_color: 'Spring Warm',
    personal_color_en: 'Spring Warm',
    confidence: 0.92,
    uploaded_image_url: null,
    ai_feedback: 'Mock result for development'
  };

  const seasonKey = getSeasonKey(result.personal_color_en);

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ 
      background: '#F8F8F8',
      width: '100vw',
      minHeight: '100vh',
      minHeight: '100dvh' // Dynamic viewport height for mobile
    }}>
      {/* Container responsive - mobile to desktop, full width on iPad */}
      <div className="w-full md:max-w-none lg:max-w-[768px] xl:max-w-[1024px] mx-auto min-h-screen flex flex-col items-center relative px-4 md:px-0" style={{ 
        background: '#F8F8F8',
        minHeight: '100vh',
        minHeight: '100dvh'
      }}>
        
        {/* Character Image - optimized sizing and positioning */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
          style={{ 
            top: '120px',
            zIndex: 10, // Just above background but below interactive elements
            width: 'min(45%, 160px)' // Smaller base size: 45% of container or max 160px
          }}
        >
          <div className="md:scale-105 lg:scale-110 xl:scale-115 origin-top transition-transform duration-300">
            <img 
              src={SEASON_DATA[seasonKey].character}
              alt={`${SEASON_DATA[seasonKey].title} character`}
              className="w-full h-auto"
              style={{
                aspectRatio: '139/132',
                filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' // Add subtle shadow for depth
              }}
            />
          </div>
        </div>
        
        {/* Section 1: Personal Color Card - full width on iPad */}
        {/* <div className="w-full md:px-8 lg:px-12">
          <PersonalColorCard 
            result={result} 
            userName={user?.fullName || instagramId || undefined} 
          />
        </div> */}

        {/* Section 2: Color Palette - full width on iPad */}
        <div className="w-full py-4 md:py-6 lg:py-8 md:px-8 lg:px-12">
          <ColorPaletteSection seasonKey={seasonKey} />
        </div>

        {/* Section 3: Product Carousel - full width on iPad */}
        {/* <div className="w-full py-4 md:py-6 lg:py-8 md:px-8 lg:px-12">
          <ProductCarousel personalColor={result.personal_color_en} />
        </div> */}

        {/* Section 4: QR Code & Actions - full width on iPad */}
        {/* <div className="w-full py-4 md:py-6 lg:py-8 md:px-8 lg:px-12">
          <QRSection 
            result={result} 
            instagramId={instagramId || undefined} 
          />
        </div> */}

        {/* Bottom Actions - centered on iPad */}
        {/* <div className="text-center px-4 pb-6 md:pb-8 lg:pb-12 md:px-8 lg:px-12">
          <button
            onClick={() => {
              trackEvent('button_click', {
                button_name: 'try_again',
                page: 'result'
              });
              navigate(ROUTES.HOME);
            }}
            className="px-6 md:px-10 lg:px-12 py-2.5 md:py-3 lg:py-4 bg-gray-700 text-white text-sm md:text-base lg:text-lg font-semibold rounded-full shadow-md hover:bg-gray-800 transition-colors"
          >
            🔄 Try Again
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default ResultPageV2;