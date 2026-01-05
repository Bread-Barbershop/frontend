import { ComponentPropsWithoutRef, useId } from 'react';

import { Input } from '@/components/atom/input';
import { Label } from '@/components/atom/label';
import { cn } from '@/utils/cn';

interface MultiFieldProps {
  id?: string;
  label: string;
  disabled?: boolean;
  className?: string;
  mainInputProps?: ComponentPropsWithoutRef<typeof Input>;
  subInputProps?: ComponentPropsWithoutRef<typeof Input>;
}

// 작은 인풋은 sub, 큰 인풋은 main
export const MultiField = ({
  id,
  label,
  disabled = false,
  className,
  mainInputProps = {},
  subInputProps = {},
}: MultiFieldProps) => {
  const generatedId = useId();
  const baseId = id || generatedId;

  const mainId = `${baseId}-first`;
  const subId = `${baseId}-second`;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Label htmlFor={subId} className="font-semibold shrink-0">
        {label}
      </Label>
      <Input
        id={subId}
        {...subInputProps}
        disabled={disabled || subInputProps.disabled}
        className={cn(subInputProps.className)}
      />
      <Input
        id={mainId}
        {...mainInputProps}
        disabled={disabled || mainInputProps.disabled}
        className={cn(mainInputProps.className)}
      />
    </div>
  );
};
