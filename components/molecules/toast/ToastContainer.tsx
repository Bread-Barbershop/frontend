'use client';

import { createPortal } from 'react-dom';

import { useToastStore } from '@/shared/store/useToastStore';

import { ToastBar } from './ToastBar';

export const ToastContainer = () => {
  const { message, variant, isVisible } = useToastStore();

  if (!message) return null;

  return createPortal(
    <div
      className={`fixed left-1/2 top-10 z-[1000] flex w-fit -translate-x-1/2 justify-center transition-all duration-300 pointer-events-none ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      <ToastBar message={message} variant={variant} />
    </div>,
    document.body
  );
};
