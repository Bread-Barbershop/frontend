import { cva } from 'class-variance-authority';

export const imageUploadButtonVariants = cva(
  [
    'w-[60px] h-[60px]',
    'flex items-center justify-center',
    'border border-dashed',
    'cursor-pointer',
    'transition-colors',
    'hover:bg-gray-50',
  ].join(' '),
  {
    variants: {
      disabled: {
        true: 'opacity-50 cursor-not-allowed',
        false: '',
      },
    },
    defaultVariants: {
      disabled: false,
    },
  }
);
