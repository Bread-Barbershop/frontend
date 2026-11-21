import { create } from 'zustand';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';
export type ToastAnimation = 'slide' | 'fade';

export interface ToastOptions {
  animation?: ToastAnimation;
  id?: string;
}

const defaultToastOptions: Required<ToastOptions> = {
  animation: 'slide',
  id: '',
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
  hideToast: (id?: string) => void;
}

let toastTimer: ReturnType<typeof setTimeout>;

export const useToastStore = create<ToastState>((set, get) => ({
  message: null,
  variant: 'success',
  isVisible: false,
  options: defaultToastOptions,
  showToast: (message, variant = 'success', options = {}) => {
    clearTimeout(toastTimer);
    set({
      message,
      variant,
      options: { ...defaultToastOptions, ...options },
      isVisible: true,
    });

    // 3초 후 자동으로 숨김
    toastTimer = setTimeout(() => {
      set({ isVisible: false });
      toastTimer = setTimeout(() => set({ message: null }), 300);
    }, 3000);
  },
  hideToast: id => {
    if (id !== undefined && id !== get().options.id) return;
    clearTimeout(toastTimer);
    set({ isVisible: false, message: null });
  },
}));
