'use client';

import { forwardRef, InputHTMLAttributes, ReactNode, useId } from 'react';

import { CheckboxIndicator } from '@/components/atoms/checkbox-indicator';
import { Label } from '@/components/atoms/label';
import { cn } from '@/shared/utils/cn';

import { checkboxVariants } from './Check.style';

interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size'
> {
  className?: string;
  children: ReactNode;
  id?: string;
  direction?: 'right' | 'left' | 'top' | 'bottom';
  dimDisabled?: boolean;
}
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      children,
      id,
      className,
      disabled = false,
      direction = 'right',
      dimDisabled = true,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const checkboxId = id || generatedId;

    return (
      <div
        tabIndex={0}
        className={cn(
          checkboxVariants({ direction, disabled }),
          disabled && !dimDisabled && 'opacity-100',
          className
        )}
      >
        <CheckboxIndicator
          size="sm"
          ref={ref}
          id={checkboxId}
          disabled={disabled}
          dimDisabled={dimDisabled}
          {...props}
        />
        <Label
          htmlFor={checkboxId}
          className={cn(
            'pl-0 select-none',
            (direction === 'top' || direction === 'bottom') &&
              'min-h-0 py-0 px-0',
            props.checked ? 'text-text-primary' : 'text-text-tertiary'
          )}
        >
          {children}
        </Label>
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
