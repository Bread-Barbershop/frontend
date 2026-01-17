import { cva } from 'class-variance-authority';

export const toastBarVariants = cva(
  'relative flex-center max-w-[375px] w-full rounded-lg px-10  py-1.5 border text-sm font-bold',
  {
    variants: {
      variant: {
        success:
          'border-status-success text-status-success bg-status-success-bg',
        error: 'border-status-error text-status-error bg-status-error-bg',
        warning:
          'border-status-warning text-status-warning bg-status-warning-bg',
        info: 'border-status-info text-status-info bg-status-info-bg',
      },
    },
  }
);
