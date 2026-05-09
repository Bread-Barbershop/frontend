import useEmblaCarousel from 'embla-carousel-react';
// import { ChevronRight } from 'lucide-react';
// import { useState } from 'react';

import { Button } from '@/components/atoms/button';
import { Label } from '@/components/atoms/label';
import { cn } from '@/shared/utils/cn';
import { ActiveObject } from '@/widgets/mainPoster/types/fabric';

import { PHOTO_PRESETS } from './constant';
import { FilterType, PhotoPresetOptions } from './types';

interface ImageEditorProps {
  onApply: (options: PhotoPresetOptions, type: FilterType) => void;
  activeInfo: ActiveObject;
}

export const ImageEditor = ({ onApply, activeInfo }: ImageEditorProps) => {
  // const [extended, setExtended] = useState(false);
  const [emblaRef] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
  });

  // const handleExtend = () => {
  //   setExtended(prev => !prev);
  // };

  return (
    <div
      className={cn(
        'relative flex items-center bg-bg-base rounded-tr-lg rounded-br-lg z-9999 overflow-hidden',
        // extended && 'w-fit',
        // !extended && 'w-[335px]'
        'w-[335px]'
      )}
    >
      <Label className="min-w-[57px] text-center font-semibold whitespace-nowrap z-10 bg-bg-base">
        효과
      </Label>
      <div className="overflow-hidden flex-1" ref={emblaRef}>
        <ul className="flex px-2 gap-1.5 touch-pan-y">
          {PHOTO_PRESETS.map((preset, index) => (
            <li key={index} className="flex-none">
              <Button
                className="p-2 whitespace-nowrap w-fit font-normal select-none"
                onClick={() => onApply(preset.value, preset.type)}
                active={activeInfo.filters[0]?.options.type === preset.type}
              >
                {preset.label}
              </Button>
            </li>
          ))}
        </ul>
      </div>
      {/* <div className={cn('flex-none bg-bg-base shadow-left z-10')}>
        <button
          onClick={handleExtend}
          className={cn(
            'flex-center size-11 transition-rotate duration-300',
            extended && 'rotate-180'
          )}
        >
          <ChevronRight size={24} />
        </button>
      </div> */}
    </div>
  );
};
