import { VariantProps } from 'class-variance-authority';
import { forwardRef, type InputHTMLAttributes } from 'react';

import { cn } from '@/shared/utils/cn';

import { indicatorVariants, radioVariants } from './Radio.style';

interface RadioProps
  extends
    Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof radioVariants> {}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className, size, ...props }, ref) => {
    return (
      <label className="relative flex-center" aria-hidden="true">
        <input ref={ref} type="radio" className="peer sr-only" {...props} />
        <div className={cn(radioVariants({ size }), className)} />
        <div className={cn(indicatorVariants({ size }))} />
      </label>
    );
  }
);

Radio.displayName = 'Radio';
