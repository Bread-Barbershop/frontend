'use client';

import { createPortal } from 'react-dom';

import { useToastStore } from '@/shared/store/useToastStore';

import { ToastBar } from './ToastBar';

const toastPlacementClass = {
  top: 'top-10',
  'save-modal-bottom': 'top-[calc(50%+200.5px)]',
};

const getToastVisibilityClass = (
  isVisible: boolean,
  animation: 'slide' | 'fade'
) => {
  if (animation === 'fade') {
    return isVisible ? 'opacity-100' : 'opacity-0';
  }

  return isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4';
};

export const ToastContainer = () => {
  const { message, variant, isVisible, options } = useToastStore();

  if (!message) return null;

  return createPortal(
    <div
      className={`fixed left-1/2 z-[1000] flex w-fit -translate-x-1/2 justify-center transition-all duration-300 pointer-events-none ${
        toastPlacementClass[options.placement]
      } ${getToastVisibilityClass(isVisible, options.animation)}`}
    >
      <ToastBar message={message} variant={variant} />
    </div>,
    document.body
  );
};
