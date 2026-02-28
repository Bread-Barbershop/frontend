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
import { EmblaCarouselType } from 'embla-carousel';
import { useState } from 'react';
import { useShallow } from 'zustand/shallow';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import ChipCarousel from '@/widgets/editor/preview/components/ChipCarousel';

import ItemsButtonArea from './ItemsButtonArea';
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

  const [emblaApi, setEmblaApi] = useState<EmblaCarouselType | null>(null);
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);

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

  const handlePointerDown = (id: string) => {
    selectedBlock(id);
  };
  return (
    <DndContext
      sensors={sensors}
      onDragEnd={handleDragEnd}
      onDragStart={handlePageSelect}
    >
      <div className="w-full bg-bg-base flex flex-col items-center rounded-lg shadow-edit  ">
        <p className="font-semibold text-sm px-9 py-3.5">순서</p>
        <div className="w-full px-2 relative" ref={setPortalElement}>
          <ChipCarousel
            options={{
              align: 'start',
              axis: 'y',
              containScroll: 'trimSnaps',
              watchDrag: false,
            }}
            setEmblaApi={setEmblaApi}
            parentClassName="flex-col mb-2"
          >
            <SortableContext
              items={block.map(b => b.id)}
              strategy={verticalListSortingStrategy}
            >
              {block.map(items => (
                <div
                  key={items.id}
                  className=" relative flex"
                  onPointerDown={() => handlePointerDown(items.id)}
                >
                  <SortableItems
                    id={items.id}
                    blockInfo={items}
                    className={`w-24 ${selectedId === items.id ? 'bg-[#DBE8FC]' : ''}`}
                  />
                </div>
              ))}
            </SortableContext>
          </ChipCarousel>
          {/* 
            ItemsButtonArea를 캐러셀 외부(하지만 동일한 상대 좌표 컨테이너 안)에 Portal로 렌더링합니다.
            selectedId와 emblaApi를 전달하여 버튼이 스스로 위치를 추적하게 합니다.
          */}
          <ItemsButtonArea
            selectedId={selectedId}
            portalTarget={portalElement}
            emblaApi={emblaApi}
          />
        </div>
      </div>
    </DndContext>
  );
}

export default OrderPanel;
