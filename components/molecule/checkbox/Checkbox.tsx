'use client';

import { forwardRef, InputHTMLAttributes, ReactNode, useId } from 'react';

import { CheckboxIndicator } from '@/components/atoms/checkbox-indicator';
import { Label } from '@/components/atoms/label';
import { cn } from '@/utils/cn';

import { checkboxVariants } from './Check.style';

interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size'
> {
  className?: string;
  children: ReactNode;
  id?: string;
  direction?: 'right' | 'left' | 'top' | 'bottom';
}
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      children,
      id,
      className,
      disabled = false,
      direction = 'right',
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const checkboxId = id || generatedId;

    return (
      <div
        tabIndex={0}
        className={cn(checkboxVariants({ direction, disabled }), className)}
      >
        <CheckboxIndicator
          size="sm"
          ref={ref}
          id={checkboxId}
          disabled={disabled}
          {...props}
        />
        <Label
          htmlFor={checkboxId}
          className={cn(
            'select-none',
            (direction === 'top' || direction === 'bottom') &&
              'min-h-0 py-0 px-0'
          )}
        >
          {children}
        </Label>
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
