import { cva } from 'class-variance-authority';

export const picturePreviewVariants = cva(
  'relative overflow-hidden inline-flex items-center justify-center w-15 h-15 order cursor-pointer'
);
