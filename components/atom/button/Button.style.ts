import { cva } from 'class-variance-authority';

export const buttonVariants = cva('inline-flex justify-center items-center', {
  variants: {
    variant: {
      primary: 'bg-blue-600 text-white',
      secondary: 'bg-gray-600 text-white',
      danger: 'bg-red-600 text-white',
    },
    size: {
      sm: 'text-sm',
      md: 'text-md',
      lg: 'text-lg',
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
});
