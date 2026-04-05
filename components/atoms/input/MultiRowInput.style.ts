import { cva } from 'class-variance-authority';

export const multiRowInputVariants = cva(
  'min-h-[120px] px-3 py-3 text-center rounded-lg border border-transparent transition-colors duration-100 placeholder:text-text-secondary bg-border-neutral enabled:focus:bg-bg-base enabled:focus:outline-none enabled:focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed resize-none textarea-custom-scrollbar',
  {
    variants: {
      size: {
        fixed: 'w-[377px]',
        full: 'w-full flex-1',
      },
    },
    defaultVariants: {
      size: 'full',
    },
  }
);
