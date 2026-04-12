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
  onChange: (items: T[], event?: Event) => void;
  children: (item: T) => React.ReactNode;
  suffix?: React.ReactNode;
};

function SortableWrapper<T extends { id: string }>({
  items,
  onChange,
  children,
  className,
  suffix,
}: SortableWrapperProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );
  return (
    <DndContext
      sensors={sensors}
      onDragEnd={event => {
        const { active, over, activatorEvent } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);

        onChange(arrayMove(items, oldIndex, newIndex), activatorEvent);
      }}
    >
      <ul className={cn(`flex gap-3.5`, className)}>
        <SortableContext items={items.map(i => i.id)}>
          {items.map(item => children(item))}
        </SortableContext>
        {suffix}
      </ul>
    </DndContext>
  );
}
export default SortableWrapper;
