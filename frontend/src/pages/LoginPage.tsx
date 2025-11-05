import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/store/useAuthStore';
import { PageLayout } from '@/components/layout';
import { Button, Input, Card, Text } from '@/components/ui';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { trackEvent } from '@/utils/analytics';

interface LoginFormData {
  email: string;
  password: string;
}

const LoginPage = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError, isAuthenticated } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setFocus
  } = useForm<LoginFormData>();

  // Get redirect URL from location state or default to home page
  const from = (location.state as any)?.from?.pathname || '/';

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Track page visit
  useEffect(() => {
    trackEvent('login_page_view', {
      page: 'login',
      referrer: document.referrer
    });
  }, []);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  // Focus email field on mount
  useEffect(() => {
    setFocus('email');
  }, [setFocus]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      trackEvent('login_attempt', {
        email: data.email,
        page: 'login'
      });

      await login(data.email, data.password);
      
      trackEvent('login_success', {
        email: data.email,
        page: 'login'
      });

      toast.success('로그인 성공!');
      navigate(from, { replace: true });
    } catch (error: any) {
      trackEvent('login_failed', {
        email: data.email,
        error: error.message,
        page: 'login'
      });
      
      toast.error(error.response?.data?.message || '로그인에 실패했습니다.');
    }
  };

  return (
    <PageLayout showDefaultHeader>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">로그인</h1>
            <p className="text-gray-600">
              계정이 없으신가요?{' '}
              <Link to="/signup" className="text-primary hover:underline">
                회원가입
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Input
                type="email"
                label="이메일"
                placeholder="your@email.com"
                {...register('email', {
                  required: '이메일을 입력해주세요',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: '올바른 이메일 형식이 아닙니다'
                  }
                })}
                error={errors.email?.message}
                leftIcon={<Mail className="w-5 h-5 text-gray-400" />}
                fullWidth
              />
            </div>

            <div>
              <Input
                type={showPassword ? 'text' : 'password'}
                label="비밀번호"
                placeholder="••••••••"
                {...register('password', {
                  required: '비밀번호를 입력해주세요',
                  minLength: {
                    value: 6,
                    message: '비밀번호는 최소 6자 이상이어야 합니다'
                  }
                })}
                error={errors.password?.message}
                leftIcon={<Lock className="w-5 h-5 text-gray-400" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 hover:bg-gray-100 rounded"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-400" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                }
                fullWidth
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-gray-600">로그인 상태 유지</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-primary hover:underline"
              >
                비밀번호 찾기
              </Link>
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={isLoading}
              disabled={isLoading}
            >
              로그인
            </Button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">또는</span>
              </div>
            </div>

            <div className="mt-6">
              <Link to="/">
                <Button
                  variant="secondary"
                  fullWidth
                  size="lg"
                >
                  로그인 없이 계속하기
                </Button>
              </Link>
              <Text variant="caption" color="gray" align="center" mt="2">
                로그인 없이도 퍼스널 컬러 진단을 받을 수 있습니다
              </Text>
            </div>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
};

export default LoginPage;
