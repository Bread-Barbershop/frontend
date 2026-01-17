import { cva } from "class-variance-authority";

export const utilityButtonVariants = cva(
  'inline-flex justify-center items-center gap-0.5 px-2 rounded-lg enabled:hover:bg-btn-hover enabled:cursor-pointer disabled:cursor-not-allowed disabled:text-btn-disabled',
  {
    variants: {
      variant: {
        primary: "text-primary  enabled:active:bg-primary-hover",
        danger: "text-btn-close enabled:active:bg-btn-close-pressed",
      },
      size: {
        sm: 'h-8',
        md: 'h-11',
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'sm',
    },
  }
);