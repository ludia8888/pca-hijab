import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/store/useAuthStore';
import { PageLayout } from '@/components/layout';
import { Button, Input, Card, Text, ConfirmModal } from '@/components/ui';
import { Mail, Lock, Eye, EyeOff, User, Check } from 'lucide-react';
import { trackEvent } from '@/utils/analytics';
import { ROUTES } from '@/utils/constants';

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
  const labels = ['Weak', 'Moderate', 'Strong', 'Very Strong'];

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
      <Text variant="caption" color="gray">
        Password strength: <span className="font-medium">{labels[strength - 1]}</span>
      </Text>
    </div>
  ) : null;
};

const SignupPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { signup, isLoading, error, clearError, isAuthenticated } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAccountExistsModal, setShowAccountExistsModal] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setFocus
  } = useForm<SignupFormData>();

  const password = watch('password');

  // If already authenticated, redirect to landing page
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/landing', { replace: true });
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

      toast.success('Sign-up complete! Please check your email.');
      navigate('/landing');
    } catch (error: unknown) {
      trackEvent('signup_failed', {
        email: data.email,
        error: error instanceof Error ? error.message : String(error),
        page: 'signup'
      });

      const message =
        (typeof error === 'object' &&
          error !== null &&
          'response' in error &&
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message) ||
        (error instanceof Error ? error.message : undefined) ||
        'Failed to sign up.';
      
      toast.error(message);

      // If backend responded with 409 (account exists), show guidance modal
      const status =
        (typeof error === 'object' && error !== null && 'status' in error
          ? (error as { status?: number }).status
          : undefined);
      if (status === 409) {
        setShowAccountExistsModal(true);
      }
    }
  };

  return (
    <PageLayout showDefaultHeader>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <Text variant="h1" color="gray" mb="2">Create Account</Text>
            <Text color="gray">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-400 hover:text-primary-600 hover:underline transition-colors">
                Sign In
              </Link>
            </Text>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Input
                type="text"
                label="Full Name"
                placeholder="Jane Doe"
                {...register('fullName', {
                  required: 'Please enter your name.',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters long.'
                  }
                })}
                error={errors.fullName?.message}
                leftIcon={<User className="w-5 h-5 text-gray-400" />}
                fullWidth
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

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
                  required: 'Please enter a password.',
                  minLength: {
                    value: 8,
                    message: 'Passwords must be at least 8 characters long.'
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                    message: 'Passwords must include upper and lower case letters, a number, and a special character.'
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
                label="Confirm Password"
                placeholder="••••••••"
                {...register('confirmPassword', {
                  required: 'Please re-enter your password.',
                  validate: value =>
                    value === password || 'Passwords do not match.'
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
                    required: 'Please agree to the terms of service.'
                  })}
                  className="mt-1 mr-2 rounded border-gray-300 text-primary-400 focus:ring-primary-400"
                />
                <span className="text-sm text-gray-600">
                  <Link to={ROUTES.TERMS_OF_SERVICE} className="text-primary hover:underline">
                    Terms of Service
                  </Link>
                  {' and '}
                  <Link to="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                  . I agree to both.
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
              Sign Up
            </Button>
          </form>

          <div className="mt-6 space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Check className="w-4 h-4 text-green-500 mr-2" />
              <span>Secure password encryption</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Check className="w-4 h-4 text-green-500 mr-2" />
              <span>Privacy-first data policy</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Check className="w-4 h-4 text-green-500 mr-2" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </Card>
      </div>
      <ConfirmModal
        isOpen={showAccountExistsModal}
        type="info"
        title="Account already exists"
        message={
          'An account with this email already exists. Please sign in instead.'
        }
        confirmText="Go to Login"
        cancelText="Close"
        onConfirm={() => {
          setShowAccountExistsModal(false);
          navigate('/login');
        }}
        onCancel={() => setShowAccountExistsModal(false)}
      />
    </PageLayout>
  );
};

export default SignupPage;
