import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex justify-center items-center h-8 py-2 text-[13px] rounded-lg border border-[#EAEAEA] cursor-pointer',
  {
    variants: {
      variant: {
        fill: 'bg-white text-black active:border-[#1F72EF] transition-colors',
        ghost:
          'border-transparent text-[#1F72EF] py-3.5 hover:bg-[#1F72EF]/8 transition-colors',
      },
      size: {
        sm: 'w-[57px]',
        md: 'w-[131px]',
        lg: 'w-[335px]',
      },
    },
    compoundVariants: [
      {
        variant: 'ghost',
        className: 'w-auto h-auto',
      },
    ],

    defaultVariants: {
      variant: 'fill',
      size: 'sm',
    },
  }
);
