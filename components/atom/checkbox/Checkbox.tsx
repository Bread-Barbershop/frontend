import { VariantProps } from 'class-variance-authority';
import { CheckIcon } from 'lucide-react';
import { forwardRef, type InputHTMLAttributes } from 'react';

import { cn } from '@/utils/cn';

import { sizeVariants } from './CheckBox.style';

interface CheckBoxProps
  extends
    Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof sizeVariants> {}

export const CheckBox = forwardRef<HTMLInputElement, CheckBoxProps>(
  ({ className, size, checked, ...props }, ref) => {
    return (
      <label className="relative flex-center">
        <input
          ref={ref}
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          {...props}
        />
        <div className={cn(sizeVariants({ size }), className)}>
          {checked && (
            <CheckIcon className="size-full text-white" strokeWidth={3} />
          )}
        </div>
      </label>
    );
  }
);

CheckBox.displayName = 'CheckBox';
