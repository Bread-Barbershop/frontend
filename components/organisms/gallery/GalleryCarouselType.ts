import { cva } from 'class-variance-authority';

export const GalleryCarouselVariants = cva(
  'flex-[0_0_70%] relative w-full h-full',
  {
    variants: {
      variant: {
        galleryType1: 'flex-[0_0_70%]', //스케일만 조절
        galleryType2: 'flex-[0_0_70%]', //스케일 + 회전 + y축 이동
        galleryType3: '', //넓이 스케일 조절하면 될듯?
        galleryType4: 'flex-[0_0_70%]', //기본 아무것도 없음
        galleryType5: 'flex-[0_0_70%] p-2 ', //지그재그 어케하지
        galleryType6: {}, //2개씩 묶고 y좌표는 일정 수치만큼 조절하면 되지 않으려나
      },
      ratio: {
        '1:1': 'aspect-square',
        '4:3': 'aspect-[4/3]',
        '3:4': 'aspect-[3/4]',
        '9:16': 'aspect-[9/16]',
        '16:9': 'aspect-[16/9]',
      },
    },
    defaultVariants: {
      variant: 'galleryType1',
      ratio: '1:1',
    },
  }
);
