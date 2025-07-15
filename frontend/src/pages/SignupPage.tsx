import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/store/useAuthStore';
import { PageLayout } from '@/components/layout';
import { Button, Input, Card } from '@/components/ui';
import { Mail, Lock, Eye, EyeOff, User, Check } from 'lucide-react';
import { trackEvent } from '@/utils/analytics';

interface SignupFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

const PasswordStrengthIndicator = ({ password }: { password: string }) => {
  const getStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    return strength;
  };

  const strength = getStrength();
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
  const labels = ['약함', '보통', '강함', '매우 강함'];

  return password ? (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded ${
              i < strength ? colors[strength - 1] : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-600">
        비밀번호 강도: <span className="font-medium">{labels[strength - 1]}</span>
      </p>
    </div>
  ) : null;
};

const SignupPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { signup, isLoading, error, clearError, isAuthenticated } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setFocus
  } = useForm<SignupFormData>();

  const password = watch('password');

  // If already authenticated, redirect to home
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Track page visit
  useEffect(() => {
    trackEvent('signup_page_view', {
      page: 'signup',
      referrer: document.referrer
    });
  }, []);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  // Focus name field on mount
  useEffect(() => {
    setFocus('fullName');
  }, [setFocus]);

  const onSubmit = async (data: SignupFormData) => {
    try {
      trackEvent('signup_attempt', {
        email: data.email,
        page: 'signup'
      });

      await signup(data.email, data.password, data.fullName);
      
      trackEvent('signup_success', {
        email: data.email,
        page: 'signup'
      });

      toast.success('회원가입이 완료되었습니다! 이메일을 확인해주세요.');
      navigate('/');
    } catch (error: any) {
      trackEvent('signup_failed', {
        email: data.email,
        error: error.message,
        page: 'signup'
      });
      
      toast.error(error.response?.data?.message || '회원가입에 실패했습니다.');
    }
  };

  return (
    <PageLayout>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">회원가입</h1>
            <p className="text-gray-600">
              이미 계정이 있으신가요?{' '}
              <Link to="/login" className="text-primary hover:underline">
                로그인
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Input
                type="text"
                label="이름"
                placeholder="홍길동"
                {...register('fullName', {
                  required: '이름을 입력해주세요',
                  minLength: {
                    value: 2,
                    message: '이름은 최소 2자 이상이어야 합니다'
                  }
                })}
                error={errors.fullName?.message}
                leftIcon={<User className="w-5 h-5 text-gray-400" />}
                fullWidth
              />
            </div>

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
                    value: 8,
                    message: '비밀번호는 최소 8자 이상이어야 합니다'
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                    message: '비밀번호는 대소문자, 숫자, 특수문자를 포함해야 합니다'
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
              <PasswordStrengthIndicator password={password} />
            </div>

            <div>
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                label="비밀번호 확인"
                placeholder="••••••••"
                {...register('confirmPassword', {
                  required: '비밀번호를 다시 입력해주세요',
                  validate: value =>
                    value === password || '비밀번호가 일치하지 않습니다'
                })}
                error={errors.confirmPassword?.message}
                leftIcon={<Lock className="w-5 h-5 text-gray-400" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="p-1 hover:bg-gray-100 rounded"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-400" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                }
                fullWidth
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  {...register('agreeToTerms', {
                    required: '이용약관에 동의해주세요'
                  })}
                  className="mt-1 mr-2 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-600">
                  <Link to="/terms" className="text-primary hover:underline">
                    이용약관
                  </Link>
                  {' 및 '}
                  <Link to="/privacy" className="text-primary hover:underline">
                    개인정보처리방침
                  </Link>
                  에 동의합니다
                </span>
              </label>
              {errors.agreeToTerms && (
                <p className="text-sm text-red-600 ml-6">{errors.agreeToTerms.message}</p>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={isLoading}
              disabled={isLoading}
            >
              회원가입
            </Button>
          </form>

          <div className="mt-6 space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Check className="w-4 h-4 text-green-500 mr-2" />
              <span>안전한 비밀번호 암호화</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Check className="w-4 h-4 text-green-500 mr-2" />
              <span>개인정보 보호 정책 준수</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Check className="w-4 h-4 text-green-500 mr-2" />
              <span>언제든지 탈퇴 가능</span>
            </div>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
};

export default SignupPage;