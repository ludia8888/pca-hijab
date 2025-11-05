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
      toast.error('This reset link is invalid.');
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
      setConfirmPasswordError('Passwords do not match.');
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
      toast.success('Your password has been updated.');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      console.error('Reset password error:', error);
      const errorMessage = error.response?.data?.message || 'Something went wrong. Please try again.';
      
      if (errorMessage.includes('expired') || errorMessage.includes('invalid')) {
        toast.error('This reset link has expired or is no longer valid.');
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
              Set a new password
            </h2>
            <p className="text-gray-600">
              Create a secure password to protect your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <Input
                  type="password"
                  label="New password"
                  placeholder="At least 8 characters with letters, numbers, and symbols"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={passwordError}
                  required
                  autoFocus
                />
                <p className="mt-1 text-sm text-gray-500">
                  Passwords must be 8+ characters and include letters, numbers, and special symbols.
                </p>
              </div>

              <Input
                type="password"
                label="Confirm new password"
                placeholder="Re-enter your new password"
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
              Update password
            </Button>

            <div className="text-center text-sm">
              <Link
                to="/login"
                className="font-medium text-purple-600 hover:text-purple-500"
              >
                Back to sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </PageLayout>
  );
};

export default ResetPasswordPage;
