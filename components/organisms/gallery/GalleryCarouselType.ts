import { cva } from 'class-variance-authority';

// 갤러리 개별 아이템/슬라이드 전용
export const GalleryItemVariants = cva('relative w-full', {
  variants: {
    ratio: {
      '1:1': 'aspect-square',
      '4:3': 'aspect-[4/3]',
      '3:4': 'aspect-[3/4]',
      '9:16': 'aspect-[9/16]',
      '16:9': 'aspect-[16/9]',
    },
  },
  defaultVariants: {
    ratio: '1:1',
  },
});
