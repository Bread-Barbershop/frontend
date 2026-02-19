import Image from 'next/image';
import React, { useMemo } from 'react';

import { EditorBlock, useEditorStore } from '../../store/useEditorStore';
import { blockRegistry } from '../../types/registry';

interface Props {
  block: EditorBlock[];
  selectedId: string | null;
}

function TypePanel({ block, selectedId }: Props) {
  const selectedBlock = useMemo(
    () => block.find(b => b.id === selectedId),
    [block, selectedId]
  );
  const updateBlock = useEditorStore(state => state.updateBlock);
  if (!selectedBlock)
    return (
      <div className="flex-1 flex-center">타입이 없는 컴포넌트입니다.</div>
    );
  const typeArray = blockRegistry[selectedBlock.component].type;
  if (!typeArray)
    return (
      <div className="flex-1 flex-center">타입이 없는 컴포넌트입니다.</div>
    );
  const handleSelectType = (type: string) => {
    console.log('type', type);
    if (!selectedId) return;
    updateBlock(selectedId, { template: type });
  };
  return (
    <div className="min-h-0 flex-1 flex flex-wrap gap-3.5 content-start w-full overflow-y-auto scrollbar-hide">
      {typeArray?.map((item, index) => (
        <div
          key={index}
          className="aspect-square relative w-40 h-40 rounded-lg border border-text-tertiary"
          onClick={() => handleSelectType(item)}
        >
          <Image
            src={`/images/${item}.png`}
            alt={`${item} 이미지`}
            fill
            className="object-contain"
          />
        </div>
      ))}
    </div>
  );
}

export default TypePanel;
