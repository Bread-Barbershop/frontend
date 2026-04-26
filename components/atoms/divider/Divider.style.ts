import { cva, VariantProps } from 'class-variance-authority';

export const dividerVariants = cva('flex flex-col gap-1.5', {
  variants: {
    padding: {
      left: 'pl-7',
      none: 'pl-0',
    },
  },
  defaultVariants: {
    padding: 'left',
  },
});

export type DividerVariants = VariantProps<typeof dividerVariants>;
