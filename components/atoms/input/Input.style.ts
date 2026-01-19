import { cva } from 'class-variance-authority';

export const inputVariants = cva(
  'min-h-8 px-3 text-center rounded-lg border border-transparent transition-color duration-100 placeholder:text-text-secondary bg-border-neutral enabled:focus:bg-bg-base enabled:focus:outline-none enabled:focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      size: {
        fixed: 'w-[65px]',
        full: 'w-full flex-1',
      },
    },
    defaultVariants: {
      size: 'full',
    },
  }
);
