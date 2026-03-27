import { VariantProps } from 'class-variance-authority';
import { forwardRef, type TextareaHTMLAttributes } from 'react';

import { cn } from '@/shared/utils/cn';

import { multiRowInputVariants } from './MultiRowInput.style';

interface MultiRowInputProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    VariantProps<typeof multiRowInputVariants> {}

export const MultiRowInput = forwardRef<HTMLTextAreaElement, MultiRowInputProps>(
  ({ className, size, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(multiRowInputVariants({ size, className }))}
        {...props}
      />
    );
  }
);

MultiRowInput.displayName = 'MultiRowInput';
