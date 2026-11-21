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
  placeholder,
  onChange,
  className,
  disabled,
  invalid,
  describedBy,
}: {
  label: ReactNode;
  options: readonly T[];
  value: string | null;
  placeholder?: string;
  onChange: (value: T['value']) => void;
  className?: string;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
}) {
  const id = useId();
  const selected =
    value === null
      ? null
      : (options.find(option => option.value === value) ??
        options.find(option => !option.disabled) ??
        null);

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
        placeholder={placeholder}
        onSelect={option => onChange(option.value)}
        disabled={disabled}
        invalid={invalid}
        describedBy={describedBy}
      />
    </div>
  );
}
