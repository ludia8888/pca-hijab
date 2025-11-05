import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { PageLayout } from '@/components/layout';
import { Button, Input } from '@/components/ui';
import { AuthAPI } from '@/services/api/auth';
import { toast } from 'react-hot-toast';
import { validatePassword } from '@/utils/validation';

const ResetPasswordPage = (): JSX.Element => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  const resetToken = searchParams.get('token');

  useEffect(() => {
    // If no token, redirect to forgot password page
    if (!resetToken) {
      toast.error('유효하지 않은 링크입니다');
      navigate('/forgot-password');
    }
  }, [resetToken, navigate]);

  const validateForm = (): boolean => {
    let isValid = true;
    setPasswordError('');
    setConfirmPasswordError('');

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.error || '');
      isValid = false;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setConfirmPasswordError('비밀번호가 일치하지 않습니다');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !resetToken) {
      return;
    }

    setIsLoading(true);

    try {
      await AuthAPI.resetPassword(resetToken, password);
      toast.success('비밀번호가 성공적으로 변경되었습니다');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      console.error('Reset password error:', error);
      const errorMessage = error.response?.data?.message || '오류가 발생했습니다. 다시 시도해주세요';
      
      if (errorMessage.includes('expired') || errorMessage.includes('invalid')) {
        toast.error('만료되었거나 유효하지 않은 링크입니다');
        setTimeout(() => {
          navigate('/forgot-password');
        }, 2000);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageLayout showDefaultHeader>
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              새 비밀번호 설정
            </h2>
            <p className="text-gray-600">
              안전한 새 비밀번호를 입력해주세요
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <Input
                  type="password"
                  label="새 비밀번호"
                  placeholder="8자 이상, 영문/숫자/특수문자 포함"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={passwordError}
                  required
                  autoFocus
                />
                <p className="mt-1 text-sm text-gray-500">
                  비밀번호는 8자 이상이며, 영문, 숫자, 특수문자를 포함해야 합니다
                </p>
              </div>

              <Input
                type="password"
                label="새 비밀번호 확인"
                placeholder="비밀번호를 다시 입력해주세요"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={confirmPasswordError}
                required
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={isLoading}
              disabled={isLoading || !password || !confirmPassword}
            >
              비밀번호 변경
            </Button>

            <div className="text-center text-sm">
              <Link
                to="/login"
                className="font-medium text-purple-600 hover:text-purple-500"
              >
                로그인으로 돌아가기
              </Link>
            </div>
          </form>
        </div>
      </div>
    </PageLayout>
  );
};

export default ResetPasswordPage;
