import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex justify-center items-center gap-0.5 text-[13px] leading-4 rounded-lg border transition-colors cursor-pointer disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        solid:
          'bg-white text-black border-[#EAEAEA] active:border-[#1F72EF] disabled:active:border-[#EAEAEA] h-8 py-2',
        ghost:
          'bg-transparent border-transparent text-[#1F72EF] px-2 hover:bg-[#1F72EF]/8 disabled:text-[#D1D5DB] disabled:bg-transparent',
      },
      size: {
        sm: 'w-[57px]',
        md: 'w-[131px]',
        lg: 'w-[335px]',
      },
    },
    // ghost 타입일 경우 다른 스타일
    compoundVariants: [
      {
        variant: 'ghost',
        size: 'sm',
        className: 'w-auto h-8',
      },
      {
        variant: 'ghost',
        size: 'md',
        className: 'w-auto h-[44px]',
      },
      {
        variant: 'ghost',
        size: 'lg',
        className: 'w-[335px] h-[44px]',
      },
    ],
    defaultVariants: {
      variant: 'solid',
      size: 'sm',
    },
  }
);

export const iconVariants = cva('inline-flex items-center justify-center', {
  variants: {
    size: {
      sm: 'size-3',
      md: 'size-4',
    },
  },
  defaultVariants: {
    size: 'sm',
  },
});
