import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';
import { generateSessionId } from '@/utils/helpers';
import { validateInstagramId } from '@/utils/validators';
import { useAppStore } from '@/store';
import { Button, Input } from '@/components/ui';
import { Header, PageLayout } from '@/components/layout';

const IntroPage = (): JSX.Element => {
  const navigate = useNavigate();
  const setSessionData = useAppStore((state) => state.setSessionData);
  const [instagramId, setInstagramId] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState('');

  const handleIdChange = (value: string): void => {
    // Remove @ symbol if user includes it
    const cleanedValue = value.replace('@', '');
    setInstagramId(cleanedValue);
    
    if (cleanedValue.length === 0) {
      setError('');
      setIsValid(false);
      return;
    }

    const valid = validateInstagramId(cleanedValue);
    setIsValid(valid);
    setError(valid ? '' : '올바른 인스타그램 ID 형식이 아닙니다');
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!isValid) return;

    // Generate session ID and store in global state
    const sessionId = generateSessionId();
    setSessionData(sessionId, instagramId);
    navigate(ROUTES.UPLOAD);
  };

  return (
    <PageLayout header={<Header />}>
      <div className="max-w-md mx-auto w-full">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <h2 className="text-h2 tablet:text-h1 font-bold text-gray-900 mb-4">
              AI가 당신 얼굴에 어울리는
              <br />
              히잡 색을 찾아드립니다
            </h2>
            <p className="text-body text-gray-600 leading-relaxed">
              퍼스널 컬러 진단을 통해 당신에게 가장 잘 어울리는 히잡 색상을 추천받아보세요.
              인스타그램 DM으로 맞춤 추천을 보내드립니다.
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-3 mb-8">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🎨</span>
              <div>
                <h3 className="font-semibold text-gray-900">AI 퍼스널 컬러 진단</h3>
                <p className="text-body-sm text-gray-600">
                  얼굴 분석을 통한 정확한 퍼스널 컬러 진단
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🧕</span>
              <div>
                <h3 className="font-semibold text-gray-900">맞춤 히잡 추천</h3>
                <p className="text-body-sm text-gray-600">
                  진단 결과 기반 실제 구매 가능한 제품 추천
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">📱</span>
              <div>
                <h3 className="font-semibold text-gray-900">편리한 DM 발송</h3>
                <p className="text-body-sm text-gray-600">
                  추천 결과를 인스타그램 DM으로 간편하게 전달
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="인스타그램 ID를 입력해주세요"
              type="text"
              value={instagramId}
              onChange={(e) => handleIdChange(e.target.value)}
              placeholder="your_instagram_id"
              prefix="@"
              error={error}
              required
              fullWidth
            />

            <Button
              type="submit"
              disabled={!isValid}
              fullWidth
              size="lg"
            >
              진단 시작하기
            </Button>
          </form>

          {/* Privacy Notice */}
          <p className="mt-6 text-caption text-gray-500 text-center">
            입력하신 인스타그램 ID는 추천 결과 전달 목적으로만 사용되며,
            <br />
            서비스 이용 완료 후 안전하게 삭제됩니다.
          </p>
      </div>
    </PageLayout>
  );
};

export default IntroPage;