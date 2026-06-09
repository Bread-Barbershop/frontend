'use client';

import { createPortal } from 'react-dom';

import { useToastStore, type ToastPlacement } from '@/shared/store/useToastStore';

import { ToastBar } from './ToastBar';

const getPositionClasses = (placement: ToastPlacement): string => {
  const placementClasses: Record<ToastPlacement, string> = {
    'top-left': 'top-10 left-4',
    'top-center': 'top-10 left-1/2 -translate-x-1/2',
    'top-right': 'top-10 right-4',
    'bottom-left': 'bottom-10 left-4',
    'bottom-center': 'bottom-10 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-10 right-4',
    'save-modal-bottom': 'top-[calc(50%+200.5px)] left-1/2 -translate-x-1/2',
  };

  return placementClasses[placement];
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

  const positionClasses = getPositionClasses(options.placement);

  return createPortal(
    <div
      className={`fixed z-[1000] w-full max-w-[375px] transition-all duration-300 pointer-events-none ${positionClasses} ${getToastVisibilityClass(isVisible, options.animation)}`}
    >
      <ToastBar message={message} variant={variant} />
    </div>,
    document.body
  );
};
