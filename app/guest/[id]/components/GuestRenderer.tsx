'use client';

import React from 'react';

import { blockRegistry } from '@/shared/data/registry/registry';

import type { GuestBlock } from '../types/guestTypes';

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
