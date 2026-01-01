import { VariantProps } from 'class-variance-authority';
import { InputHTMLAttributes } from 'react';

import { cn } from '@/utils/cn';

import { inputVariants } from './Input.style';

interface InputProps
  extends
    InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

export const Input = ({ className, ...props }: InputProps) => {
  return <input className={cn(inputVariants({ className }))} {...props} />;
};
