import { cva } from 'class-variance-authority';

export const GalleryCarouselVariants = cva(
  'flex-[0_0_70%] relative w-full h-full',
  {
    variants: {
      variant: {
        galleryType1: 'flex-[0_0_70%]',
        galleryType2: 'flex-[0_0_70%]',
        galleryType3: 'transition-all duration-500',
        galleryType4: 'flex-[0_0_70%]',
        galleryType5: 'flex-[0_0_70%]',
      },
      ratio: {
        '1:1': 'aspect-square',
        '4:3': 'aspect-[4/3]',
        '3:4': 'aspect-[3/4]',
        '9:16': 'aspect-[9/16]',
        '16:9': 'aspect-[16/9]',
        none: '',
      },
    },
    defaultVariants: {
      variant: 'galleryType1',
      ratio: '1:1',
    },
  }
);
