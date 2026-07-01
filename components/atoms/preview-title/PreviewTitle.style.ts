import { cva } from 'class-variance-authority';

export const previewTitleVariants = cva(
  'w-full text-center whitespace-pre-wrap break-keep',
  {
    variants: {
      language: {
        sub: 'text-[13px] text-[#FA7564] font-semibold tracking-wide',
        main: 'text-[20px] text-[#FA7564] font-semibold',
      },
    },
    defaultVariants: {
      language: 'sub',
    },
  }
);
