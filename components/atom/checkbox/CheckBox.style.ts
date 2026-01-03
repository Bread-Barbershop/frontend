import { cva } from 'class-variance-authority';

export const sizeVariants = cva(
  'flex-center rounded-sm bg-neutral-border transition-colors peer-checked:bg-primary peer-disabled:opacity-50 peer-disabled:cursor-not-allowed',
  {
    variants: {
      size: {
        sm: 'w-3.5 h-3.5',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
      },
    },
    defaultVariants: {
      size: 'sm',
    },
  }
);
