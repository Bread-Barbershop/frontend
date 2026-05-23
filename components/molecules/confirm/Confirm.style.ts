import { cva } from 'class-variance-authority';

export const confirmVariants = cva(
  'flex w-fit flex-col gap-5 rounded-xl border border-white/22 px-5 pt-5 pb-3 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.12),0_8px_24px_-8px_rgba(0,0,0,0.18),0_1px_8px_-2px_rgba(255,255,255,0.35)] backdrop-blur-xl',
  {
    variants: {
      variant: {
        white: 'bg-white/72',
        glass:
          'bg-[linear-gradient(180deg,_rgba(255,255,255,0.12)_0%,_rgba(255,255,255,0.3)_18%)]',
      },
    },
  }
);
export const confirmPositionVariants = cva('fixed inset-0 z-50 flex', {
  variants: {
    xPosition: {
      left: 'justify-start pl-5',
      center: 'justify-center',
      right: 'justify-end pr-5',
    },
    yPosition: {
      top: 'items-start pt-5',
      center: 'items-center',
      bottom: 'items-end pb-5',
    },
  },
});
