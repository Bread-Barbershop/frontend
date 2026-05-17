import { useToastStore } from '../store/useToastStore';

export const useToast = () => {
  const showToast = useToastStore(state => state.showToast);
  const hideToast = useToastStore(state => state.hideToast);

  const success = (message: string) => showToast(message, 'success');
  const error = (message: string) => showToast(message, 'error');
  const warning = (message: string) => showToast(message, 'warning');
  const info = (message: string) => showToast(message, 'info');

  return {
    showToast,
    hideToast,
    success,
    error,
    warning,
    info,
  };
};
