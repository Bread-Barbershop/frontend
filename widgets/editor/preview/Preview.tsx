'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/shallow';

import Add from '@/shared/assets/icons/add.svg';
import { blockRegistry } from '@/shared/data/registry/registry';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { PosterEditor } from '@/widgets/mainPoster/components/PosterEditor';

import ComponentsPopup from './components/ComponentsPopup';
import OrderPanel from './components/OrderPanel';
import UploadButton from './components/UploadButton';
// import { previewTitleVariants } from './previewTitle.style';

function Preview() {
  const [isTab, setIsTab] = useState(false);
  const tabRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tabRef.current && !tabRef.current.contains(event.target as Node)) {
        setIsTab(false);
      }
    };

    if (isTab) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isTab]);

  const handlePopClose = () => {
    setIsTab(false);
  };

  return (
    <div
      id="preview-container"
      className="w-93.75 h-218 flex flex-col  gap-4 relative"
    >
      <div className="h-203 bg-white" style={{ backgroundColor }}>
        <div className="overflow-y-auto h-full w-93.75 box-border textarea-custom-scrollbar">
          <div className="flex flex-col justify-center min-h-full">
            <PosterEditor />
            {block.map(comp => {
              const registryItem = blockRegistry[comp.component];

              if (!registryItem.viewComponent) return null;

              const View = registryItem.viewComponent as React.ComponentType<{
                blockInfo: typeof comp;
                className: string;
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
                    className={`${selectedId === comp.id ? 'border border-primary rounded-lg' : ''}`}
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
      <div className="w-28 flex flex-col gap-4 absolute -right-43 top-1/2 -translate-y-1/2 z-10">
        <OrderPanel />
        <UploadButton />
      </div>

      <div className="w-full relative" ref={tabRef}>
        {isTab && <ComponentsPopup onPopClose={handlePopClose} />}

        <button
          type="button"
          className="w-full h-11 bg-white rounded-lg shadow-edit flex-center gap-2 font-semibold"
          onClick={() => setIsTab(props => !props)}
        >
          <Add className="w-2.5 h-2.5" />
          페이지 추가
        </button>
      </div>
    </div>
  );
}
export default Preview;
