import {
  DndContext,
  pointerWithin,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import React from 'react';

import { cn } from '@/shared/utils/cn';

type SortableWrapperProps<T extends { id: string }> = {
  items: T[];
  className?: string;
  onChange: (items: T[], event?: Event) => void;
  children: (
    item: T,
    index: number,
    moveBy: (offset: number) => void
  ) => React.ReactNode;
  vertical?: boolean;
  suffix?: React.ReactNode;
};

function SortableWrapper<T extends { id: string }>({
  items,
  onChange,
  children,
  className,
  suffix,
  vertical,
}: SortableWrapperProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );
  function moveItem(from: number, to: number, event?: Event) {
    if (from < 0 || to < 0 || to >= items.length || from === to) return;
    onChange(arrayMove(items, from, to), event);
  }
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={vertical ? pointerWithin : undefined}
      accessibility={
        vertical
          ? {
              screenReaderInstructions: {
                draggable: '위아래 방향키로 목록 순서를 변경할 수 있습니다.',
              },
            }
          : undefined
      }
      onDragEnd={event => {
        const { active, over, activatorEvent } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);

        moveItem(oldIndex, newIndex, activatorEvent);
      }}
    >
      <ul className={cn(`flex gap-3.5`, className)}>
        <SortableContext
          items={items}
          strategy={vertical ? verticalListSortingStrategy : undefined}
        >
          {items.map((item, index) =>
            children(item, index, offset => moveItem(index, index + offset))
          )}
        </SortableContext>
        {suffix}
      </ul>
    </DndContext>
  );
}
export default SortableWrapper;
