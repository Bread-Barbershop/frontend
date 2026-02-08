'use client';
import * as fabric from 'fabric';
import React from 'react';
import { useShallow } from 'zustand/shallow';

import Menubar from '@/widgets/mainPoster/components/Menubar';
import { useFabric } from '@/widgets/mainPoster/hooks/useFabric';

import { useEditorStore } from '../store/useEditorStore';
import { blockRegistry } from '../types/registry';

function Edit() {
  const { block, selectedId, canvas, activeObject } = useEditorStore(
    useShallow(state => ({
      block: state.block.find(b => b.id === state.selectedId),
      selectedId: state.selectedId,
      canvas: state.canvas,
      activeObject: state.activeObject,
    }))
  );

  const { applyRichStyle, getRichStyles } = useFabric();
  if (selectedId === 'mainPoster')
    return (
      <Menubar
        canvas={canvas}
        applyRichStyle={applyRichStyle}
        activeObject={activeObject as unknown as fabric.Textbox}
        getRichStyles={getRichStyles}
      />
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
