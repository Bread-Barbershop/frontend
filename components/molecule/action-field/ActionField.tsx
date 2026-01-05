import React, { useId, ComponentPropsWithoutRef } from 'react';

import { Button } from '@/components/atom/button';
import { Input } from '@/components/atom/input';
import { Label } from '@/components/atom/label';
import { cn } from '@/utils/cn';

interface ActionFieldProps {
  id?: string;
  label: string;
  disabled?: boolean;
  className?: string;
  buttonProps?: ComponentPropsWithoutRef<typeof Button>;
  inputProps?: ComponentPropsWithoutRef<typeof Input>;
}

export const ActionField = ({
  id,
  label,
  disabled = false,
  className,
  buttonProps = {},
  inputProps = {},
}: ActionFieldProps) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Label htmlFor={inputId} className="font-semibold shrink-0">
        {label}
      </Label>
      <Input
        id={inputId}
        {...inputProps} // 모든 표준 속성 주입
        disabled={disabled || inputProps.disabled}
        className={cn('flex-1', inputProps.className)}
      />
      <Button
        {...buttonProps} // 모든 표준 속성 주입
        disabled={disabled || buttonProps.disabled}
      />
    </div>
  );
};
