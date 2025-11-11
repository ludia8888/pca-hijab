import type { ReactNode } from 'react';

export type ConfirmModalType = 'danger' | 'warning' | 'info';

export interface ConfirmModalProps {
  isOpen: boolean;
  type?: ConfirmModalType;
  title: string;
  message: string;
  // 추가 부가 컨텐츠(설명, 링크 등)를 렌더링하기 위한 슬롯
  extra?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}
