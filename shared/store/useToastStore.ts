import { create } from 'zustand';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';
export type ToastXPosition = 'left' | 'center' | 'right';
export type ToastYPosition = 'top' | 'bottom';

interface ToastState {
  message: string | null;
  variant: ToastVariant;
  isVisible: boolean;
  xPosition: ToastXPosition;
  yPosition: ToastYPosition;
  showToast: (
    message: string,
    variant?: ToastVariant,
    xPosition?: ToastXPosition,
    yPosition?: ToastYPosition
  ) => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>(set => ({
  message: null,
  variant: 'success',
  isVisible: false,
  xPosition: 'center',
  yPosition: 'top',
  showToast: (message, variant = 'success', xPosition = 'center', yPosition = 'top') => {
    
    set({ message, variant, xPosition, yPosition, isVisible: true });

    // 3초 후 자동으로 숨김
    setTimeout(() => {
      
      set({ isVisible: false });
    }, 3000);
  },
  hideToast: () => set({ isVisible: false }),
}));
