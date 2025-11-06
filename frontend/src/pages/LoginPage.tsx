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
  const locationState = location.state as { from?: { pathname?: string } } | null;
  const from = locationState?.from?.pathname || '/';

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

      toast.success('Signed in successfully!');
      navigate(from, { replace: true });
    } catch (error: unknown) {
      trackEvent('login_failed', {
        email: data.email,
        error: error instanceof Error ? error.message : String(error),
        page: 'login'
      });

      const message =
        (typeof error === 'object' &&
          error !== null &&
          'response' in error &&
          (error as { response?: { data?: { message?: string } } })?.response?.data?.message) ||
        (error instanceof Error ? error.message : undefined) ||
        'Failed to sign in.';

      toast.error(message);
    }
  };

  return (
    <PageLayout showDefaultHeader>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Sign In</h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Input
                type="email"
                label="Email"
                placeholder="your@email.com"
                {...register('email', {
                  required: 'Please enter your email address.',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Please enter a valid email address.'
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
                label="Password"
                placeholder="••••••••"
                {...register('password', {
                  required: 'Please enter your password.',
                  minLength: {
                    value: 6,
                    message: 'Passwords must be at least 6 characters long.'
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
                <span className="text-gray-600">Keep me signed in</span>
              </label>
              <div className="flex flex-col items-end gap-1 text-right">
                <Link
                  to="/find-account"
                  className="text-primary hover:underline"
                >
                  Forgot email?
                </Link>
                <Link
                  to="/forgot-password"
                  className="text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={isLoading}
              disabled={isLoading}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
            <Text variant="body-sm" color="gray" mb="2">
              New to PCA HIJAB?
            </Text>
            <Link to="/signup">
              <Button fullWidth size="lg" variant="outline">
                Create an account
              </Button>
            </Link>
          </div>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or</span>
              </div>
            </div>

            <div className="mt-6">
              <Link to="/">
                <Button
                  variant="secondary"
                  fullWidth
                  size="lg"
                >
                  Continue without signing in
                </Button>
              </Link>
              <Text variant="caption" color="gray" align="center" mt="2">
                You can still get a personal color analysis without signing in.
              </Text>
            </div>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
};

export default LoginPage;
