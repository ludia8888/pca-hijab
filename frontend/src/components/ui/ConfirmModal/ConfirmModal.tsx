import React, { useEffect } from 'react';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { Button } from '../Button';
import { Card } from '../Card';
import type { ConfirmModalProps } from './ConfirmModal.types';

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  type = 'danger',
  title,
  message,
  extra,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonClass,
  onConfirm,
  onCancel,
  isLoading = false
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <AlertTriangle className="w-6 h-6 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-yellow-600" />;
      case 'info':
        return <Info className="w-6 h-6 text-blue-600" />;
      default:
        return null;
    }
  };

  const getIconBgClass = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-100';
      case 'warning':
        return 'bg-yellow-100';
      case 'info':
        return 'bg-blue-100';
      default:
        return 'bg-gray-100';
    }
  };

  const getDefaultConfirmButtonClass = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500';
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
      default:
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={!isLoading ? onCancel : undefined}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <Card className="relative w-full max-w-md transform transition-all">
          {/* Close button */}
          {!isLoading && (
            <button
              onClick={onCancel}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          <div className="p-6">
            {/* Icon */}
            <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${getIconBgClass()}`}>
              {getIcon()}
            </div>

            {/* Content */}
            <div className="mt-4 text-center">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                {title}
              </h3>
              <div className="mt-3">
                <p className="text-sm text-gray-500 whitespace-pre-line">
                  {message}
                </p>
              </div>
              {extra ? (
                <div className="mt-4">
                  {extra}
                </div>
              ) : null}
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
              <Button
                variant="ghost"
                onClick={onCancel}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                {cancelText}
              </Button>
              <Button
                onClick={onConfirm}
                loading={isLoading}
                disabled={isLoading}
                className={`w-full sm:w-auto text-white ${
                  confirmButtonClass || getDefaultConfirmButtonClass()
                }`}
              >
                {confirmText}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ConfirmModal;
