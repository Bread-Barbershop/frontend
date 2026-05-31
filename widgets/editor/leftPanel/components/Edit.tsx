'use client';
import React from 'react';
import { useShallow } from 'zustand/shallow';

import ShareUrl from '@/components/organisms/share-url/ShareUrl';
import { blockRegistry } from '@/shared/data/registry/registry';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { MainPoster } from '@/widgets/mainPoster/components/MainPoster';


function Edit() {
  const { block, selectedId } = useEditorStore(
    useShallow(state => ({
      block: state.block.find(b => b.id === state.selectedId),
      selectedId: state.selectedId,
    }))
  );
  if (selectedId === 'mainPoster') return <MainPoster />;
  if (selectedId === 'shareUrl') return <ShareUrl />;

  if (!block || !selectedId)
    return (
      <div className="h-203 flex-center font-semibold text-sm">
        페이지를 추가해주세요
      </div>
    );

  const EditInfo = blockRegistry[block.component]
    .editComponent as React.ComponentType<{
    blockInfo: typeof block;
    id: string;
  }>;
  return <EditInfo key={selectedId} blockInfo={block} id={selectedId} />;
}
export default Edit;
