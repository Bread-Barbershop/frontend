import { cva } from 'class-variance-authority';

export const navigationBarClassName =
  'relative flex-center w-full h-11 bg-transparent';

export const navigationBarHeadingClassName =
  'select-none font-semibold text-[14px] py-[13.5px] text-center';

export const actionVariants = cva(
  'absolute inset-y-0 flex items-center select-none',
  {
    variants: {
      direction: {
        left: 'left-0',
        right: 'right-0',
      },
    },
    defaultVariants: {
      direction: 'right',
    },
  }
);
