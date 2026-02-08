import { cva } from 'class-variance-authority';

export const pictureVariants = cva(
  'inline-flex items-center justify-center w-15 h-15 order border-dashed cursor-pointer border border-dashed'
);
