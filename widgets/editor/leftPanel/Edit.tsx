'use client';

import React from 'react';
import { useShallow } from 'zustand/shallow';

import { useEditorStore } from '../store/useEditorStore';
import { blockRegistry } from '../types/registry';

function Edit() {
  const { block, selectedId } = useEditorStore(
    useShallow(state => ({
      block: state.block.find(b => b.id === state.selectedId),
      selectedId: state.selectedId,
    }))
  );

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
  return <EditInfo blockInfo={block} id={selectedId} />;
}
export default Edit;
