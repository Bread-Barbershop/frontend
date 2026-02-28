import React from 'react';

import { Image } from '@/components/atoms/image';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

interface Props {
  typeArray: string[];
  selectedId: string | null;
}

function TypePanel({ typeArray, selectedId }: Props) {
  const updateBlock = useEditorStore(state => state.updateBlock);

  const handleSelectType = (type: string) => {
    if (!selectedId) return;
    updateBlock(selectedId, { template: type });
  };
  return (
    <div className="min-h-0 flex-1 flex flex-wrap gap-3.5 content-start w-full overflow-y-auto scrollbar-hide">
      {typeArray.map((item, index) => (
        <button
          type="button"
          key={index}
          className="aspect-square relative w-40 h-40 rounded-lg border border-text-primary/5 bg-[#FAFAFB]"
          onClick={() => handleSelectType(item)}
        >
          <Image
            src={`/images/${item}.png`}
            alt={`${item} 이미지`}
            fill
            className="object-contain"
          />
        </button>
      ))}
    </div>
  );
}

export default TypePanel;
