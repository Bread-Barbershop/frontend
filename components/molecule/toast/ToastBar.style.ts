import { cva } from 'class-variance-authority';

export const toastBarVariants = cva(
  'relative flex-center max-w-[375px] w-full rounded-lg px-10  py-1.5 border text-sm font-bold',
  {
    variants: {
      variant: {
        success:
          'border-toast-success-primary text-toast-success-primary bg-toast-success-secondary',
        error:
          'border-toast-error-primary text-toast-error-primary bg-toast-error-secondary',
        warning:
          'border-toast-warning-primary text-toast-warning-primary bg-toast-warning-secondary',
        info: 'border-toast-info-primary text-toast-info-primary bg-toast-info-secondary',
      },
    },
  }
);
