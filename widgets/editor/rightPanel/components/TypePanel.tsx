'use client';

import React from 'react';
import { useShallow } from 'zustand/shallow';

import { Image } from '@/components/atoms/image';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { cn } from '@/shared/utils/cn';

interface Props {
  typeArray: string[];
  selectedId: string | null;
}

function TypePanel({ typeArray, selectedId }: Props) {
  const { updateBlock, selectedTemplate } = useEditorStore(
    useShallow(state => {
      const selectedBlock = state.block.find(block => block.id === selectedId);
      const template =
        selectedBlock?.props && 'template' in selectedBlock.props
          ? selectedBlock.props.template
          : undefined;

      return {
        updateBlock: state.updateBlock,
        selectedTemplate: typeof template === 'string' ? template : undefined,
      };
    })
  );

  const handleSelectType = (type: string) => {
    if (!selectedId) return;
    updateBlock(selectedId, { template: type });
  };

  return (
    <div className="min-h-0 flex-1 flex flex-wrap gap-3.5 content-start w-full overflow-y-auto scrollbar-hide relative">
      {typeArray.map(item => {
        const isSelected = selectedTemplate === item;

        return (
          <button
            type="button"
            key={item}
            aria-pressed={isSelected}
            className={cn(
              'aspect-square relative w-40 h-40 rounded-lg border bg-[#FAFAFB] transition-[border-color,box-shadow,background-color] duration-150',
              isSelected
                ? 'border-primary bg-white shadow-[0_0_14px_rgb(66_133_244_/_16%)]'
                : 'border-text-primary/5 hover:border-primary/30'
            )}
            onClick={() => handleSelectType(item)}
          >
            <Image
              src={`/images/${item}.png`}
              alt={`${item} 이미지`}
              fill
              className="object-contain"
            />
          </button>
        );
      })}

      <div className="flex justify-center w-full h-13 items-end sticky bottom-0 left-0 right-0  bg-linear-to-t from-white from-0% via-white/24 via-53% to-white/6 to-100%"></div>
    </div>
  );
}

export default TypePanel;
