import { LabelHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/utils/cn';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode;
  className?: string;
}

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
