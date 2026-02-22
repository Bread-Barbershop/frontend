import { Plus } from 'lucide-react';
import { ChangeEvent, forwardRef } from 'react';

interface Props {
  onButtonClick: () => void;
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export const ImageUploadButton = forwardRef<HTMLInputElement, Props>(
  ({ onButtonClick, onInputChange }, ref) => {
    return (
      <div
        className="flex-center size-[335px] border border-dashed cursor-pointer"
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
