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
import { useShallow } from 'zustand/shallow';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

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
  return (
    <DndContext
      sensors={sensors}
      onDragEnd={handleDragEnd}
      onDragStart={handlePageSelect}
    >
      <div className="w-28 max-h-121  bg-bg-base absolute -right-43 top-1/2 -translate-y-1/2 flex flex-col items-center rounded-lg shadow-edit">
        <p className="font-semibold text-sm px-9 py-3.5">순서</p>
        <div className="h-[400px] overflow-hidden">
          <ul className="flex flex-col gap-2">
            <SortableContext
              items={block.map(b => b.id)}
              strategy={verticalListSortingStrategy}
            >
              {block.map(items => (
                <SortableItems
                  key={items.id}
                  id={items.id}
                  blockInfo={items}
                  className={`${selectedId === items.id ? 'bg-[#DBE8FC]' : ''}`}
                />
              ))}
            </SortableContext>
          </ul>
        </div>
      </div>
    </DndContext>
  );
}
export default OrderPanel;
