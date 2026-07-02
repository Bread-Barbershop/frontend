import { Button } from '@/components/atoms/button';
import { Label } from '@/components/atoms/label';
import { cn } from '@/shared/utils/cn';

import { ASPECT_RATIO_OPTIONS } from '../../constants/image';

interface Props {
  startCrop: (ratio: number | 'free') => void;
  disabled?: boolean;
}

export const AspectRatioSelector = ({ startCrop, disabled = false }: Props) => {
  return (
    <div
      className={cn(
        'flex-center h-11 gap-2',
        disabled && 'text-text-tertiary border-border-neutral'
      )}
    >
      <Label className="text-center font-semibold">자르기</Label>
      <div className="flex gap-1.5">
        {ASPECT_RATIO_OPTIONS.map(option => (
          <Button
            key={option.value}
            className="w-[49px] font-normal"
            disabled={disabled}
            onClick={() => startCrop(option.value as number | 'free')}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
};
