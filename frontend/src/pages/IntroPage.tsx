import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';
import { validateInstagramId } from '@/utils/validators';
import { useAppStore } from '@/store';
import { Button, Input } from '@/components/ui';
import { Header, PageLayout } from '@/components/layout';
import { SessionAPI } from '@/services/api/session';

const IntroPage = (): JSX.Element => {
  const navigate = useNavigate();
  const setSessionData = useAppStore((state) => state.setSessionData);
  const [instagramId, setInstagramId] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState('');

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
    if (!isValid) return;

    try {
      // Create session on backend
      const response = await SessionAPI.createSession(instagramId);
      
      // Store session data in global state
      setSessionData(response.data.sessionId, response.data.instagramId);
      
      // Navigate to upload page
      navigate(ROUTES.UPLOAD);
    } catch {
      setError('Failed to create session. Please try again.');
    }
  };

  return (
    <PageLayout header={<Header />}>
      <div className="max-w-md mx-auto w-full">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <h2 className="text-h2 tablet:text-h1 font-bold text-gray-900 mb-4">
              Find Your Perfect
              <br />
              Hijab Colors with AI
            </h2>
            <p className="text-body text-gray-600 leading-relaxed">
              Discover hijab colors that complement your natural beauty through personal color analysis.
              We'll send personalized recommendations to your Instagram DM.
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-3 mb-8">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🎨</span>
              <div>
                <h3 className="font-semibold text-gray-900">AI Personal Color Analysis</h3>
                <p className="text-body-sm text-gray-600">
                  Accurate personal color diagnosis through facial analysis
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🔒</span>
              <div>
                <h3 className="font-semibold text-gray-900">100% Privacy Safe</h3>
                <p className="text-body-sm text-gray-600">
                  Photos are analyzed instantly and deleted immediately
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🧕</span>
              <div>
                <h3 className="font-semibold text-gray-900">Personalized Hijab Recommendations</h3>
                <p className="text-body-sm text-gray-600">
                  Real products recommended based on your analysis results
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">📱</span>
              <div>
                <h3 className="font-semibold text-gray-900">Convenient DM Delivery</h3>
                <p className="text-body-sm text-gray-600">
                  Receive your recommendations directly via Instagram DM
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
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
              disabled={!isValid}
              fullWidth
              size="lg"
            >
              Start Analysis
            </Button>
          </form>

          {/* Privacy Notice */}
          <p className="mt-6 text-caption text-gray-500 text-center">
            Your Instagram ID is used only for delivering recommendations
            <br />
            and will be safely deleted after service completion.
          </p>
      </div>
    </PageLayout>
  );
};

export default IntroPage;