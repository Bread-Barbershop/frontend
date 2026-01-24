import { cva } from 'class-variance-authority';

export const actionVariants = cva('absolute inset-y-0 flex items-center', {
  variants: {
    direction: {
      left: 'left-0',
      right: 'right-0',
    },
  },
  defaultVariants: {
    direction: 'right',
  },
});
