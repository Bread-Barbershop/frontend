'use client';

import React, { useEffect } from 'react';
import { useShallow } from 'zustand/shallow';

import { blockRegistry } from '@/shared/data/registry/registry';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

import type { BulkJson, GuestBlock } from '../types/guestTypes';

function GuestRenderer({
  blocks,
  bulkData,
}: {
  blocks: GuestBlock[];
  bulkData: BulkJson;
}) {
  const { titleData, bodyData, isEngTitle } = bulkData;
  const { setTitleData, setBodyData, setEngTitle } = useEditorStore(
    useShallow(state => ({
      setTitleData: state.setTitleData,
      setBodyData: state.setBodyData,
      setEngTitle: state.setEngTitle,
    }))
  );
  useEffect(() => {
    setTitleData(titleData);
    setBodyData(bodyData);
    setEngTitle(isEngTitle);
  }, [setTitleData, setBodyData, setEngTitle, titleData, bodyData, isEngTitle]);
  return (
    <div className="flex flex-col">
      {blocks.map(block => {
        const registryItem =
          blockRegistry[block.component as keyof typeof blockRegistry];

        if (!registryItem) return null;

        const View = registryItem.viewComponent as React.ComponentType<{
          blockInfo: GuestBlock;
          className?: string;
        }>;

        return (
          <div key={block.id} className="w-full">
            <View blockInfo={block} className="" />
          </div>
        );
      })}
    </div>
  );
}

export default GuestRenderer;
