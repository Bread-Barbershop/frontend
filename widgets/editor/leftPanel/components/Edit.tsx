'use client';
import React from 'react';
import { useShallow } from 'zustand/shallow';

import ShareUrl from '@/components/organisms/share-url/ShareUrl';
import { isBlockEnabled } from '@/shared/data/registry/blockAvailability';
import { blockRegistry } from '@/shared/data/registry/registry';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { MainPoster } from '@/widgets/mainPoster/components/MainPoster';

function Edit() {
  const { block, selectedId, isEmpty } = useEditorStore(
    useShallow(state => ({
      block: state.block.find(b => b.id === state.selectedId),
      selectedId: state.selectedId,
      isEmpty: state.block.length === 0,
    }))
  );
  if (selectedId === 'mainPoster') return <MainPoster />;
  if (selectedId === 'shareUrl') return <ShareUrl />;

  if (!block || !selectedId)
    return (
      <div className="h-203 flex-center font-semibold text-sm">
        {isEmpty && !selectedId
          ? '가운데에서 포스터를 선택해 주세요'
          : '페이지를 추가해주세요'}
      </div>
    );

  if (!isBlockEnabled(block.component)) {
    return (
      <div className="h-203 flex-center px-6 text-center text-sm text-text-secondary">
        방명록은 현재 사용할 수 없습니다. 다른 페이지를 선택해 주세요.
      </div>
    );
  }

  const EditInfo = blockRegistry[block.component]
    .editComponent as React.ComponentType<{
    blockInfo: typeof block;
    id: string;
  }>;
  return <EditInfo key={selectedId} blockInfo={block} id={selectedId} />;
}
export default Edit;
