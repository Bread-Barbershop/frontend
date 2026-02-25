'use client';

import React from 'react';

import { blockRegistry } from '@/shared/data/registry/registry';

import type { GuestBlock } from '../types/guestTypes';

/**
 * Drive thumbnail URL (guest-side)
 * - 컴포넌트에서 이제 불러오는 용도로 쓰는건데 아직 갤러리 컴포넌트 안만들었으니까 보류.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function publicDriveFileUrl(fileId: string, v?: string) {
  return `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}${
    v ? `&v=${encodeURIComponent(v)}` : ''
  }`;
}

function GuestRenderer({ blocks }: { blocks: GuestBlock[] }) {
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
