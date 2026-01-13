import { VariantProps } from 'class-variance-authority';
import { LabelHTMLAttributes } from 'react';

import { cn } from '@/shared/utils/cn';

import { labelVariants } from './Label.style';

interface LabelProps
  extends
    LabelHTMLAttributes<HTMLLabelElement>,
    VariantProps<typeof labelVariants> {}

export const Label = ({ children, className, ...props }: LabelProps) => {
  return (
    <label className={cn(labelVariants(), className)} {...props}>
      {children}
    </label>
  );
};
