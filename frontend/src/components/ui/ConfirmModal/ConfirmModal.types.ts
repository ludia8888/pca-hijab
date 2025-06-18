export type ConfirmModalType = 'danger' | 'warning' | 'info';

export interface ConfirmModalProps {
  isOpen: boolean;
  type?: ConfirmModalType;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}