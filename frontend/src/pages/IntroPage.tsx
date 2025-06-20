import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';
import { validateInstagramId } from '@/utils/validators';
import { useAppStore } from '@/store';
import { Button, Input, Card } from '@/components/ui';
import { Header, PageLayout } from '@/components/layout';
import { SessionAPI } from '@/services/api/session';

const IntroPage = (): JSX.Element => {
  const navigate = useNavigate();
  const setSessionData = useAppStore((state) => state.setSessionData);
  const [instagramId, setInstagramId] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleIdChange = (value: string): void => {
    // Remove @ symbol if user includes it
    const cleanedValue = value.replace('@', '');
    setInstagramId(cleanedValue);
    
    if (cleanedValue.length === 0) {
      setError('');
      setIsValid(false);
      return;
    }

    const valid = validateInstagramId(cleanedValue);
    setIsValid(valid);
    setError(valid ? '' : 'Please enter a valid Instagram ID');
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!isValid || isLoading) return;

    setIsLoading(true);
    setError('');

    try {
      // Create session on backend
      const response = await SessionAPI.createSession(instagramId);
      
      // Store session data in global state
      setSessionData(response.data.sessionId, response.data.instagramId);
      
      // Navigate to upload page
      navigate(ROUTES.UPLOAD);
    } catch (error) {
      console.error('Session creation error:', error);
      
      // Provide more specific error messages
      if (error && typeof error === 'object' && 'detail' in error) {
        const apiError = error as { detail: string; error: string };
        if (apiError.detail.includes('네트워크')) {
          setError('Network connection error. Please check your internet connection.');
        } else {
          setError(apiError.detail || 'Failed to create session. Please try again.');
        }
      } else if (error instanceof Error) {
        setError(error.message || 'Failed to create session. Please try again.');
      } else {
        setError('Failed to create session. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageLayout header={<Header />}>
      <div className="max-w-md mx-auto w-full">
          {/* Hero Section */}
          <Card className="mb-6 text-center">
            <h2 className="text-h2 tablet:text-h1 font-bold text-gray-900 mb-4">
              Discover Your Perfect
              <br />
              <span className="text-primary">Hijab Colors</span>
            </h2>
            <p className="text-body text-gray-600">
              AI-powered personal color analysis
            </p>
          </Card>

          {/* Benefits - Simplified */}
          <Card className="mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-3xl mb-2">🎨</div>
                <h3 className="font-medium text-gray-900 text-sm">AI Analysis</h3>
                <p className="text-xs text-gray-600 mt-1">Instant color diagnosis</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🔒</div>
                <h3 className="font-medium text-gray-900 text-sm">100% Private</h3>
                <p className="text-xs text-gray-600 mt-1">Photo deleted instantly</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🧕</div>
                <h3 className="font-medium text-gray-900 text-sm">Hijab Match</h3>
                <p className="text-xs text-gray-600 mt-1">Personalized colors</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">📱</div>
                <h3 className="font-medium text-gray-900 text-sm">DM Delivery</h3>
                <p className="text-xs text-gray-600 mt-1">Sent to Instagram</p>
              </div>
            </div>
          </Card>

          {/* Form */}
          <Card>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Enter your Instagram ID"
                type="text"
                value={instagramId}
                onChange={(e) => handleIdChange(e.target.value)}
                placeholder="your_instagram_id"
                prefix="@"
                error={error}
                required
                fullWidth
              />

              <Button
                type="submit"
                disabled={!isValid || isLoading}
                fullWidth
                size="lg"
                loading={isLoading}
              >
                {isLoading ? 'Creating Session...' : 'Start Analysis'}
              </Button>
            </form>
          </Card>

          {/* Simple Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">
              By continuing, you agree to our privacy policy
            </p>
          </div>
      </div>
    </PageLayout>
  );
};

export default IntroPage;