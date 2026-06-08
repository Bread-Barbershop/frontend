import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/shallow';

import { EditorCallout } from '@/components/molecules/editor-callout';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { useEditorCalloutStore } from '@/shared/store/useEditorCalloutStore';
import ChipCarousel from '@/widgets/editor/preview/components/ChipCarousel';

import DeleteModal from './DeleteModal';
import SortableItems from './SortableItems';

/*todo : 
max-h넘어가면 아래 방향 추가
     
*/

function OrderPanel() {
  const {
    block,
    moveBlock,
    selectedBlock,
    selectedId,
    setIsEdit,
    deleteBlock,
  } = useEditorStore(
    useShallow(state => ({
      block: state.block,
      moveBlock: state.moveBlock,
      selectedBlock: state.selectedBlock,
      selectedId: state.selectedId,
      setIsEdit: state.setIsEdit,
      deleteBlock: state.deleteBlock,
    }))
  );
  const isOrderCalloutOpen = useEditorCalloutStore(
    state => state.callouts['order-panel']
  );

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDrag, setIsDrag] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { delay: 300, tolerance: 5 }, // 500ms 롱프레스
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 300, tolerance: 5 },
    })
  );
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    tabId: string;
  } | null>(null);

  // 각 탭 아이템에 연결
  const handleContextMenu = (e: React.MouseEvent, tabId: string) => {
    e.preventDefault(); // 기본 브라우저 메뉴 차단
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (containerRect) {
      setContextMenu({
        x: e.clientX - containerRect.left,
        y: e.clientY - containerRect.top,
        tabId,
      });
    }
  };

  // 메뉴 닫기 (바깥 클릭 시)
  useEffect(() => {
    const close = () => setContextMenu(null);
    if (contextMenu) {
      window.addEventListener('click', close);
      window.addEventListener('wheel', close);
      return () => {
        window.removeEventListener('click', close);
        window.removeEventListener('wheel', close);
      };
    }
  }, [contextMenu]);

  const handleDragEnd = (event: DragEndEvent) => {
    setIsDrag(false);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = block.findIndex(b => b.id === active.id);
    const newIndex = block.findIndex(b => b.id === over.id);
    moveBlock(oldIndex, newIndex);
  };

  const handlePageSelect = (event: DragStartEvent) => {
    const active = event.active;
    const id = active.id as string;
    setIsDrag(true);
    selectedBlock(id);
    setIsEdit(false);
  };

  const handleSelect = useCallback(
    (id: string) => {
      selectedBlock(id);
      setIsEdit(false);
    },
    [selectedBlock, setIsEdit]
  );

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={handleDragEnd}
      onDragStart={handlePageSelect}
    >
      <div
        ref={containerRef}
        className="relative flex flex-col items-center w-full rounded-lg bg-bg-base shadow-edit"
      >
        <p className="font-semibold text-sm px-9 py-3.5">순서</p>
        <div className="w-full px-2 relative">
          <ChipCarousel
            options={{
              align: 'start',
              axis: 'y',
              containScroll: 'trimSnaps',
              dragFree: true,
              watchDrag: !isDrag,
            }}
            parentClassName="flex-col mb-2"
            onReset={() => {
              setContextMenu(null);
            }}
          >
            <button
              type="button"
              className={`flex-center px-3 py-2 w-24 cursor-pointer rounded-sm ${selectedId === 'mainPoster' ? 'bg-[#DBE8FC]' : ''}`}
              onPointerDown={() => handleSelect('mainPoster')}
            >
              포스터
            </button>
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
                  onContextMenu={handleContextMenu}
                  onSelect={handleSelect}
                />
              ))}
            </SortableContext>
          </ChipCarousel>
        </div>
        {contextMenu && (
          <ul
            role="menu"
            style={{
              position: 'absolute',
              top: contextMenu.y,
              left: contextMenu.x,
            }}
            className="w-35 h-12 bg-bg-base flex-center z-10 rounded-sm shadow-edit"
            onContextMenu={e => e.preventDefault()}
          >
            <li
              role="button"
              onClick={e => {
                e.stopPropagation();
                setDeleteTargetId(contextMenu.tabId);
                setContextMenu(null);
              }}
              className="w-31 text-[13px] text-text-primary p-1 rounded-sm hover:bg-[#FFE8E8]"
            >
              삭제하기
            </li>
          </ul>
        )}
      </div>
      <EditorCallout
        targetRef={containerRef}
        open={isOrderCalloutOpen}
        arrowSide="bottom"
        targetAnchor={{ x: 0.5, y: 0 }}
        offset={0}
        text="우클릭으로 삭제 혹은 꾹 누른 상태로 순서를 변경할 수 있어요!"
      />
      {deleteTargetId && (
        <DeleteModal
          onDelete={() => {
            deleteBlock(deleteTargetId);
            setDeleteTargetId(null);
          }}
          setIsDeleteModal={value => !value && setDeleteTargetId(null)}
        />
      )}
    </DndContext>
  );
}

export default OrderPanel;
