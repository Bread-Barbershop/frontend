import { cva } from 'class-variance-authority';

export const inputVariants = cva(
  'min-h-8 px-3 text-[13px] leading-4 text-center rounded-lg border border-transparent transition-color duration-200 placeholder:text-text-secondary bg-border-neutral focus:outline-none focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
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
