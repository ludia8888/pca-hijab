import React from 'react';
import { ImageAnalysisErrorType, getImageAnalysisErrorInfo } from '@/utils/imageAnalysisErrors';
import { trackEvent } from '@/utils/analytics';

interface ImageAnalysisErrorProps {
  errorType: ImageAnalysisErrorType;
  onRetry: () => void;
  onChangeImage: () => void;
  className?: string;
}

export const ImageAnalysisError: React.FC<ImageAnalysisErrorProps> = ({
  errorType,
  onRetry,
  onChangeImage,
  className = ''
}) => {
  const errorInfo = getImageAnalysisErrorInfo(errorType);

  const handleRetry = () => {
    trackEvent('button_click', {
      button_name: 'retry_analysis',
      error_type: errorType,
      page: 'analysis_error'
    });
    onRetry();
  };

  const handleChangeImage = () => {
    trackEvent('button_click', {
      button_name: 'change_image',
      error_type: errorType,
      page: 'analysis_error'
    });
    onChangeImage();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-orange-200 bg-orange-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getSeverityTextColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-orange-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };

  return (
    <div className={`rounded-xl border-2 p-6 ${getSeverityColor(errorInfo.severity)} ${className}`}>
      {/* Header */}
      <div className="flex items-start space-x-4 mb-4">
        <div className="text-4xl flex-shrink-0">
          {errorInfo.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-xl font-bold ${getSeverityTextColor(errorInfo.severity)} mb-2`}>
            {errorInfo.title}
          </h3>
          <p className={`${getSeverityTextColor(errorInfo.severity)} mb-4`}>
            {errorInfo.message}
          </p>
        </div>
      </div>

      {/* Solutions */}
      <div className="mb-6">
        <h4 className={`font-semibold ${getSeverityTextColor(errorInfo.severity)} mb-3`}>
          💡 Here's what to try:
        </h4>
        <ul className="space-y-2">
          {errorInfo.solutions.map((solution, index) => (
            <li key={index} className={`flex items-start space-x-2 ${getSeverityTextColor(errorInfo.severity)}`}>
              <span className="text-sm font-medium flex-shrink-0 mt-0.5">
                {index + 1}.
              </span>
              <span className="text-sm">
                {solution}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleRetry}
          className="flex-1 px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors duration-200 shadow-md hover:shadow-lg"
        >
          🔄 Try Again
        </button>
        <button
          onClick={handleChangeImage}
          className="flex-1 px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors duration-200 shadow-md hover:shadow-lg"
        >
          📷 Choose Different Photo
        </button>
      </div>

      {/* Additional Tips for Critical Errors */}
      {errorInfo.severity === 'error' && (
        <div className="mt-4 p-4 bg-white/50 rounded-lg border border-white/80">
          <div className="flex items-start space-x-2">
            <span className="text-lg">💡</span>
            <div className="flex-1">
              <p className={`text-sm font-medium ${getSeverityTextColor(errorInfo.severity)} mb-1`}>
                Perfect selfie tips:
              </p>
              <ul className={`text-xs ${getSeverityTextColor(errorInfo.severity)} space-y-1`}>
                <li>• Take photos near a window with natural light</li>
                <li>• Make your face fill 60-80% of the frame</li>
                <li>• Face forward and keep your head straight</li>
                <li>• Show your entire face from forehead to chin</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageAnalysisError;