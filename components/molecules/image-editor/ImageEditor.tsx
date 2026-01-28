import { ChevronRight } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/atoms/button';
import { Label } from '@/components/atoms/label';
import { cn } from '@/shared/utils/cn';
import { PhotoPresetOptions } from '@/widgets/mainPoster/types/fabric';

import { PHOTO_PRESETS } from './constant';

interface ImageEditorProps {
  onApply: (options: PhotoPresetOptions) => void;
}

export const ImageEditor = ({ onApply }: ImageEditorProps) => {
  const [extended, setExtended] = useState(false);

  const handleExtend = () => {
    setExtended(prev => !prev);
  };

  return (
    <div
      className={cn(
        'relative flex items-center bg-bg-base scrollbar-hide overflow-x-auto rounded-tr-lg rounded-br-lg',
        extended && 'w-fit',
        !extended && 'w-[335px]'
      )}
    >
      <Label className="min-w-[57px] text-center whitespace-nowrap">효과</Label>
      <ul className="flex px-2 gap-1.5">
        {PHOTO_PRESETS.map((preset, index) => (
          <li key={index}>
            <Button
              className="p-2 whitespace-nowrap w-fit"
              onClick={() => onApply(preset.value)}
            >
              {preset.label}
            </Button>
          </li>
        ))}
      </ul>
      <div className={cn('sticky right-0 flex-none bg-bg-base shadow-left')}>
        <button
          onClick={handleExtend}
          className={cn(
            'flex-center size-11 transition-rotate duration-300',
            extended && 'rotate-180'
          )}
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};
