import { ChevronRight } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/atoms/button';
import { Label } from '@/components/atoms/label';
import { cn } from '@/shared/utils/cn';

const PHOTO_EFFECTS = [
  {
    label: '없음',
    value: 'none',
  },
  {
    label: '안개',
    value: 'fog',
  },
  {
    label: '물결',
    value: 'wave',
  },
  {
    label: '페이퍼',
    value: 'paper',
  },
];

export const ImageEffect = ({
  onClick,
}: {
  onClick: (value: string) => void;
}) => {
  const [extended, setExtended] = useState(false);
  const [selectedEffect, setSelectedEffect] = useState('none');

  const handleExtend = () => {
    setExtended(prev => !prev);
  };

  return (
    <div
      className={cn(
        'relative flex items-center bg-bg-base scrollbar-hide overflow-x-auto rounded-tr-lg rounded-br-lg z-9999',
        extended && 'w-fit',
        !extended && 'w-[335px]'
      )}
    >
      <Label className="min-w-[57px] text-center whitespace-nowrap font-semibold">
        효과
      </Label>
      <ul className="flex px-2 gap-1.5">
        {PHOTO_EFFECTS.map((preset, index) => (
          <li key={index}>
            <Button
              className={`p-2 whitespace-nowrap w-[58px] font-normal ${selectedEffect === preset.value ? 'border-primary' : ''}`}
              onClick={() => {
                onClick(preset.value);
                setSelectedEffect(preset.value);
              }}
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
