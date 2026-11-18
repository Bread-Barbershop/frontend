'use client';

import { createPortal } from 'react-dom';

import { useToastStore } from '@/shared/store/useToastStore';

import { ToastBar } from './ToastBar';

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
      className={`fixed top-10 left-1/2 -translate-x-1/2 z-[50000] w-fit max-w-[calc(100vw-32px)] transition-all duration-300 pointer-events-none ${getToastVisibilityClass(isVisible, options.animation)}`}
    >
      <ToastBar message={message} variant={variant} />
    </div>,
    document.body
  );
};
