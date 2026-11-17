'use client';
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  type Modifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import React, { useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/shallow';

import { EditorCallout } from '@/components/molecules/editor-callout';
import { resolveScrollAnimation } from '@/components/molecules/scroll-fade-in/animationConfig';
import { ScrollFadeIn } from '@/components/molecules/scroll-fade-in/ScrollFadeIn';
import { EditorBgmOverlay } from '@/components/organisms/bgm/components/EditorBgmOverlay';
import InvitationChapter from '@/components/organisms/invitation-chapter/InvitationChapter';
import CalloutIcon from '@/shared/assets/icons/callout.svg';
import { componentCls } from '@/shared/data/componentsInfo/componentInfo';
import { isBlockEnabled } from '@/shared/data/registry/blockAvailability';
import { blockRegistry } from '@/shared/data/registry/registry';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { useEditorCalloutStore } from '@/shared/store/useEditorCalloutStore';
import { MainPosterPreview } from '@/widgets/mainPoster/components/MainPosterPreview';

import { SortablePreviewBlock } from './components/SortablePreviewBlock';
import { previewTitleVariants } from './previewTitle.style';

const blockLabels = new Map(
  componentCls.flatMap(category =>
    category.list.map(item => [item.component, item.contents] as const)
  )
);

const restrictPreviewDragToVerticalAxis: Modifier = ({ transform }) => ({
  ...transform,
  x: 0,
});

function Preview() {
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const previewScrollContainerRef = useRef<HTMLDivElement>(null);
  const blockRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const draggingRef = useRef(false);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 300, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const {
    block,
    selectedId,
    selectedBlock,
    setIsEdit,
    backgroundColor,
    moveBlock,
  } = useEditorStore(
    useShallow(state => ({
      block: state.block,
      selectedId: state.selectedId,
      selectedBlock: state.selectedBlock,
      setIsEdit: state.setIsEdit,
      backgroundColor: state.backgroundColor,
      moveBlock: state.moveBlock,
    }))
  );
  const isPreviewCalloutOpen = useEditorCalloutStore(
    state => state.callouts['preview-panel']
  );
  const visibleBlocks = block.filter(item => isBlockEnabled(item.component));
  const isAnyCalloutOpen = useEditorCalloutStore(
    state =>
      state.callouts['preview-panel'] ||
      state.callouts['order-panel'] ||
      state.callouts['add-page-button']
  );
  const showAllCalloutsFor = useEditorCalloutStore(
    state => state.showAllCalloutsFor
  );
  const hideAllCallouts = useEditorCalloutStore(state => state.hideAllCallouts);

  useEffect(() => {
    if (!selectedId || draggingRef.current) return;
    const el = blockRefs.current[selectedId];
    if (!el) return;

    el.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }, [selectedId, block]);

  const finishDrag = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const blocks = useEditorStore.getState().block;
      const from = blocks.findIndex(item => item.id === active.id);
      const to = blocks.findIndex(item => item.id === over.id);
      if (from >= 0 && to >= 0) moveBlock(from, to);
    }
    setActiveDragId(null);
    // Do not let selection scrolling fight the sortable drop animation.
    requestAnimationFrame(() => {
      draggingRef.current = false;
    });
  };

  return (
    <div
      id="preview-container"
      ref={previewContainerRef}
      className={`w-93.75 h-[812px] flex flex-col relative shrink-0`}
    >
      <EditorBgmOverlay />
      <div
        className="h-full bg-white overflow-hidden"
        style={{ backgroundColor }}
      >
        <div
          ref={previewScrollContainerRef}
          className="overflow-y-auto h-full w-full box-border scrollbar-hide"
        >
          {block.length === 0 && !selectedId && (
            <div className="absolute inset-0 z-50 bg-white flex-center flex-col font-pretendard text-base font-semibold pointer-events-none">
              <div>
                <span className="text-[#4285F4] font-bold">포스터</span>
                <span>를 먼저 선택하신 후</span>
              </div>
              <div>
                <span className="text-[#4285F4] font-bold">페이지 추가</span>
                <span>를 통해 초대장을 꾸며보세요.</span>
              </div>
            </div>
          )}
          <div className="flex flex-col min-h-full font-lineseed">
            <div
              ref={el => {
                blockRefs.current.mainPoster = el;
              }}
            >
              <MainPosterPreview />
            </div>
            <DndContext
              sensors={sensors}
              modifiers={[restrictPreviewDragToVerticalAxis]}
              autoScroll={{
                canScroll: element =>
                  element === previewScrollContainerRef.current,
              }}
              collisionDetection={closestCenter}
              onDragStart={({ active }) => {
                draggingRef.current = true;
                setActiveDragId(String(active.id));
                selectedBlock(String(active.id));
                setIsEdit(false);
              }}
              onDragEnd={finishDrag}
              onDragCancel={() => {
                draggingRef.current = false;
                setActiveDragId(null);
              }}
              accessibility={{
                screenReaderInstructions: {
                  draggable:
                    '스페이스 키로 블록을 잡고 위아래 방향키로 이동한 뒤, 스페이스 키로 놓으세요. Escape 키로 취소할 수 있어요.',
                },
              }}
            >
              <SortableContext
                items={visibleBlocks.map(item => item.id)}
                strategy={verticalListSortingStrategy}
              >
                {visibleBlocks.map(comp => {
                  const registryItem = blockRegistry[comp.component];
                  const animation = resolveScrollAnimation(comp.props);

                  if (!registryItem.viewComponent) return null;

                  const View =
                    registryItem.viewComponent as React.ComponentType<{
                      blockInfo: typeof comp;
                      className: string;
                      titleClassName: string;
                      onClick: () => void;
                    }>;
                  return (
                    <SortablePreviewBlock
                      key={comp.id}
                      id={comp.id}
                      label={blockLabels.get(comp.component) ?? '블록'}
                      selected={selectedId === comp.id}
                      backgroundColor={backgroundColor}
                      registerNode={el => {
                        blockRefs.current[comp.id] = el;
                      }}
                    >
                      <ScrollFadeIn
                        key={`${animation.animationDurationMs}-${animation.animationEasing}-${animation.animationType}-${animation.triggerMode}`}
                        {...animation}
                        {...(activeDragId
                          ? {
                              animationType: 'none',
                              className: 'transition-none',
                            }
                          : {})}
                      >
                        <InvitationChapter
                          component={comp.component}
                          collectionStyle={comp.props.collectionStyle}
                        >
                          <View
                            blockInfo={comp}
                            className={`${selectedId === comp.id ? 'ring-1 ring-inset ring-primary' : ''}`}
                            titleClassName={previewTitleVariants({
                              variant: comp.type,
                            })}
                            onClick={() => {
                              selectedBlock(comp.id);
                              setIsEdit(false);
                            }}
                          />
                        </InvitationChapter>
                      </ScrollFadeIn>
                    </SortablePreviewBlock>
                  );
                })}
              </SortableContext>
            </DndContext>
          </div>
        </div>
      </div>
      <EditorCallout
        targetRef={previewContainerRef}
        open={isPreviewCalloutOpen}
        arrowSide="left"
        targetAnchor={{ x: 1, y: 0.75 }}
        offset={0}
        text="블록을 클릭해 편집하고, 꾹 누른 채로 끌어 순서를 바꿔보세요."
      />
      <button
        type="button"
        aria-label="도움말 보기"
        className="absolute left-[-24px] top-[95%] z-[20000] flex h-8 w-8 -translate-x-full -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-black/5 bg-white text-[#111827] shadow-[0_8px_24px_0_rgb(0_0_0_/_6%),0_2px_10px_0_rgb(0_0_0_/_8%)] transition-colors enabled:hover:bg-[#FAFAFB] enabled:active:bg-[#F5F8FF]"
        onClick={event => {
          event.stopPropagation();
          if (isAnyCalloutOpen) {
            hideAllCallouts();
            return;
          }

          showAllCalloutsFor(6000);
        }}
      >
        <CalloutIcon
          width={18}
          height={18}
          className="-translate-x-px"
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
export default Preview;
