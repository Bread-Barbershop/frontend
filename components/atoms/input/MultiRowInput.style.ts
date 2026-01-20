import { cva } from "class-variance-authority";

export const multiRowInputVariants = cva(
  'flex-shrink-0 min-w-full text-center rounded-lg placeholder:text-text-secondary focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed whitespace-pre-wrap break-all before:text-text-secondary before:content-[attr(data-placeholder)] empty:before:block before:hidden'
)