import { AlertCircle } from 'lucide-react';

export const DemoNotice = () => {
  const isDemoMode = import.meta.env.VITE_USE_MOCK_AI === 'true' || !import.meta.env.VITE_AI_API_URL;
  
  if (!isDemoMode) return null;
  
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-yellow-800">
            <strong>데모 모드:</strong> 현재 AI 분석 서비스가 준비 중입니다. 
            임시로 샘플 결과를 보여드리고 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
};