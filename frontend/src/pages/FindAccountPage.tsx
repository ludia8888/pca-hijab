import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout';
import { Button, Input } from '@/components/ui';
import { AuthAPI } from '@/services/api/auth';
import { toast } from 'react-hot-toast';
import { validateEmail } from '@/utils/validation';

const FindAccountPage = (): JSX.Element => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    try {
      await AuthAPI.remindAccount(email);
      setIsEmailSent(true);
      toast.success('If your account exists, we just sent you a reminder email.');
    } catch (error) {
      console.error('Account reminder error:', error);
      toast.error('Something went wrong. Please try again in a moment.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <PageLayout showDefaultHeader>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md w-full space-y-8 text-center">
            <div>
              <div className="text-5xl mb-4">📮</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Email on its way
              </h2>
              <p className="text-gray-600">
                If your account exists, you’ll receive an email with your sign-in details.
                <br />
                Check your inbox (and spam folder just in case).
              </p>
            </div>

            <div className="space-y-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/login')}
                className="w-full"
              >
                Back to sign in
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEmailSent(false);
                  setEmail('');
                }}
                className="w-full"
              >
                Send another reminder
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
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold text-gray-900">
              Forgot which email you used?
            </h2>
            <p className="text-gray-600">
              Enter an email address you think you used when signing up.
              We’ll send a reminder to that inbox if it matches an account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <Input
              type="email"
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoFocus
            />

            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={isLoading}
              disabled={isLoading || !email}
            >
              Email me a reminder
            </Button>
          </form>

          <div className="text-center text-sm space-y-2">
            <p className="text-gray-600">
              Need to reset your password instead?{' '}
              <Link to="/forgot-password" className="text-primary hover:underline">
                Reset password
              </Link>
            </p>
            <p className="text-gray-600">
              Ready to sign in?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Back to login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default FindAccountPage;
