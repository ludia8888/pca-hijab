import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Lock } from 'lucide-react';
import { Button } from '@/components/ui';
import { trackEvent } from '@/utils/analytics';

interface AuthRequiredProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
}

export const AuthRequired: React.FC<AuthRequiredProps> = ({
  isOpen,
  onClose,
  feature = 'this feature'
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = () => {
    trackEvent('auth_required_action', {
      action: 'navigate_to_login',
      feature,
      from_path: location.pathname
    });
    
    // Navigate to login with current location as state
    navigate('/login', { state: { from: location } });
    onClose();
  };

  const handleSignup = () => {
    trackEvent('auth_required_action', {
      action: 'navigate_to_signup',
      feature,
      from_path: location.pathname
    });
    
    // Navigate to signup with current location as state
    navigate('/signup', { state: { from: location } });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform transition-all bg-white rounded-2xl shadow-xl">
          <div className="p-6">
            {/* Icon */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 mb-4">
              <Lock className="w-8 h-8 text-purple-600" />
            </div>

            {/* Content */}
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Sign-in required
              </h3>
              <p className="text-gray-600 mb-6">
                Please sign in to use {feature}.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={handleLogin}
                fullWidth
                size="lg"
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Sign in
              </Button>
              
              <Button
                onClick={handleSignup}
                variant="outline"
                fullWidth
                size="lg"
              >
                Create account
              </Button>
              
              <button
                onClick={onClose}
                className="w-full text-center text-sm text-gray-500 hover:text-gray-700 mt-3"
              >
                Maybe later
              </button>
            </div>

            {/* Additional info */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="text-sm text-gray-600">
                  <p className="font-medium mb-1">Benefits</p>
                  <ul className="space-y-1 text-gray-500">
                    <li>• Save your personal color diagnosis</li>
                    <li>• Receive tailored product recommendations</li>
                    <li>• Manage favorite products</li>
                    <li>• Review your purchase history</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
