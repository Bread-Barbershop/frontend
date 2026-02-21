import { Button } from '@/components/atoms/button';
import { Label } from '@/components/atoms/label';

import { ASPECT_RATIO_OPTIONS } from '../../constants/image';

interface Props {
  startCrop: (ratio: number | 'free') => void;
}

export const AspectRatioSelector = ({ startCrop }: Props) => {
  return (
    <div className="flex-center gap-2 h-11">
      <Label>자르기</Label>
      <div className="flex gap-1.5">
        {ASPECT_RATIO_OPTIONS.map(option => (
          <Button
            key={option.value}
            className="w-[49px] font-normal"
            onClick={() => startCrop(option.value as number | 'free')}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
};
