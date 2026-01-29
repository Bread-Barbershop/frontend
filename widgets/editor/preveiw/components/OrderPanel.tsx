import { DndContext, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { useEditorStore } from '../../store/useEditorStore';

import SortableItems from './SortableItems';

/*todo : 
컴포넌트 명 한글로 변경,
드래그 이벤트로 제어하기
max-h넘어가면 아래 방향 추가
클릭 하이라이트
     
*/
function OrderPanel() {
  const block = useEditorStore(state => state.block);
  const moveBlock = useEditorStore(state => state.moveBlock);
  const selectedBlock = useEditorStore(state => state.selectedBlock);
  const selectedId = useEditorStore(state => state.selectedId);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = block.findIndex(b => b.id === active.id);
    const newIndex = block.findIndex(b => b.id === over.id);
    moveBlock(oldIndex, newIndex);
  };

  const handlePageSelect = (event: DragStartEvent) => {
    const active = event.active;
    console.log('id ::::: ', active.id);
    const id = active.id as string;
    selectedBlock(id);
  };

  return (
    <DndContext onDragEnd={handleDragEnd} onDragStart={handlePageSelect}>
      <div className="w-[112px] max-h-121 overflow-y-auto bg-bg-base absolute -right-43 top-1/2 -translate-y-1/2 flex flex-col items-center rounded-lg shadow-[0_8px_24px_0_rgba(0,0,0,0.06),0_2px_10px_0_rgba(0,0,0,0.08)]">
        <p className="font-semibold text-sm px-9 py-3.5">순서</p>
        <ul className="mb-3.5 flex flex-col gap-3.5">
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
    </DndContext>
  );
}
export default OrderPanel;
