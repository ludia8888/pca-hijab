import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Palette, ChevronRight } from 'lucide-react';
import { useAppStore } from '@/store';
import { ROUTES, SEASON_DESCRIPTIONS } from '@/utils/constants';
import { SEASON_COLORS } from '@/utils/colorData';
import { SessionAPI } from '@/services/api/session';

export const PersonalColorSection = (): JSX.Element => {
  const navigate = useNavigate();
  const { analysisResult, sessionId, setSessionData } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  
  if (!analysisResult) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Palette className="w-5 h-5 text-purple-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">My personal color</h2>
        </div>
        
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🎨</div>
          <p className="text-gray-600 mb-4">
            You haven’t completed a personal color diagnosis yet.
          </p>
          <button
            onClick={async () => {
              setIsLoading(true);
              try {
                if (!sessionId) {
                  const response = await SessionAPI.createSession();
                  setSessionData(response.data.sessionId);
                }
                navigate(ROUTES.DIAGNOSIS);
              } catch (error) {
                console.error('Failed to create session:', error);
              } finally {
                setIsLoading(false);
              }
            }}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Preparing...' : 'Start personal color analysis'}
          <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }
  
  // Get season key from analysis result
  const getSeasonKey = (personalColorEn: string): keyof typeof SEASON_DESCRIPTIONS => {
    const seasonMap: Record<string, keyof typeof SEASON_DESCRIPTIONS> = {
      'Spring Warm': 'spring',
      'Summer Cool': 'summer',
      'Autumn Warm': 'autumn',
      'Winter Cool': 'winter'
    };
    
    return seasonMap[personalColorEn] || 'spring';
  };
  
  const seasonKey = getSeasonKey(analysisResult.personal_color_en);
  const seasonInfo = SEASON_DESCRIPTIONS[seasonKey];
  const seasonColors = SEASON_COLORS[seasonKey];
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Palette className="w-5 h-5 text-purple-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">My personal color</h2>
        </div>
        
        <button
          onClick={() => navigate(ROUTES.RESULT)}
          className="text-sm text-purple-600 hover:text-purple-700 font-medium"
        >
          View details
        </button>
      </div>
      
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-2xl font-bold text-gray-900">
              {seasonInfo.en}
            </h3>
          </div>
          <p className="text-sm text-gray-600">
            {seasonInfo.description}
          </p>
          {analysisResult.confidence && (
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              AI confidence {Math.round(analysisResult.confidence * 100)}%
            </div>
          )}
        </div>
        
        {/* Season emoji */}
        <div className="text-5xl">
          {seasonKey === 'spring' ? '🌸' : 
           seasonKey === 'summer' ? '🌊' :
           seasonKey === 'autumn' ? '🍂' : '❄️'}
        </div>
      </div>
      
      {/* Best colors preview */}
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Recommended colors</p>
        <div className="flex gap-2">
          {seasonColors.bestColors.slice(0, 6).map((color, index) => (
            <div
              key={index}
              className="relative flex-1 h-12 rounded-lg shadow-sm overflow-hidden group"
              style={{ backgroundColor: color.hex }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200" />
              <div className="absolute bottom-0 left-0 right-0 p-1 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-[9px] text-center truncate">
                  {color.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => navigate(ROUTES.PRODUCTS)}
          className="flex-1 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
        >
          View tailored products
        </button>
        <button
          onClick={async () => {
            setIsLoading(true);
            try {
              if (!sessionId) {
                const response = await SessionAPI.createSession();
                setSessionData(response.data.sessionId);
              }
              navigate(ROUTES.DIAGNOSIS);
            } catch (error) {
              console.error('Failed to create session:', error);
            } finally {
              setIsLoading(false);
            }
          }}
          disabled={isLoading}
          className="flex-1 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Preparing...' : 'Run diagnosis again'}
        </button>
      </div>
    </div>
  );
};
