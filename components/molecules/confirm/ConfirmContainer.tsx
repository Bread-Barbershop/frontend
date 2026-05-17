'use client';

import { useConfirmStore } from '@/shared/store/useConfirmStore';

import Confirm from './Confirm';

export const ConfirmContainer = () => {
  const {
    isOpen,
    message,
    confirmText,
    cancelText,
    variant,
    xPosition,
    yPosition,
    handleConfirm,
    handleCancel,
    handleClose,
  } = useConfirmStore();

  if (!isOpen) return null;

  return (
    <Confirm
      message={message}
      confirmText={confirmText}
      cancelText={cancelText}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
      onClose={handleClose}
      variant={variant}
      xPosition={xPosition}
      yPosition={yPosition}
    />
  );
};
