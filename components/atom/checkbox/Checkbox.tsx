import { VariantProps } from 'class-variance-authority';
import { CheckIcon } from 'lucide-react';
import { type InputHTMLAttributes } from 'react';

import { cn } from '@/utils/cn';

import { sizeVariants } from './CheckBox.style';

interface CheckBoxProps
  extends
    Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof sizeVariants> {}

export const CheckBox = ({
  className,
  size,
  checked,
  ...props
}: CheckBoxProps) => {
  return (
    <div>
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        {...props}
      />
      <div className={cn(sizeVariants({ size }), className)}>
        {checked && (
          <CheckIcon className="size-full text-white" strokeWidth={2.5} />
        )}
      </div>
    </div>
  );
};
