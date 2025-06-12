import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '@/store/useAdminStore';
import { AdminAPI } from '@/services/api/admin';
import { Button, Input, Card } from '@/components/ui';
import { PageLayout } from '@/components/layout';
import { Lock } from 'lucide-react';

const AdminLoginPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { setApiKey } = useAdminStore();
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Test API key by fetching statistics
      await AdminAPI.getStatistics(apiKeyInput);
      
      // If successful, save API key and navigate to dashboard
      setApiKey(apiKeyInput);
      navigate('/admin/dashboard');
    } catch {
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
              onChange={(e) => setApiKeyInput(e.target.value)}
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