import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout';
import { ROUTES, SEASON_DESCRIPTIONS } from '@/utils/constants';
import { useAppStore } from '@/store';
import { shareOrCopy } from '@/utils/helpers';
import { SEASON_COLORS } from '@/utils/colorData';
import { generateResultCard, downloadResultCard } from '@/utils/resultCardGeneratorV3';
import { AnalyticsEvents } from '@/utils/analytics';

// Helper function to convert API response to season key
function getSeasonKey(personalColorEn: string): keyof typeof SEASON_DESCRIPTIONS {
  const seasonMap: Record<string, keyof typeof SEASON_DESCRIPTIONS> = {
    'Spring Warm': 'spring',
    'Summer Cool': 'summer',
    'Autumn Warm': 'autumn',
    'Winter Cool': 'winter'
  };
  
  return seasonMap[personalColorEn] || 'spring';
}

// ===================== 컬러칩을 4개씩 묶는 유틸 함수 =====================
/**
 * 배열을 지정한 크기(chunkSize)만큼 잘라 2차원 배열로 반환합니다.
 * @param arr 원본 배열
 * @param chunkSize 한 묶음의 크기 (여기서는 4)
 * @returns 2차원 배열 (각 행에 4개씩)
 */
function chunkArray<T>(arr: T[], chunkSize: number): T[][] {
  // 예외 처리: chunkSize가 1보다 작으면 전체 배열을 한 묶음으로 반환
  if (chunkSize < 1) return [arr];
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    result.push(arr.slice(i, i + chunkSize));
  }
  return result;
}

const ResultPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { analysisResult, instagramId, uploadedImage } = useAppStore();
  const [showDownloadHint, setShowDownloadHint] = useState(true);
  
  // Auto hide download hint after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDownloadHint(false);
    }, 10000);
    
    return () => clearTimeout(timer);
  }, []);

  // Track AI analysis completion when result is available
  useEffect(() => {
    if (analysisResult && instagramId) {
      const seasonKey = getSeasonKey(analysisResult.personal_color_en);
      AnalyticsEvents.AI_ANALYSIS({
        personal_color: analysisResult.personal_color_en,
        season: seasonKey,
        confidence: analysisResult.confidence || 0,
        analysis_time: 0 // We don't have the actual time here
      });
    }
  }, [analysisResult, instagramId]);

  // Redirect if no analysis result
  useEffect(() => {
    if (!analysisResult || !instagramId) {
      // Only redirect in production, show mock in development
      if (process.env.NODE_ENV !== 'development') {
        navigate(ROUTES.HOME);
      }
    }
  }, [analysisResult, instagramId, navigate]);

  const result = analysisResult;
  
  if (!result) {
    return <div>Loading...</div>;
  }

  // Safely get season info with fallback
  const seasonKey = getSeasonKey(result.personal_color_en);
  const seasonInfo = SEASON_DESCRIPTIONS[seasonKey] || {
    ko: result.personal_color || 'Analyzing',
    en: result.personal_color_en || 'analyzing',
    description: 'We found your unique color palette',
  };
  
  
  // Get season-specific colors
  const seasonColors = SEASON_COLORS[seasonKey] || SEASON_COLORS.spring;
  const bestColors = seasonColors.bestColors;
  const worstColors = seasonColors.worstColors;

  const handleShare = async (): Promise<void> => {
    try {
      // Track share button click
      AnalyticsEvents.BUTTON_CLICK({
        button_name: 'share_result',
        page: 'result'
      });
      
      await shareOrCopy({
        title: 'Hijab Personal Color Analysis Results',
        text: `My personal color is ${seasonInfo.en}!`,
        url: window.location.href,
      });
    } catch {
      // Sharing failed silently, copy was likely used instead
    }
  };

  const handleSaveImage = async (): Promise<void> => {
    try {
      // Track download button click
      AnalyticsEvents.RESULT_DOWNLOAD({
        personal_color: result.personal_color_en,
        format: 'jpg'
      });
      
      const blob = await generateResultCard(result, instagramId || 'user');
      const filename = `hijab_color_${result.personal_color_en.replace(' ', '_')}_${Date.now()}.jpg`;
      downloadResultCard(blob, filename);
    } catch (error) {
      alert(`Failed to save image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <PageLayout>
      {/* Custom gradient background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 opacity-50" />
      </div>

      <div className="max-w-2xl mx-auto w-full pb-20">
        {/* Hero Section with Photo - Compact */}
        <div className="relative mb-4">
          {uploadedImage ? (
            <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={uploadedImage} 
                alt="Analyzed photo"
                className="w-full h-full object-cover"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              
              {/* Result overlay with Share buttons */}
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <div className="flex justify-between items-end">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-xs">
                        ✨ AI Analysis Complete
                      </div>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-1">
                      {seasonInfo?.en || result.personal_color_en}
                    </h1>
                    <p className="text-sm opacity-90">
                      {seasonInfo?.description || 'We found your unique color palette'}
                    </p>
                  </div>
                  {/* Share buttons integrated into hero */}
                  <div className="flex gap-2 flex-shrink-0 relative">
                    <button
                      onClick={handleShare}
                      className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all"
                      aria-label="Share"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                        <path
                          d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 5.12548 15.0077 5.24917 15.0227 5.37061L7.08259 9.34056C6.54303 8.52293 5.5793 8 4.5 8C2.84315 8 1.5 9.34315 1.5 11C1.5 12.6569 2.84315 14 4.5 14C5.5793 14 6.54303 13.4771 7.08259 12.6594L15.0227 16.6294C15.0077 16.7508 15 16.8745 15 17C15 18.6569 16.3431 20 18 20C19.6569 20 21 18.6569 21 17C21 15.3431 19.6569 14 18 14C16.9207 14 15.957 14.5229 15.4174 15.3406L7.47727 11.3706C7.49234 11.2492 7.5 11.1255 7.5 11C7.5 10.8745 7.49234 10.7508 7.47727 10.6294L15.4174 6.65944C15.957 7.47707 16.9207 8 18 8Z"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={handleSaveImage}
                      className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all relative"
                      aria-label="Save"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                        <path
                          d="M21 15V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V15M7 10L12 15M12 15L17 10M12 15V3"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                        />
                      </svg>
                    </button>
                    
                    {/* Floating Hint Popup attached to save button */}
                    {showDownloadHint && (
                      <div className="absolute top-full mt-3 right-0 z-[9999]">
                        <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs sm:text-sm px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 whitespace-nowrap animate-bounce">
                          <span className="text-lg">✨</span>
                          <span className="font-medium">Save your result card!</span>
                          <button
                            onClick={() => setShowDownloadHint(false)}
                            className="ml-2 text-white/80 hover:text-white text-lg leading-none"
                          >
                            ×
                          </button>
                          {/* Arrow pointing up to save button */}
                          <div className="absolute -top-2 right-6 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-purple-600" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Fallback when no image
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white text-center">
              <h1 className="text-2xl md:text-3xl font-bold mb-1">
                {seasonInfo?.en || result.personal_color_en}
              </h1>
              <p className="text-sm opacity-90">
                {seasonInfo?.description || 'We found your unique color palette'}
              </p>
            </div>
          )}
        </div>

        {/* AI Confidence */}
        {result.confidence && (
          <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            AI Confidence {result.confidence <= 1 ? Math.round(result.confidence * 100) : Math.round(result.confidence)}%
          </div>
        )}

        {/* Color Palettes - Horizontal Layout */}
        <div className="space-y-3 mb-4">
          {/* Best Colors */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-3">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1">
                <span className="text-base">🎨</span> Your Color Palette
              </h3>
              {/*
                1. bestColors를 4개씩 묶어서 여러 줄로 렌더링
                2. 각 컬러칩 내부 하단에 색상명 + 그라데이션 오버레이
              */}
              <div className="flex flex-col gap-2">
                {chunkArray([...bestColors], 4).map((row, rowIdx) => (
                  <div key={rowIdx} className="flex gap-2">
                    {row.map((color, colIdx) => {
                      // color의 타입을 명확히 지정
                      const c = color as { name: string; hex: string; description: string };
                      return (
                        <div key={colIdx} className="flex-1 min-w-0">
                          <div
                            className="relative aspect-square rounded-lg shadow-sm overflow-hidden"
                            style={{ backgroundColor: c.hex }}
                          >
                            {/* 그라데이션 오버레이 + 색상명 */}
                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/40 to-transparent flex flex-col items-center">
                              <p className="text-white text-[10px] font-medium text-center">
                                {c.name}
                              </p>
                            </div>
                          </div>
                          {/* 색상 설명 */}
                          <p className="text-[9px] text-gray-600 text-center mt-1 leading-tight">{c.description}</p>
                        </div>
                      );
                    })}
                    {/* 4개 미만일 때 빈 칸 채우기 */}
                    {row.length < 4 && Array.from({ length: 4 - row.length }).map((_, i) => (
                      <div key={i} className="flex-1 min-w-0" />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Avoid Colors */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-3">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1">
                <span className="text-base">⚠️</span> Colors to Avoid
              </h3>
              {/*
                1. worstColors도 4개씩 묶어서 여러 줄로 렌더링
                2. 각 컬러칩 내부 하단에 색상명 + 그라데이션 오버레이
              */}
              <div className="flex flex-col gap-2">
                {chunkArray([...worstColors], 4).map((row, rowIdx) => (
                  <div key={rowIdx} className="flex gap-2">
                    {row.map((color, colIdx) => {
                      // color의 타입을 명확히 지정
                      const c = color as { name: string; hex: string; description: string };
                      return (
                        <div key={colIdx} className="flex-1 min-w-0">
                          <div
                            className="relative aspect-square rounded-lg shadow-sm overflow-hidden opacity-60"
                            style={{ backgroundColor: c.hex }}
                          >
                            {/* 그라데이션 오버레이 + 색상명 */}
                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/40 to-transparent flex flex-col items-center">
                              <p className="text-white text-[10px] font-medium text-center">
                                {c.name}
                              </p>
                            </div>
                          </div>
                          {/* 색상 설명 */}
                          <p className="text-[9px] text-gray-600 text-center mt-1 leading-tight">{c.description}</p>
                        </div>
                      );
                    })}
                    {/* 4개 미만일 때 빈 칸 채우기 */}
                    {row.length < 4 && Array.from({ length: 4 - row.length }).map((_, i) => (
                      <div key={i} className="flex-1 min-w-0" />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section - Elegant Design */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl blur-xl opacity-20" />
          <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold mb-1">Find Your Perfect Hijab</h3>
                <p className="text-white/80 text-sm">
                  Hijab recommendations for your {seasonInfo?.en}
                </p>
              </div>
              <div className="text-4xl">🧕</div>
            </div>
            <button
              onClick={() => {
                // Track next step button click
                AnalyticsEvents.BUTTON_CLICK({
                  button_name: 'get_hijab_recommendations',
                  page: 'result'
                });
                navigate(ROUTES.RECOMMENDATION);
              }}
              className="w-full bg-white text-purple-600 font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Get Hijab Recommendations
            </button>
          </div>
        </div>
        
        {/* Secondary Action */}
        <div className="text-center mt-4">
          <button
            onClick={() => {
              // Track try again button click
              AnalyticsEvents.BUTTON_CLICK({
                button_name: 'try_again',
                page: 'result'
              });
              navigate(ROUTES.HOME);
            }}
            className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </PageLayout>
  );
};

export default ResultPage;