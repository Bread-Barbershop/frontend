import React from 'react';

import { Label } from '@/components/atoms/label';
import ChipCarousel from '@/features/EmblaCarousel/Carousel/ChipCarousel';
import { cn } from '@/shared/utils/cn';

interface ButtonSelectorProps {
  label: string;
  selectorOption: { value: string; label: string }[];
  onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => void;
  className?: string;
  disabled?: boolean;
}

export const ButtonSelector = ({
  label,
  selectorOption,
  onPointerDown,
  className,
  disabled,
}: ButtonSelectorProps) => {
  return (
    <div
      className={cn(
        'flex items-center',
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
    >
      <Label>{label}</Label>
      <ChipCarousel items={selectorOption} onPointerDown={onPointerDown} />
    </div>
  );
};
