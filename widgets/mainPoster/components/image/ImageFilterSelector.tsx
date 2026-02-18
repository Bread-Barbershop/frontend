import { FilterType, ImageEditor } from '@/components/molecules/image-editor';

import { ActiveObject, PhotoPresetOptions } from '../../types/fabric';

interface Props {
  onApply: (options: PhotoPresetOptions, type: FilterType) => void;
  activeInfo: ActiveObject;
}

export const ImageFilterSelector = ({ onApply, activeInfo }: Props) => {
  return (
    <div className="flex justify-center h-full">
      <div className="relative w-[335px] h-[44px]">
        <div className="absolute left-0 top-0">
          <ImageEditor onApply={onApply} activeInfo={activeInfo} />
        </div>
      </div>
    </div>
  );
};
