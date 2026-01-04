import { VariantProps } from 'class-variance-authority';
import { CheckIcon } from 'lucide-react';
import { forwardRef, type InputHTMLAttributes } from 'react';

import { cn } from '@/utils/cn';

import { iconVariants, sizeVariants } from './CheckboxIndicator.style';

interface CheckboxProps
  extends
    Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof sizeVariants> {}

export const CheckboxIndicator = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, size, ...props }, ref) => {
    return (
      <label className="relative flex-center" aria-hidden="true">
        <input ref={ref} type="checkbox" className="peer sr-only" {...props} />
        <div className={cn(sizeVariants({ size }), className)} />
        <CheckIcon className={cn(iconVariants({ size }))} strokeWidth={3} />
      </label>
    );
  }
);

CheckboxIndicator.displayName = 'CheckboxIndicator';
