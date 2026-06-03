import { cva } from 'class-variance-authority';

export const toastBarVariants = cva(
  'relative inline-flex h-8 w-fit items-center justify-center rounded-lg border bg-white pl-[70px] pr-[60px] font-pretendard text-[14px] font-bold leading-5',
  {
    variants: {
      variant: {
        success:
          'border-[#2DB400] text-[#2DB400] shadow-[0_8px_24px_0_rgba(45,180,0,0.08),0_2px_10px_0_rgba(45,180,0,0.1)]',
        error:
          'border-[#FF0000] text-[#FF0000] shadow-[0_8px_24px_0_rgba(255,0,0,0.08),0_2px_10px_0_rgba(255,0,0,0.1)]',
        warning:
          'border-[#FF8C00] text-[#FF8C00] shadow-[0_8px_24px_0_rgba(255,140,0,0.08),0_2px_10px_0_rgba(255,140,0,0.1)]',
        info: 'border-[#1C7ED6] text-[#1C7ED6] shadow-[0_8px_24px_0_rgba(28,126,214,0.08),0_2px_10px_0_rgba(28,126,214,0.1)]',
      },
    },
  }
);
