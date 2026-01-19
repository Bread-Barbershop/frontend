import { cva } from "class-variance-authority";

export const multiRowInputVariants = cva(
  'max-h-30 h-30 w-full p-3 text-center rounded-lg border border-transparent transition-color duration-100 placeholder:text-text-secondary bg-border-neutral enabled:focus:bg-bg-base enabled:focus:outline-none enabled:focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed resize-none'
)