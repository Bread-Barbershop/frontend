import { create } from 'zustand';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastState {
  message: string | null;
  variant: ToastVariant;
  isVisible: boolean;
  showToast: (message: string, variant?: ToastVariant) => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>(set => ({
  message: null,
  variant: 'success',
  isVisible: false,
  showToast: (message, variant = 'success') => {
    set({ message, variant, isVisible: true });

    // 3초 후 자동으로 숨김
    setTimeout(() => {
      set({ isVisible: false });
    }, 3000);
  },
  hideToast: () => set({ isVisible: false }),
}));
