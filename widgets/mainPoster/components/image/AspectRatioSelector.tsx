import { Button } from '@/components/atoms/button';
import { Label } from '@/components/atoms/label';

import { ASPECT_RATIO_OPTIONS } from '../../constants/image';

export const AspectRatioSelector = () => {
  return (
    <div className="flex-center gap-2 h-11">
      <Label>사진비율</Label>
      <div className="flex gap-1.5">
        {ASPECT_RATIO_OPTIONS.map(option => (
          <Button key={option.value} className="w-[49px] font-normal">
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
};
