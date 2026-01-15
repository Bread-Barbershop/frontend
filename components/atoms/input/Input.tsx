import { VariantProps } from 'class-variance-authority';
import { forwardRef, InputHTMLAttributes } from 'react';

import { cn } from '@/shared/utils/cn';

import { inputVariants } from './Input.style';

interface InputProps
  extends
    Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, size, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(inputVariants({ className, size }))}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
