import React from 'react';

import { Label } from '@/components/atoms/label';
import ChipCarousel from '@/features/EmblaCarousel/Carousel/ChipCarousel';
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
  return (
    <div className={cn('flex items-center', className)}>
      <Label>{label}</Label>
      <ChipCarousel items={selectorOption} onPointerDown={onPointerDown} />
    </div>
  );
};
