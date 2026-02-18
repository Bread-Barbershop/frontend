import { ImageEditor } from '@/components/molecules/image-editor';

import { PhotoPresetOptions } from '../../types/fabric';

interface Props {
  onApply: (
    options: PhotoPresetOptions,
    type: 'bw' | 'warm' | 'cool' | 'fade' | 'filmGrain' | 'vignette' | null
  ) => void;
}

export const ImageFilterSelector = ({ onApply }: Props) => {
  return (
    <div className="flex justify-center h-full">
      <div className="relative w-[335px] h-[44px]">
        <div className="absolute left-0 top-0">
          <ImageEditor onApply={onApply} />
        </div>
      </div>
    </div>
  );
};
