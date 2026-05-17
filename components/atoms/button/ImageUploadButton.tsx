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
        <p className="font-semibold text-base">
          이곳을 클릭하여 사진을 추가해주세요.
        </p>
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
