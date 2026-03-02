import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useCallback } from 'react';
import { useShallow } from 'zustand/shallow';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import ChipCarousel from '@/widgets/editor/preview/components/ChipCarousel';

import SortableItems from './SortableItems';

/*todo : 
max-h넘어가면 아래 방향 추가
     
*/

function OrderPanel() {
  const { block, moveBlock, selectedBlock, selectedId } = useEditorStore(
    useShallow(state => ({
      block: state.block,
      moveBlock: state.moveBlock,
      selectedBlock: state.selectedBlock,
      selectedId: state.selectedId,
    }))
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = block.findIndex(b => b.id === active.id);
    const newIndex = block.findIndex(b => b.id === over.id);
    moveBlock(oldIndex, newIndex);
  };

  const handlePageSelect = (event: DragStartEvent) => {
    const active = event.active;
    const id = active.id as string;
    selectedBlock(id);
  };

  const handleSelect = useCallback(
    (id: string) => {
      selectedBlock(id);
    },
    [selectedBlock]
  );

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={handleDragEnd}
      onDragStart={handlePageSelect}
    >
      <div className="w-full bg-bg-base flex flex-col items-center rounded-lg shadow-edit  ">
        <p className="font-semibold text-sm px-9 py-3.5">순서</p>
        <div className="w-full px-2 relative">
          <ChipCarousel
            options={{
              align: 'start',
              axis: 'y',
              containScroll: 'trimSnaps',
              watchDrag: false,
            }}
            parentClassName="flex-col mb-2"
          >
            <li
              className={`flex-center px-3 py-2 w-24 rounded-sm ${selectedId === 'mainPoster' ? 'bg-[#DBE8FC]' : ''}`}
              onPointerDown={() => handleSelect('mainPoster')}
            >
              포스터
            </li>
            <SortableContext
              items={block.map(b => b.id)}
              strategy={verticalListSortingStrategy}
            >
              {block.map(items => (
                <SortableItems
                  key={items.id}
                  id={items.id}
                  blockInfo={items}
                  isSelected={selectedId === items.id}
                  onSelect={handleSelect}
                />
              ))}
            </SortableContext>
          </ChipCarousel>
        </div>
      </div>
    </DndContext>
  );
}

export default OrderPanel;
