'use client';
import React, { useEffect, useRef } from 'react';
import { useShallow } from 'zustand/shallow';

import { EditorCallout } from '@/components/molecules/editor-callout';
import { EditorBgmOverlay } from '@/components/organisms/bgm/components/EditorBgmOverlay';
import CalloutIcon from '@/shared/assets/icons/callout.svg';
import { blockRegistry } from '@/shared/data/registry/registry';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { useEditorCalloutStore } from '@/shared/store/useEditorCalloutStore';
import { MainPosterPreview } from '@/widgets/mainPoster/components/MainPosterPreview';

import { previewTitleVariants } from './previewTitle.style';

function Preview() {
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const blockRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const {
    block,
    selectedId,
    selectedBlock,
    setIsEdit,
    backgroundColor,
  } =
    useEditorStore(
      useShallow(state => ({
        block: state.block,
        selectedId: state.selectedId,
        selectedBlock: state.selectedBlock,
        setIsEdit: state.setIsEdit,
        backgroundColor: state.backgroundColor,
      }))
    );
  const isPreviewCalloutOpen = useEditorCalloutStore(
    state => state.callouts['preview-panel']
  );
  const isAnyCalloutOpen = useEditorCalloutStore(
    state => state.callouts['preview-panel'] || state.callouts['order-panel']
  );
  const showAllCalloutsFor = useEditorCalloutStore(
    state => state.showAllCalloutsFor
  );
  const hideAllCallouts = useEditorCalloutStore(state => state.hideAllCallouts);

  useEffect(() => {
    if (!selectedId) return;
    const el = blockRefs.current[selectedId];
    if (!el) return;

    el.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }, [selectedId, block]);

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
        <div className="overflow-y-auto h-full w-full box-border scrollbar-hide">
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
            {block.map(comp => {
              const registryItem = blockRegistry[comp.component];

              if (!registryItem.viewComponent) return null;

              const View = registryItem.viewComponent as React.ComponentType<{
                blockInfo: typeof comp;
                className: string;
                titleClassName: string;
                onClick: () => void;
              }>;
              return (
                <div
                  key={comp.id}
                  ref={el => {
                    blockRefs.current[comp.id] = el;
                  }}
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
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <EditorCallout
        targetRef={previewContainerRef}
        open={isPreviewCalloutOpen}
        arrowSide="left"
        targetAnchor={{ x: 1, y: 0.75 }}
        offset={0}
        text="변경하고 싶은 요소를 우클릭하면 편집메뉴가 나와요!"
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
