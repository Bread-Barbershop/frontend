import { ToastOptions, useToastStore } from '../store/useToastStore';

export const useToast = () => {
  const showToast = useToastStore(state => state.showToast);
  const hideToast = useToastStore(state => state.hideToast);

  const success = (message: string, options?: ToastOptions) =>
    showToast(message, 'success', options);
  const error = (message: string, options?: ToastOptions) =>
    showToast(message, 'error', options);
  const warning = (message: string, options?: ToastOptions) =>
    showToast(message, 'warning', options);
  const info = (message: string, options?: ToastOptions) =>
    showToast(message, 'info', options);

  return {
    showToast,
    hideToast,
    success,
    error,
    warning,
    info,
  };
};
