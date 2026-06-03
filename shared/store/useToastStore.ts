import { create } from 'zustand';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';
export type ToastPlacement = 'top' | 'save-modal-bottom';
export type ToastAnimation = 'slide' | 'fade';

export interface ToastOptions {
  placement?: ToastPlacement;
  animation?: ToastAnimation;
}

const defaultToastOptions: Required<ToastOptions> = {
  placement: 'top',
  animation: 'slide',
};

interface ToastState {
  message: string | null;
  variant: ToastVariant;
  isVisible: boolean;
  options: Required<ToastOptions>;
  showToast: (
    message: string,
    variant?: ToastVariant,
    options?: ToastOptions
  ) => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>(set => ({
  message: null,
  variant: 'success',
  isVisible: false,
  options: defaultToastOptions,
  showToast: (message, variant = 'success', options = {}) => {
    set({
      message,
      variant,
      options: { ...defaultToastOptions, ...options },
      isVisible: true,
    });

    // 3초 후 자동으로 숨김
    setTimeout(() => {
      set({ isVisible: false });
    }, 3000);
  },
  hideToast: () => set({ isVisible: false }),
}));
