import { cva } from 'class-variance-authority';

export const imageWrapperVariants = cva('relative overflow-hidden', {
  variants: {
    fill: {
      true: 'w-full h-full',
      false: 'inline-block',
    },
  },
  defaultVariants: {
    fill: false,
  },
});

export const imageVariants = cva('transition-opacity duration-300', {
  variants: {
    loading: {
      true: 'opacity-0',
      false: 'opacity-100',
    },
  },
  defaultVariants: {
    loading: true,
  },
});

export const skeletonVariants = cva(
  'absolute inset-0 z-10 animate-pulse bg-neutral-200 dark:bg-neutral-800'
);
