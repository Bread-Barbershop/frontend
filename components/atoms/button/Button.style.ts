import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex justify-center items-center gap-0.5 rounded-lg cursor-pointer disabled:cursor-not-allowed h-8 py-2 px-0.5 bg-bg-base text-text-primary enabled:hover:bg-btn-hover enabled:active:bg-btn-pressed disabled:text-btn-disabled',
  {
    variants: {
      variant: {
        bordered: 'border border-border-neutral',
        borderless: 'border-none bg-transparent',
      },
      size: {
        sm: 'w-[57px]',
        md: 'w-[131px]',
        lg: 'w-[335px]',
      },
      shadow: {
        default: 'shadow-none',
        custom: 'shadow-custom',
      },
    },
    defaultVariants: {
      variant: 'bordered',
      size: 'sm', 
      shadow: 'default',
    },
  }
);
