import { cva } from 'class-variance-authority';

export const pictureInputVariants = cva(
  'relative overflow-hidden inline-flex items-center justify-center w-15 h-15 order border-dashed cursor-pointer border border-dashed'
);
