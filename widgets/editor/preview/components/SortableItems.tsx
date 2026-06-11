import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React from 'react';

import { componentCls } from '@/shared/data/componentsInfo/componentInfo';
import { EditorBlock } from '@/shared/types/block';
import { cn } from '@/shared/utils/cn';

interface Props {
  id: string;
  blockInfo: EditorBlock;
  isSelected?: boolean;
  onSelect: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, tabId: string) => void;
}

const ItemContent = React.memo(
  ({ contents }: { contents: React.ReactNode }) => {
    return <>{contents}</>;
  }
);
ItemContent.displayName = 'ItemContent';

const SortableItems = React.memo(
  ({ id, blockInfo, isSelected, onSelect, onContextMenu }: Props) => {
    const {
      setNodeRef,
      attributes,
      listeners,
      transform,
      transition,
      isDragging,
    } = useSortable({ id });

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
      <div className="relative">
        <div
          ref={setNodeRef}
          style={style}
          {...attributes}
          {...listeners}
          role="button"
          onContextMenu={e => onContextMenu(e, id)}
          onPointerDown={handlePointerDown}
          className={cn(
            'flex-center py-2 cursor-pointer rounded-sm w-24 transition-colors duration-200 select-none ',
            isSelected ? 'bg-[#DBE8FC]' : ''
          )}
        >
          <ItemContent contents={componentName?.contents} />
        </div>
      </div>
    );
  }
);

SortableItems.displayName = 'SortableItems';

export default SortableItems;
