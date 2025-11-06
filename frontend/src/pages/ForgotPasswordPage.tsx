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
      toast.error('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    try {
      await AuthAPI.forgotPassword(email);
      setIsEmailSent(true);
      toast.success('We’ve emailed you a password reset link.');
    } catch (error: unknown) {
      console.error('Forgot password error:', error);
      const message =
        (typeof error === 'object' &&
          error !== null &&
          'response' in error &&
          (error as { response?: { data?: { message?: string } } })?.response?.data?.message) ||
        (error instanceof Error ? error.message : undefined) ||
        'Something went wrong. Please try again.';
      toast.error(message);
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
                Check your inbox
              </h2>
              <p className="text-gray-600">
                We sent a password reset link to {email}.
                <br />
                Open the email and follow the link to set a new password.
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-center text-sm text-gray-500">
                Didn’t get the email?
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEmailSent(false);
                  setEmail('');
                }}
                className="w-full"
              >
                Send again
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => navigate('/login')}
                className="w-full"
              >
                Back to sign in
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
              Forgot your password?
            </h2>
            <p className="text-gray-600">
              Enter the email you used to sign up and we’ll send
              <br />
              a reset link straight to your inbox.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <Input
                type="email"
                label="Email"
                placeholder="you@example.com"
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
              Email me a reset link
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-600">Forgot which email you used? </span>
              <Link
                to="/find-account"
                className="font-medium text-purple-600 hover:text-purple-500"
              >
                Find my account
              </Link>
            </div>

            <div className="text-center text-sm">
              <span className="text-gray-600">Remember your password? </span>
              <Link
                to="/login"
                className="font-medium text-purple-600 hover:text-purple-500"
              >
                Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </PageLayout>
  );
};

export default ForgotPasswordPage;
