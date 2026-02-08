import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import React from 'react';

import { cn } from '@/shared/utils/cn';

type SortableWrapperProps<T extends { id: string }> = {
  items: T[];
  className?: string;
  onChange: (items: T[]) => void;
  children: (item: T) => React.ReactNode;
};

function SortableWrapper<T extends { id: string }>({
  items,
  onChange,
  children,
  className,
}: SortableWrapperProps<T>) {
  const sensors = useSensors(useSensor(PointerSensor));
  return (
    <DndContext
      sensors={sensors}
      onDragEnd={({ active, over }) => {
        if (!over || active.id === over.id) return;

        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);

        onChange(arrayMove(items, oldIndex, newIndex));
      }}
    >
      <ul className={cn(`flex flex-col gap-3.5`, className)}>
        <SortableContext items={items.map(i => i.id)}>
          {items.map(item => children(item))}
        </SortableContext>
      </ul>
    </DndContext>
  );
}
export default SortableWrapper;
