import { ComponentPropsWithoutRef, useId } from 'react';

import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import { cn } from '@/shared/utils/cn';

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

  const mainId = `${baseId}-main`;
  const subId = `${baseId}-sub`;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Label htmlFor={mainId} className="font-semibold shrink-0">
        {label}
      </Label>
      <Input
        id={subId}
        {...subInputProps}
        disabled={disabled || subInputProps.disabled}
        className={subInputProps.className}
      />
      <Input
        id={mainId}
        {...mainInputProps}
        disabled={disabled || mainInputProps.disabled}
        className={mainInputProps.className}
      />
    </div>
  );
};
