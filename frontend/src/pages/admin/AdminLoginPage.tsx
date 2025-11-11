import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { Button, Input, Card } from '@/components/ui';
import { PageLayout } from '@/components/layout';
import { trackEvent, trackError, trackEngagement } from '@/utils/analytics';
import { Lock } from 'lucide-react';

const ADMIN_ROLES = ['admin', 'content_manager'];

const AdminLoginPage = (): JSX.Element => {
  const navigate = useNavigate();
  const {
    adminLogin,
    logout,
    isAuthenticated,
    user,
    isLoading,
    error: authError,
    clearError
  } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const hasAdminRole =
    isAuthenticated && user && ADMIN_ROLES.includes(user.role);

  useEffect(() => {
    if (hasAdminRole) {
      navigate('/admin/dashboard', { replace: true });
    } else if (isAuthenticated && user && !hasAdminRole) {
      setError('You do not have admin permissions.');
    }
  }, [hasAdminRole, isAuthenticated, navigate, user]);

  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    clearError();

    trackEvent('admin_login_attempt', {
      method: 'password',
      email,
      user_flow_step: 'admin_login_submitted'
    });
    trackEngagement('admin_login', 'login_attempt');

    try {
      await adminLogin(email, password);
      const currentUser = useAuthStore.getState().user;

      if (!currentUser || !ADMIN_ROLES.includes(currentUser.role)) {
        trackEvent('admin_login_failed', {
          failure_reason: 'insufficient_role',
          email
        });
        await logout();
        setError('This account does not have admin permissions.');
        return;
      }

      trackEvent('admin_login_success', {
        user_flow_step: 'admin_login_successful',
        role: currentUser.role
      });
      navigate('/admin/dashboard');
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Sign-in failed. Please try again.';
      trackError('admin_login_error', message, 'admin_login');
      trackEvent('admin_login_failed', {
        failure_reason: 'invalid_credentials',
        email,
        message
      });
      setError(message);
    }
  };

  return (
    <PageLayout>
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Access</h1>
            <p className="text-gray-600 mt-2">Sign in with your admin account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              fullWidth
            />

            <Input
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              required
              fullWidth
              error={error}
            />

            <Button
              type="submit"
              fullWidth
              size="lg"
              disabled={!email || !password || isLoading}
              loading={isLoading}
            >
              {isLoading ? 'Verifying...' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Need access? Contact your system administrator.
            </p>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
};

export default AdminLoginPage;
