'use client';

import { createPortal } from 'react-dom';

import { useToastStore } from '@/shared/store/useToastStore';

import { ToastBar } from './ToastBar';

const getPositionClasses = (xPosition: string, yPosition: string): string => {
  const xClasses = {
    left: 'left-4',
    center: 'left-1/2 -translate-x-1/2',
    right: 'right-4',
  };

  const yClasses = {
    top: 'top-10',
    bottom: 'bottom-10',
  };

  return `${xClasses[xPosition as keyof typeof xClasses] || xClasses.center} ${yClasses[yPosition as keyof typeof yClasses] || yClasses.top}`;
};

export const ToastContainer = () => {
  const { message, variant, isVisible, xPosition, yPosition } = useToastStore();

  if (!message) return null;

  const positionClasses = getPositionClasses(xPosition, yPosition);

  return createPortal(
    <div
      className={`fixed z-[1000] w-full max-w-[375px] transition-all duration-300 pointer-events-none ${positionClasses} ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      <ToastBar message={message} variant={variant} />
    </div>,
    document.body
  );
};
