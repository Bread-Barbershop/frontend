import { cva } from 'class-variance-authority';

export const checkboxVariants = cva('inline-flex items-center gap-1.5', {
  variants: {
    direction: {
      right: 'flex-row',
      left: 'flex-row-reverse',
      top: 'flex-col-reverse',
      bottom: 'flex-col',
    },
    disabled: {
      true: 'cursor-not-allowed opacity-50',
      false: 'cursor-pointer opacity-100',
    },
  },
  defaultVariants: {
    direction: 'right',
    disabled: false,
  },
});
