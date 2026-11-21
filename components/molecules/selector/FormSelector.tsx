'use client';

import { type ReactNode, useId } from 'react';

import { cn } from '@/shared/utils/cn';

import { Selector } from './Selector';

type FormOption = {
  label: string;
  value: string;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
};

export function FormSelector<T extends FormOption>({
  label,
  options,
  value,
  onChange,
  className,
  disabled,
  invalid,
  describedBy,
}: {
  label: ReactNode;
  options: readonly T[];
  value: string;
  onChange: (value: T['value']) => void;
  className?: string;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
}) {
  const id = useId();
  const selected =
    options.find(option => option.value === value) ??
    options.find(option => !option.disabled) ??
    null;

  return (
    <div className={cn('min-w-0', className)}>
      <label id={`${id}-label`} htmlFor={id}>
        {label}
      </label>
      <Selector
        triggerId={id}
        labelledBy={`${id}-label`}
        options={options}
        selected={selected}
        onSelect={option => onChange(option.value)}
        disabled={disabled}
        invalid={invalid}
        describedBy={describedBy}
      />
    </div>
  );
}
