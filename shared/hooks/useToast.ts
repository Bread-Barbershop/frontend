import {
  useToastStore,
  type ToastXPosition,
  type ToastYPosition,
} from '../store/useToastStore';

export const useToast = () => {
  const showToast = useToastStore(state => state.showToast);
  const hideToast = useToastStore(state => state.hideToast);

  const success = (message: string, xPosition?: ToastXPosition, yPosition?: ToastYPosition) =>
    showToast(message, 'success', xPosition, yPosition);
  const error = (message: string, xPosition?: ToastXPosition, yPosition?: ToastYPosition) =>
    showToast(message, 'error', xPosition, yPosition);
  const warning = (message: string, xPosition?: ToastXPosition, yPosition?: ToastYPosition) =>
    showToast(message, 'warning', xPosition, yPosition);
  const info = (message: string, xPosition?: ToastXPosition, yPosition?: ToastYPosition) =>
    showToast(message, 'info', xPosition, yPosition);

  return {
    showToast,
    hideToast,
    success,
    error,
    warning,
    info,
  };
};
