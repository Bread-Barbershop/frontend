import { Plus } from 'lucide-react';
import { ChangeEvent, forwardRef } from 'react';

import { cn } from '@/shared/utils/cn';

interface Props {
  onButtonClick: () => void;
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  size?: number;
}

export const ImageUploadButton = forwardRef<HTMLInputElement, Props>(
  ({ onButtonClick, onInputChange, size = 335 }, ref) => {
    return (
      <div
        className={cn('flex-center border border-dashed cursor-pointer')}
        style={{ width: size, height: size }}
        onClick={onButtonClick}
      >
        <Plus size={16} />
        <input
          type="file"
          accept="image/*"
          ref={ref}
          hidden
          onChange={onInputChange}
        />
      </div>
    );
  }
);

ImageUploadButton.displayName = 'ImageUploadButton';
