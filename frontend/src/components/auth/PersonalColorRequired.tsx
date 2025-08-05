import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Palette, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui';
import { ROUTES } from '@/utils/constants';
import { trackEvent } from '@/utils/analytics';
import { useAppStore } from '@/store';
import { SessionAPI } from '@/services/api/session';

interface PersonalColorRequiredProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
}

export const PersonalColorRequired: React.FC<PersonalColorRequiredProps> = ({
  isOpen,
  onClose,
  feature = '이 기능'
}) => {
  const navigate = useNavigate();
  const { sessionId, setSessionData } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartDiagnosis = async () => {
    trackEvent('personal_color_required_action', {
      action: 'start_diagnosis',
      feature,
      from_feature: feature
    });
    
    setIsLoading(true);
    
    try {
      // Check if session exists, if not create one
      if (!sessionId) {
        const response = await SessionAPI.createSession();
        setSessionData(response.data.sessionId);
      }
      
      // Navigate to diagnosis
      navigate(ROUTES.DIAGNOSIS);
      onClose();
    } catch (error) {
      console.error('Failed to create session:', error);
      // Still close modal but stay on current page
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform transition-all bg-white rounded-2xl shadow-xl">
          <div className="p-6">
            {/* Icon */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-pink-100 mb-4">
              <Palette className="w-8 h-8 text-purple-600" />
            </div>

            {/* Content */}
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                퍼스널 컬러 진단이 필요해요
              </h3>
              <p className="text-gray-600 mb-6">
                {feature}을(를) 이용하시려면 먼저 퍼스널 컬러 진단을 완료해주세요.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="bg-purple-50 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-900">AI 퍼스널 컬러 진단</span>
              </div>
              <ul className="space-y-2 text-sm text-purple-700">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">✓</span>
                  <span>30초 만에 완료되는 빠른 진단</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">✓</span>
                  <span>봄, 여름, 가을, 겨울 타입 분석</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">✓</span>
                  <span>나에게 어울리는 컬러 추천</span>
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={handleStartDiagnosis}
                fullWidth
                size="lg"
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                {isLoading ? '준비 중...' : '퍼스널 컬러 진단 시작하기'}
              </Button>
              
              <button
                onClick={onClose}
                className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
              >
                나중에 하기
              </button>
            </div>

            {/* Privacy notice */}
            <p className="mt-4 text-xs text-gray-500 text-center">
              업로드된 사진은 분석 후 즉시 삭제됩니다
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};