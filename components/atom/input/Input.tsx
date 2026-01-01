import { VariantProps } from 'class-variance-authority';
import { InputHTMLAttributes } from 'react';

import { cn } from '@/utils/cn';

import { inputVariants } from './Input.style';

interface InputProps
  extends
    Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {}

export const Input = ({ className, size, ...props }: InputProps) => {
  return (
    <input className={cn(inputVariants({ className, size }))} {...props} />
  );
};
