import { ComponentPropsWithoutRef, useId } from 'react';

import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import { cn } from '@/shared/utils/cn';

interface TextFieldProps {
  id?: string;
  label: string;
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
  inputProps?: ComponentPropsWithoutRef<typeof Input>;
}

export const TextField = ({
  id,
  label,
  disabled = false,
  className,
  labelClassName,
  inputProps = {},
}: TextFieldProps) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Label
        htmlFor={inputId}
        className={cn('font-semibold shrink-0', labelClassName)}
      >
        {label}
      </Label>
      <Input
        id={inputId}
        {...inputProps}
        disabled={disabled || inputProps.disabled}
        className={cn(inputProps.className)}
      />
    </div>
  );
};
