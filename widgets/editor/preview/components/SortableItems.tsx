import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React from 'react';

import ComponentOrder from '@/shared/assets/icons/componentOrder.svg';
import Delete from '@/shared/assets/icons/delete.svg';
import { componentCls } from '@/shared/data/componentsInfo/componentInfo';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { EditorBlock } from '@/shared/types/block';
import { cn } from '@/shared/utils/cn';

interface Props {
  id: string;
  blockInfo: EditorBlock;
  isSelected?: boolean;
  onSelect: (id: string) => void;
}

const ItemContent = React.memo(
  ({ contents }: { contents: React.ReactNode }) => {
    return <>{contents}</>;
  }
);
ItemContent.displayName = 'ItemContent';

const SortableItems = React.memo(
  ({ id, blockInfo, isSelected, onSelect }: Props) => {
    const {
      setNodeRef,
      attributes,
      listeners,
      transform,
      transition,
      isDragging,
    } = useSortable({ id });

    const deleteBlock = useEditorStore(state => state.deleteBlock);

    const array = componentCls.find(items => items.english === blockInfo.type);
    const componentName = array?.list.find(
      item => item.component === blockInfo.component
    );

    const style = {
      transform: CSS.Translate.toString(transform),
      transition,
      zIndex: isDragging ? 10 : 1,
      opacity: isDragging ? 0.5 : 1,
    };

    const handlePointerDown = (e: React.PointerEvent) => {
      onSelect(id);
      listeners?.onPointerDown?.(e);
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        role="button"
        onPointerDown={handlePointerDown}
        className={cn(
          'flex items-center justify-between group py-2 cursor-pointer rounded-sm w-24 transition-colors duration-200 list-none',
          isSelected ? 'bg-[#DBE8FC]' : ''
        )}
      >
        <ComponentOrder className="w-[13px] h-3.5 group-hover:opacity-100 opacity-0" />
        <ItemContent contents={componentName?.contents} />
        <button
          type="button"
          className={`w-3.5 h-3.5 flex-center ${isSelected ? 'opacity-100' : 'opacity-0'}`}
          onPointerDown={e => {
            e.stopPropagation();
            deleteBlock(id);
          }}
        >
          <Delete className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }
);

SortableItems.displayName = 'SortableItems';

export default SortableItems;
