import { cva } from 'class-variance-authority';

const commonStyles =
  'rounded-full peer-disabled:opacity-50 peer-disabled:cursor-not-allowed cursor-pointer';

// 1. 배경 박스 스타일
export const radioVariants = cva(
  ` bg-bg-base border-2 border-btn-disabled transition-color duration-200 peer-checked:border-primary ${commonStyles}`,
  {
    variants: {
      size: {
        sm: 'size-5',
        md: 'size-6',
        lg: 'size-8',
      },
    },
    defaultVariants: { size: 'sm' },
  }
);

// 2. 인디케이터(중앙 점) 스타일
export const indicatorVariants = cva(
  `absolute transition-color duration-200 peer-checked:bg-primary ${commonStyles}`,
  {
    variants: {
      size: {
        sm: 'size-3',
        md: 'size-4',
        lg: 'size-6',
      },
    },
    defaultVariants: { size: 'sm' },
  }
);
