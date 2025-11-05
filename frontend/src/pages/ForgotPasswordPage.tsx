import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PageLayout } from '@/components/layout';
import { Button, Input } from '@/components/ui';
import { AuthAPI } from '@/services/api/auth';
import { toast } from 'react-hot-toast';
import { validateEmail } from '@/utils/validation';

const ForgotPasswordPage = (): JSX.Element => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email
    if (!validateEmail(email)) {
      toast.error('올바른 이메일 주소를 입력해주세요');
      return;
    }

    setIsLoading(true);

    try {
      await AuthAPI.forgotPassword(email);
      setIsEmailSent(true);
      toast.success('비밀번호 재설정 링크를 이메일로 전송했습니다');
    } catch (error: any) {
      console.error('Forgot password error:', error);
      toast.error(error.response?.data?.message || '오류가 발생했습니다. 다시 시도해주세요');
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <PageLayout showDefaultHeader>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <div className="text-5xl mb-4">📧</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                이메일을 확인해주세요
              </h2>
              <p className="text-gray-600">
                {email}로 비밀번호 재설정 링크를 전송했습니다.
                <br />
                이메일을 확인하고 링크를 클릭하여 비밀번호를 재설정하세요.
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-center text-sm text-gray-500">
                이메일이 도착하지 않았나요?
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEmailSent(false);
                  setEmail('');
                }}
                className="w-full"
              >
                다시 시도
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => navigate('/login')}
                className="w-full"
              >
                로그인으로 돌아가기
              </Button>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout showDefaultHeader>
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              비밀번호를 잊으셨나요?
            </h2>
            <p className="text-gray-600">
              가입할 때 사용한 이메일 주소를 입력하시면
              <br />
              비밀번호 재설정 링크를 보내드립니다.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <Input
                type="email"
                label="이메일"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={isLoading}
              disabled={isLoading || !email}
            >
              비밀번호 재설정 링크 전송
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-600">계정이 기억나셨나요? </span>
              <Link
                to="/login"
                className="font-medium text-purple-600 hover:text-purple-500"
              >
                로그인
              </Link>
            </div>
          </form>
        </div>
      </div>
    </PageLayout>
  );
};

export default ForgotPasswordPage;
