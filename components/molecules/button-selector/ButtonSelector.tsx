import React, { useState } from 'react';

import { Button } from '@/components/atoms/button';
import { Label } from '@/components/atoms/label';
import { cn } from '@/shared/utils/cn';

interface ButtonSelectorProps {
  label: string;
  selectorOption: { value: string; label: string }[];
  onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => void;
  className?: string;
}

export const ButtonSelector = ({
  label,
  selectorOption,
  onPointerDown,
  className,
}: ButtonSelectorProps) => {
  const [selectedValue, setSelectedValue] = useState(
    selectorOption[0]?.value ?? ''
  );
  return (
    <div className={cn('flex items-center', className)}>
      <Label className="font-semibold">{label}</Label>
      <div className="min-w-0 flex-1">
        <div className="flex gap-1.5">
          {selectorOption.map(item => {
            return (
              <Button
                key={item.value}
                className={`font-normal ${selectedValue === item.value ? 'border-primary' : 'border-border-neutral'}`}
                value={item.value}
                onPointerDown={e => {
                  if (onPointerDown) {
                    onPointerDown(e);
                  }
                  setSelectedValue(item.value);
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
