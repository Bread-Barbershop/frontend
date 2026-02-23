import { cva } from 'class-variance-authority';

// 갤러리 컨테이너 레이아웃 전용
export const GalleryLayoutVariants = cva('relative w-full', {
  variants: {
    variant: {
      galleryType1: 'flex',
      galleryType2: 'flex',
      galleryType3: 'flex ',
      galleryType4: 'flex',
      galleryType5: 'flex',
      galleryType6: 'grid grid-cols-3 gap-4.5',
      galleryType7: 'grid grid-cols-2 gap-[15px]',
    },
  },
  defaultVariants: {
    variant: 'galleryType1',
  },
});

// 갤러리 개별 아이템/슬라이드 전용
export const GalleryItemVariants = cva('relative w-full', {
  variants: {
    ratio: {
      '1:1': 'aspect-square',
      '4:3': 'aspect-[4/3]',
      '3:4': 'aspect-[3/4]',
      '9:16': 'aspect-[9/16]',
      '16:9': 'aspect-[16/9]',
      none: '',
    },
    variant: {
      galleryType1: 'flex-[0_0_70%]',
      galleryType2: 'flex-[0_0_70%]',
      galleryType3: 'transition-all duration-500', // focus logic in hook
      galleryType4: 'flex-[0_0_70%]',
      galleryType5: 'flex-[0_0_70%]',
      galleryType6: '',
      galleryType7: '',
    },
  },
  defaultVariants: {
    ratio: '1:1',
    variant: 'galleryType1',
  },
});
