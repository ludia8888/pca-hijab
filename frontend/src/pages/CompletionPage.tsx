import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout';
import { Button, Card } from '@/components/ui';
import { ROUTES } from '@/utils/constants';
import { useAppStore } from '@/store';
import { shareOrCopy } from '@/utils/helpers';
import { generateResultCard, downloadResultCard } from '@/utils/resultCardGenerator';

const CompletionPage = (): JSX.Element => {
  const navigate = useNavigate();
  const instagramId = useAppStore((state) => state.instagramId);
  const analysisResult = useAppStore((state) => state.analysisResult);
  const reset = useAppStore((state) => state.reset);

  // Redirect if no required data
  useEffect(() => {
    if (!instagramId || !analysisResult) {
      navigate(ROUTES.HOME);
    }
  }, [instagramId, analysisResult, navigate]);

  const handleShare = async (): Promise<void> => {
    try {
      await shareOrCopy({
        title: '히잡 퍼스널 컬러 진단',
        text: `나도 AI로 퍼스널 컬러 진단하고 맞춤 히잡 추천받기!`,
        url: window.location.origin,
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleSaveResult = async (): Promise<void> => {
    if (!analysisResult || !instagramId) return;
    
    try {
      const blob = await generateResultCard(analysisResult, instagramId);
      const filename = `hijab_recommendation_${Date.now()}.jpg`;
      downloadResultCard(blob, filename);
    } catch (error) {
      console.error('Failed to save result card:', error);
      alert('이미지 저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleGoHome = (): void => {
    reset();
    navigate(ROUTES.HOME);
  };

  return (
    <PageLayout>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
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
              완료되었어요!
            </h1>
            <p className="text-body text-gray-600">
              개인 맞춤 히잡 추천을 곧 인스타그램 DM으로 보내드릴게요
            </p>
          </div>

          {/* Delivery Info Card */}
          <Card>
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                <span className="text-primary font-medium">@{instagramId}</span>
              </div>
              
              <div className="space-y-2">
                <p className="text-h5 font-semibold text-gray-900">
                  24시간 이내 발송 예정
                </p>
                <p className="text-body-sm text-gray-600">
                  개인 맞춤 추천 3-5개 + 구매 링크 포함
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <p className="text-caption text-gray-500">
                  ※ 주말 및 공휴일은 발송이 지연될 수 있습니다
                </p>
              </div>
            </div>
          </Card>

          {/* Additional Actions */}
          <Card>
            <h3 className="text-h5 font-semibold text-gray-900 mb-4">
              기다리는 동안...
            </h3>
            
            <div className="space-y-3">
              <Button
                variant="secondary"
                fullWidth
                onClick={handleSaveResult}
                className="justify-between"
              >
                <span>결과 이미지 저장하기</span>
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
                <span>친구에게 공유하기</span>
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
              홈으로 돌아가기
            </button>
          </div>

          {/* Support Info */}
          <div className="text-center pt-8 border-t border-gray-100">
            <p className="text-caption text-gray-500">
              문의사항이 있으신가요?
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
    </PageLayout>
  );
};

export default CompletionPage;