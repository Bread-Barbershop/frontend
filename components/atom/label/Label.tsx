import { LabelHTMLAttributes } from 'react';

import { cn } from '@/utils/cn';

type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export const Label = ({ children, className, ...props }: LabelProps) => {
  return (
    <label
      className={cn(
        'min-h-8 py-2 px-1 text-sm leading-4 text-black',
        className
      )}
      {...props}
    >
      {children}
    </label>
  );
};
