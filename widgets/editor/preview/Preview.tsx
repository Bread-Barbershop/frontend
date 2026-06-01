'use client';
import React, { useEffect, useRef } from 'react';
import { useShallow } from 'zustand/shallow';

import { EditorBgmOverlay } from '@/components/organisms/bgm/components/EditorBgmOverlay';
import { blockRegistry } from '@/shared/data/registry/registry';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { MainPosterPreview } from '@/widgets/mainPoster/components/MainPosterPreview';

import { previewTitleVariants } from './previewTitle.style';

function Preview() {
  const blockRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const { block, selectedId, selectedBlock, setIsEdit, backgroundColor } =
    useEditorStore(
      useShallow(state => ({
        block: state.block,
        selectedId: state.selectedId,
        selectedBlock: state.selectedBlock,
        setIsEdit: state.setIsEdit,
        backgroundColor: state.backgroundColor,
      }))
    );

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
    </div>
  );
}
export default Preview;
