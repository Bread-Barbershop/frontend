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
        <p className="text-base font-[500] text-black">
          <span className="font-[600] text-[#1F72EF]">이곳</span>을
          클릭하여 사진을 추가해주세요.
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
