import { cva } from 'class-variance-authority';

const commonStyles =
  'peer-disabled:opacity-50 peer-disabled:cursor-not-allowed cursor-pointer';

export const sizeVariants = cva(
  `flex-center rounded-sm bg-border-neutral peer-checked:bg-primary ${commonStyles}`,
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

export const iconVariants = cva(
  `absolute text-white opacity-0 peer-checked:opacity-100 ${commonStyles}`,
  {
    variants: {
      size: {
        sm: 'size-3',
        md: 'size-4',
        lg: 'size-5',
      },
    },
    defaultVariants: { size: 'sm' },
  }
);
