import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '@/store/useAdminStore';
import { ProductAPI } from '@/services/api/admin';
console.log('[AdminLoginPage] ProductAPI imported:', ProductAPI);
import { Button, Input, Card } from '@/components/ui';
import { PageLayout } from '@/components/layout';
import { trackEvent, trackError, trackEngagement } from '@/utils/analytics';
import { Lock } from 'lucide-react';

const AdminLoginPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { setApiKey } = useAdminStore();
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Auto-redirect to dashboard (bypass login)
  useEffect(() => {
    // Automatically redirect to dashboard
    navigate('/admin/dashboard');
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    console.log('[AdminLoginPage] Form submitted with API key length:', apiKeyInput.length);
    setError('');
    setIsLoading(true);

    // Track login attempt
    trackEvent('admin_login_attempt', {
      page: 'admin_login',
      api_key_length: apiKeyInput.length,
      user_flow_step: 'admin_login_submitted'
    });

    trackEngagement('admin_login', 'login_attempt');

    try {
      console.log('[AdminLoginPage] Calling ProductAPI.verifyApiKey...');
      // Verify API key with lightweight endpoint
      const isValid = await ProductAPI.verifyApiKey(apiKeyInput);
      console.log('[AdminLoginPage] API key verification result:', isValid);
      
      if (isValid) {
        // Track successful login
        trackEvent('admin_login_success', {
          page: 'admin_login',
          user_flow_step: 'admin_login_successful'
        });

        // If successful, save API key and navigate to dashboard
        setApiKey(apiKeyInput);
        navigate('/admin/dashboard');
      } else {
        // Track failed login
        trackEvent('admin_login_failed', {
          page: 'admin_login',
          failure_reason: 'invalid_api_key',
          api_key_length: apiKeyInput.length,
          user_flow_step: 'admin_login_failed'
        });
        
        setError('Invalid API key. Please try again.');
      }
    } catch (error) {
      // Track login error
      trackError('admin_login_error', error instanceof Error ? error.message : 'Unknown login error', 'admin_login');
      trackEvent('admin_login_failed', {
        page: 'admin_login',
        failure_reason: 'api_error',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        user_flow_step: 'admin_login_error'
      });
      
      setError('Invalid API key. Please try again.');
    } finally {
      setIsLoading(false);
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
            <p className="text-gray-600 mt-2">Enter your API key to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="password"
              label="API Key"
              value={apiKeyInput}
              onChange={(e) => {
                const value = e.target.value;
                setApiKeyInput(value);
                
                // Track form interaction
                if (value.length === 1 && apiKeyInput.length === 0) {
                  // First character typed
                  trackEvent('admin_form_interaction', {
                    field_name: 'api_key',
                    interaction_type: 'input_start',
                    user_flow_step: 'admin_form_started'
                  });
                } else if (value.length >= 4 && value.length % 4 === 0) {
                  // Track input progress every 4 characters
                  trackEvent('admin_form_validation', {
                    field_name: 'api_key',
                    input_length: value.length,
                    user_flow_step: 'admin_form_validation'
                  });
                }
              }}
              placeholder="Enter admin API key"
              error={error}
              required
              fullWidth
            />

            <Button
              type="submit"
              fullWidth
              size="lg"
              disabled={!apiKeyInput || isLoading}
              loading={isLoading}
            >
              {isLoading ? 'Verifying...' : 'Login'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Contact system administrator if you need access
            </p>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
};

export default AdminLoginPage;