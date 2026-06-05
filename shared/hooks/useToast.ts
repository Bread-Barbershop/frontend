import { 
  ToastOptions,
  useToastStore,
  type ToastXPosition,
  type ToastYPosition,
 } from '../store/useToastStore';


export const useToast = () => {
  const showToast = useToastStore(state => state.showToast);
  const hideToast = useToastStore(state => state.hideToast);

  const success = (message: string, options?: ToastOptions, xPosition?: ToastXPosition, yPosition?: ToastYPosition) =>
    showToast(message, 'success', options, xPosition, yPosition);
  const error = (message: string, options?: ToastOptions, xPosition?: ToastXPosition, yPosition?: ToastYPosition) =>
    showToast(message, 'error', options, xPosition, yPosition);
  const warning = (message: string, options?: ToastOptions, xPosition?: ToastXPosition, yPosition?: ToastYPosition) =>
    showToast(message, 'warning', options, xPosition, yPosition);
  const info = (message: string, options?: ToastOptions, xPosition?: ToastXPosition, yPosition?: ToastYPosition) =>
    showToast(message, 'info', options, xPosition, yPosition);

  return {
    showToast,
    hideToast,
    success,
    error,
    warning,
    info,
  };
};
